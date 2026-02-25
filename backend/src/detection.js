"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDetectionDetails = exports.getUserDetectionHistory = exports.saveAnalysisResult = exports.callPythonDetectionService = exports.createDetectionRecord = void 0;
const db_1 = __importDefault(require("./db"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';
// 创建检测记录
const createDetectionRecord = async (userId, detectionType, filePath, fileName) => {
    const result = await db_1.default.query('INSERT INTO detection_records (user_id, detection_type, file_path, file_name) VALUES ($1, $2, $3, $4) RETURNING id', [userId, detectionType, filePath, fileName]);
    return result.rows[0].id;
};
exports.createDetectionRecord = createDetectionRecord;
// 调用Python模型进行检测
const callPythonDetectionService = async (imagePath) => {
    try {
        const formData = new FormData();
        const fileStream = fs_1.default.createReadStream(imagePath);
        formData.append('file', fileStream);
        const response = await axios_1.default.post(`${PYTHON_SERVICE_URL}/api/detect/image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    catch (error) {
        console.error('Python service error:', error);
        throw new Error('Detection failed');
    }
};
exports.callPythonDetectionService = callPythonDetectionService;
// 保存分析结果
const saveAnalysisResult = async (detectionId, analysisData) => {
    const { emotion, emotion_confidence, valence, arousal, active_aus, driving_state, driving_state_confidence, risk_level, risk_color, recommendation, details, } = analysisData;
    const result = await db_1.default.query(`INSERT INTO analysis_results 
    (detection_id, emotion, emotion_confidence, valence, arousal, active_aus, au_count, 
     driving_state, driving_state_confidence, risk_level, risk_color, recommendation, analysis_details)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *`, [
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
    ]);
    return result.rows[0];
};
exports.saveAnalysisResult = saveAnalysisResult;
// 获取用户的检测历史
const getUserDetectionHistory = async (userId, limit = 20) => {
    const result = await db_1.default.query(`SELECT dr.*, ar.driving_state, ar.risk_level, ar.risk_color, ar.emotion
    FROM detection_records dr
    LEFT JOIN analysis_results ar ON dr.id = ar.detection_id
    WHERE dr.user_id = $1
    ORDER BY dr.created_at DESC
    LIMIT $2`, [userId, limit]);
    return result.rows;
};
exports.getUserDetectionHistory = getUserDetectionHistory;
// 获取检测详情
const getDetectionDetails = async (detectionId) => {
    const result = await db_1.default.query(`SELECT dr.*, ar.*
    FROM detection_records dr
    LEFT JOIN analysis_results ar ON dr.id = ar.detection_id
    WHERE dr.id = $1`, [detectionId]);
    return result.rows[0];
};
exports.getDetectionDetails = getDetectionDetails;
//# sourceMappingURL=detection.js.map