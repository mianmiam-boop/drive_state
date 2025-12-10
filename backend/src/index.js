"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("./auth");
const detection_1 = require("./detection");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// 中间件
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// 文件上传配置
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800') },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'video/mp4', 'video/mpeg'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type'));
        }
    },
});
// 身份验证中间件
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = (0, auth_1.verifyToken)(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    req.userId = decoded.userId;
    next();
};
// ============ 认证路由 ============
// 用户注册
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const result = await (0, auth_1.registerUser)(username, email, password, fullName);
        if (result.success) {
            const token = (0, auth_1.generateToken)(result.user.id);
            res.json({ success: true, token, user: result.user });
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Registration error' });
    }
});
// 用户登录
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const result = await (0, auth_1.loginUser)(email, password);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Login error' });
    }
});
// ============ 检测路由 ============
// 上传图片检测
app.post('/api/detect/image', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const userId = req.userId;
        const filePath = req.file.path;
        const fileName = req.file.originalname;
        // 创建检测记录
        const detectionId = await (0, detection_1.createDetectionRecord)(userId, 'image', filePath, fileName);
        // 调用Python模型
        const detectionResult = await (0, detection_1.callPythonDetectionService)(filePath);
        // 保存分析结果
        const analysisResult = await (0, detection_1.saveAnalysisResult)(detectionId, detectionResult);
        res.json({
            success: true,
            detectionId,
            analysisResult,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Detection failed' });
    }
});
// 上传视频检测
app.post('/api/detect/video', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const userId = req.userId;
        const filePath = req.file.path;
        const fileName = req.file.originalname;
        // 创建检测记录
        const detectionId = await (0, detection_1.createDetectionRecord)(userId, 'video', filePath, fileName);
        // 这里可以启动后台视频处理任务
        // 对于简化版，我们这里仅返回处理中状态
        res.json({
            success: true,
            detectionId,
            status: 'processing',
            message: 'Video processing started',
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Video upload failed' });
    }
});
// 获取检测历史
app.get('/api/history', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const limit = parseInt(req.query.limit) || 20;
        const history = await (0, detection_1.getUserDetectionHistory)(userId, limit);
        res.json({ success: true, data: history });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});
// 获取检测详情
app.get('/api/detection/:id', authMiddleware, async (req, res) => {
    try {
        const detectionId = parseInt(req.params.id);
        const details = await (0, detection_1.getDetectionDetails)(detectionId);
        if (!details) {
            return res.status(404).json({ error: 'Detection not found' });
        }
        res.json({ success: true, data: details });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch details' });
    }
});
// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map