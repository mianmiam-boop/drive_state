import pool from './db';
import axios from 'axios';
import fs from 'fs';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

// 创建检测记录
export const createDetectionRecord = async (
  userId: number,
  detectionType: 'image' | 'video',
  filePath: string,
  fileName: string
) => {
  const result = await pool.query(
    'INSERT INTO detection_records (user_id, detection_type, file_path, file_name) VALUES ($1, $2, $3, $4) RETURNING id',
    [userId, detectionType, filePath, fileName]
  );
  return result.rows[0].id;
};

// 调用Python疲劳检测服务
export const callPythonDetectionService = async (imagePath: string) => {
  try {
    const formData = new FormData();
    const fileStream = fs.createReadStream(imagePath);
    formData.append('file', fileStream as any);

    const response = await axios.post(
      `${PYTHON_SERVICE_URL}/api/detect/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30秒超时
      }
    );

    return response.data;
  } catch (error) {
    console.error('Python service error:', error);
    throw new Error('Fatigue detection failed');
  }
};

// 保存疲劳分析结果
export const saveAnalysisResult = async (
  detectionId: number,
  analysisData: any
) => {
  const {
    fatigue_level,
    fatigue_name,
    description,
    confidence,
    fatigue_score,
    risk_level,
    risk_color,
    recommendation,
    indicators,
    detailed_analysis
  } = analysisData;

  // 构建完整的结果JSON
  const resultJson = {
    fatigue_level,      // 0-3
    fatigue_name,       // 正常状态/轻度疲劳/中度疲劳/重度疲劳
    description,
    confidence,
    fatigue_score,      // 0-100
    risk_level,         // safe/low/medium/critical
    risk_color,         // green/yellow/orange/red
    recommendation,
    valence: indicators.valence,
    arousal: indicators.arousal,
    emotion: indicators.emotion,
    active_aus: indicators.active_aus,
    fatigue_related_aus: indicators.fatigue_related_aus,
    detailed_analysis,
    timestamp: new Date().toISOString()
  };

  const result = await pool.query(
    `INSERT INTO analysis_results 
    (detection_id, result)
    VALUES ($1, $2)
    RETURNING *`,
    [detectionId, JSON.stringify(resultJson)]
  );

  return result.rows[0];
};

// 获取用户的检测历史
export const getUserDetectionHistory = async (userId: number, limit: number = 20) => {
  const result = await pool.query(
    `SELECT 
      dr.id,
      dr.detection_type,
      dr.file_name,
      dr.status,
      dr.created_at,
      ar.result
    FROM detection_records dr
    LEFT JOIN analysis_results ar ON dr.id = ar.detection_id
    WHERE dr.user_id = $1
    ORDER BY dr.created_at DESC
    LIMIT $2`,
    [userId, limit]
  );

  // 解析result字段
  return result.rows.map(row => ({
    ...row,
    result: row.result ? JSON.parse(row.result) : null
  }));
};

// 获取检测详情
export const getDetectionDetails = async (detectionId: number) => {
  const result = await pool.query(
    `SELECT 
      dr.*,
      ar.result,
      ar.created_at as analysis_created_at
    FROM detection_records dr
    LEFT JOIN analysis_results ar ON dr.id = ar.detection_id
    WHERE dr.id = $1`,
    [detectionId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    ...row,
    result: row.result ? JSON.parse(row.result) : null
  };
};

// 获取疲劳统计数据 - 更新为4级疲劳系统
export const getFatigueStatistics = async (userId: number, days: number = 7) => {
  const result = await pool.query(
    `SELECT 
      DATE(dr.created_at) as date,
      COUNT(*) as total_detections,
      COUNT(CASE WHEN (ar.result::json->>'fatigue_level')::int = 0 THEN 1 END) as normal_count,
      COUNT(CASE WHEN (ar.result::json->>'fatigue_level')::int = 1 THEN 1 END) as mild_count,
      COUNT(CASE WHEN (ar.result::json->>'fatigue_level')::int = 2 THEN 1 END) as moderate_count,
      COUNT(CASE WHEN (ar.result::json->>'fatigue_level')::int = 3 THEN 1 END) as severe_count,
      AVG((ar.result::json->>'fatigue_score')::float) as avg_fatigue_score,
      AVG((ar.result::json->>'confidence')::float) as avg_confidence
    FROM detection_records dr
    LEFT JOIN analysis_results ar ON dr.id = ar.detection_id
    WHERE dr.user_id = $1 
      AND dr.created_at >= NOW() - INTERVAL '1 day' * $2
      AND ar.result IS NOT NULL
    GROUP BY DATE(dr.created_at)
    ORDER BY date DESC`,
    [userId, days]
  );

  return result.rows;
};

// 获取最近的高风险检测 (中度及以上)
export const getRecentHighRiskDetections = async (userId: number, limit: number = 10) => {
  const result = await pool.query(
    `SELECT 
      dr.id,
      dr.file_name,
      dr.created_at,
      ar.result
    FROM detection_records dr
    LEFT JOIN analysis_results ar ON dr.id = ar.detection_id
    WHERE dr.user_id = $1 
      AND ar.result IS NOT NULL
      AND (ar.result::json->>'fatigue_level')::int >= 2
    ORDER BY dr.created_at DESC
    LIMIT $2`,
    [userId, limit]
  );

  return result.rows.map(row => ({
    ...row,
    result: row.result ? JSON.parse(row.result) : null
  }));
};

// 获取疲劳等级分布统计
export const getFatigueLevelDistribution = async (userId: number, days: number = 7) => {
  const result = await pool.query(
    `SELECT 
      (ar.result::json->>'fatigue_level')::int as fatigue_level,
      (ar.result::json->>'fatigue_name') as fatigue_name,
      COUNT(*) as count
    FROM detection_records dr
    LEFT JOIN analysis_results ar ON dr.id = ar.detection_id
    WHERE dr.user_id = $1 
      AND dr.created_at >= NOW() - INTERVAL '1 day' * $2
      AND ar.result IS NOT NULL
    GROUP BY fatigue_level, fatigue_name
    ORDER BY fatigue_level ASC`,
    [userId, days]
  );

  return result.rows;
};

// 获取今日疲劳趋势（按小时）
export const getTodayFatigueTrend = async (userId: number) => {
  const result = await pool.query(
    `SELECT 
      EXTRACT(HOUR FROM dr.created_at) as hour,
      COUNT(*) as total_count,
      AVG((ar.result::json->>'fatigue_score')::float) as avg_fatigue_score,
      COUNT(CASE WHEN (ar.result::json->>'fatigue_level')::int >= 2 THEN 1 END) as high_risk_count
    FROM detection_records dr
    LEFT JOIN analysis_results ar ON dr.id = ar.detection_id
    WHERE dr.user_id = $1 
      AND DATE(dr.created_at) = CURRENT_DATE
      AND ar.result IS NOT NULL
    GROUP BY hour
    ORDER BY hour ASC`,
    [userId]
  );

  return result.rows;
};