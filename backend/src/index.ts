import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  generateToken,
  verifyToken,
  registerUser,
  loginUser
} from './auth';
import {
  createDetectionRecord,
  callPythonDetectionService,
  saveAnalysisResult,
  getUserDetectionHistory,
  getDetectionDetails,
} from './detection';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(express.json());
app.use(cors());

// 文件上传配置
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800') },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'video/mp4', 'video/mpeg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// 身份验证中间件
const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  (req as any).userId = (decoded as any).userId;
  next();
};

// ============ 认证路由 ============

// 用户注册
app.post('/api/auth/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, fullName } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result = await registerUser(username, email, password, fullName);

    if (result.success) {
      const token = generateToken(result.user.id);
      res.json({ success: true, token, user: result.user });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: 'Registration error' });
  }
});

// 用户登录
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result = await loginUser(email, password);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Login error' });
  }
});

// ============ 检测路由 ============

// 上传图片检测
app.post(
  '/api/detect/image',
  authMiddleware,
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const userId = (req as any).userId;
      const filePath = req.file.path;
      const fileName = req.file.originalname;

      // 创建检测记录
      const detectionId = await createDetectionRecord(
        userId,
        'image',
        filePath,
        fileName
      );

      // 调用Python模型
      const detectionResult = await callPythonDetectionService(filePath);

      // 保存分析结果
      const analysisResult = await saveAnalysisResult(detectionId, detectionResult);

      res.json({
        success: true,
        detectionId,
        analysisResult,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Detection failed' });
    }
  }
);

// 上传视频检测
app.post(
  '/api/detect/video',
  authMiddleware,
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const userId = (req as any).userId;
      const filePath = req.file.path;
      const fileName = req.file.originalname;

      // 创建检测记录
      const detectionId = await createDetectionRecord(
        userId,
        'video',
        filePath,
        fileName
      );

      // 这里可以启动后台视频处理任务
      // 对于简化版，我们这里仅返回处理中状态

      res.json({
        success: true,
        detectionId,
        status: 'processing',
        message: 'Video processing started',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Video upload failed' });
    }
  }
);

// 获取检测历史
app.get('/api/history', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const limit = parseInt(req.query.limit as string) || 20;

    const history = await getUserDetectionHistory(userId, limit);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// 获取检测详情
app.get(
  '/api/detection/:id',
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const detectionId = parseInt(req.params.id);
      const details = await getDetectionDetails(detectionId);

      if (!details) {
        res.status(404).json({ error: 'Detection not found' });
        return;
      }

      res.json({ success: true, data: details });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch details' });
    }
  }
);

// 健康检查
app.get('/health', (req: Request, res: Response): void => {
  res.json({ status: 'ok' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});