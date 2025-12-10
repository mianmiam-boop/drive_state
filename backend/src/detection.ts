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

// 调用Python模型进行检测
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
      }
    );

    return response.data;
  } catch (error) {
    console.error('Python service error:', error);
    throw new Error('Detection failed');
  }
};

// 保存分析结果
export const saveAnalysisResult = async (
  detectionId: number,
  analysisData: any
) => {
  const {
    emotion,
    emotion_confidence,
    valence,
    arousal,
    active_aus,
    driving_state,
    driving_state_confidence,
    risk_level,
    risk_color,
    recommendation,
    details,
  } = analysisData;

  const result = await pool.query(
    `INSERT INTO analysis_results 
    (detection_id, emotion, emotion_confidence, valence, arousal, active_aus, au_count, 
     driving_state, driving_state_confidence, risk_level, risk_color, recommendation, analysis_details)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *`,
    [
      detectionId,
      emotion,
      emotion_confidence,
      valence,
      arousal,
      active_aus,
      active_aus?.length || 0,
      driving_state,
      driving_state_confidence,
      risk_level,
      risk_color,
      recommendation,
      JSON.stringify(details),
    ]
  );

  return result.rows[0];
};

// 获取用户的检测历史
export const getUserDetectionHistory = async (userId: number, limit: number = 20) => {
  const result = await pool.query(
    `SELECT dr.*, ar.driving_state, ar.risk_level, ar.risk_color, ar.emotion
    FROM detection_records dr
    LEFT JOIN analysis_results ar ON dr.id = ar.detection_id
    WHERE dr.user_id = $1
    ORDER BY dr.created_at DESC
    LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
};

// 获取检测详情
export const getDetectionDetails = async (detectionId: number) => {
  const result = await pool.query(
    `SELECT dr.*, ar.*
    FROM detection_records dr
    LEFT JOIN analysis_results ar ON dr.id = ar.detection_id
    WHERE dr.id = $1`,
    [detectionId]
  );
  return result.rows[0];
};