import React, { useState, useRef } from 'react';
import { Upload, FileImage, Video, X, Play, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

interface DetectionResult {
  success: boolean;
  fatigue_level: number;
  fatigue_name: string;
  description: string;
  risk_level: string;
  risk_color: string;
  recommendation: string;
  confidence: number;
  fatigue_score: number;
  indicators: {
    valence: number;
    arousal: number;
    emotion: string;
    active_aus: string[];
    fatigue_related_aus: string[];
  };
  detailed_analysis: string;
  timestamp?: string;
}

type DetectionMode = 'image' | 'video';

export default function UploadDetection() {
  const { token } = useAuthStore();
  const [mode, setMode] = useState<DetectionMode>('image');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // 检查文件大小
      const maxSize = mode === 'image' ? 50 : 200; // MB
      if (selectedFile.size > maxSize * 1024 * 1024) {
        setError(`文件大小超过${maxSize}MB限制`);
        return;
      }
      
      // 检查文件类型
      const isImage = selectedFile.type.startsWith('image/');
      const isVideo = selectedFile.type.startsWith('video/');
      
      if (mode === 'image' && !isImage) {
        setError('请上传图片文件');
        return;
      }
      
      if (mode === 'video' && !isVideo) {
        setError('请上传视频文件');
        return;
      }
      
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
      setResult(null);
      setError(null);
    }
  };

  const handleDetect = async () => {
    if (!file) return;
    
    setDetecting(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    const endpoint = mode === 'image' ? '/api/detect/image' : '/api/detect/video';
    const timeout = mode === 'image' ? 30000 : 120000; // 图片30秒，视频2分钟

    try {
      const response = await axios.post(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout
      });
      
      if (response.data?.success) {
        setResult(response.data);
      } else {
        setError('检测失败，请重试');
      }
    } catch (err: any) {
      console.error('检测失败:', err);
      if (err.code === 'ECONNABORTED') {
        setError(`检测超时，${mode === 'image' ? '图片' : '视频'}文件可能过大`);
      } else if (err.response?.status === 401) {
        setError('未授权，请重新登录');
      } else if (err.response?.status === 404) {
        setError(`检测接口不存在，请确认后端服务已启动，API地址：${endpoint}`);
      } else {
        setError(err.response?.data?.error || err.message || '检测失败，请检查服务是否正常运行');
      }
    } finally {
      setDetecting(false);
    }
  };

  const clearFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const switchMode = (newMode: DetectionMode) => {
    if (mode !== newMode) {
      clearFile();
      setMode(newMode);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${mode}_detection_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 顶部标题栏 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">上传检测</h2>
            <p className="text-sm text-gray-500 mt-0.5">上传图片或视频进行疲劳检测分析</p>
          </div>
        </div>
      </div>

      {/* 模式切换标签 */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex space-x-2">
          <button
            onClick={() => switchMode('image')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              mode === 'image'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileImage className="w-4 h-4" />
            <span>图片检测</span>
          </button>
          <button
            onClick={() => switchMode('video')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              mode === 'video'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>视频检测</span>
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* 左侧：上传区域 */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700">
                  {mode === 'image' ? '上传图片' : '上传视频'}
                </h3>
              </div>

              {!preview ? (
                <label className="block p-8 cursor-pointer">
                  <input
                    type="file"
                    accept={mode === 'image' ? 'image/*' : 'video/*'}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      点击上传或拖拽{mode === 'image' ? '图片' : '视频'}到此处
                    </p>
                    <p className="text-xs text-gray-500">
                      {mode === 'image' 
                        ? '支持 JPG, PNG 格式，最大 50MB'
                        : '支持 MP4, AVI, MOV 格式，最大 200MB'
                      }
                    </p>
                  </div>
                </label>
              ) : (
                <div className="p-4">
                  <div className="relative bg-black rounded-xl overflow-hidden mb-4">
                    {mode === 'image' ? (
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="w-full h-auto max-h-96 object-contain mx-auto" 
                      />
                    ) : (
                      <video
                        ref={videoRef}
                        src={preview}
                        controls
                        className="w-full h-auto max-h-96 object-contain mx-auto"
                      />
                    )}
                    <button
                      onClick={clearFile}
                      className="absolute top-3 right-3 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* 文件信息 */}
                  {file && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">文件名：</span>
                          <span className="text-gray-900 break-all">{file.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">大小：</span>
                          <span className="text-gray-900">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleDetect}
                    disabled={detecting}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-all flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                  >
                    {detecting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>正在分析{mode === 'image' ? '图片' : '视频'}...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        <span>开始检测</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* 使用说明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">使用说明</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                {mode === 'image' ? (
                  <>
                    <li>• 请上传清晰的驾驶员正面照片</li>
                    <li>• 确保面部特征清晰可见</li>
                    <li>• 支持多种光线条件下的图像</li>
                    <li>• 检测通常在3-5秒内完成</li>
                    <li>• 建议图像分辨率不低于640×480</li>
                  </>
                ) : (
                  <>
                    <li>• 支持常见视频格式（MP4, AVI, MOV等）</li>
                    <li>• 视频时长建议在10分钟以内</li>
                    <li>• 确保视频中驾驶员面部清晰可见</li>
                    <li>• 检测时间根据视频长度而定</li>
                    <li>• 建议视频分辨率不低于720p</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* 右侧：检测结果 */}
          <div>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">检测结果</h3>
                {result && (
                  <button
                    onClick={downloadResult}
                    className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下载结果</span>
                  </button>
                )}
              </div>

              {!result ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {mode === 'image' ? (
                      <FileImage className="w-8 h-8 text-gray-400" />
                    ) : (
                      <Video className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">等待检测结果...</p>
                  <p className="text-xs text-gray-400 mt-2">
                    上传{mode === 'image' ? '图片' : '视频'}并点击"开始检测"
                  </p>
                </div>
              ) : (
                <ResultDisplay result={result} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 结果展示组件
function ResultDisplay({ result }: { result: DetectionResult }) {
  const getLevelConfig = (level: number) => {
    const configs = {
      0: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, barColor: 'bg-green-500' },
      1: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertTriangle, barColor: 'bg-yellow-500' },
      2: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertTriangle, barColor: 'bg-orange-500' },
      3: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, barColor: 'bg-red-600' },
    };
    return configs[level as keyof typeof configs];
  };

  const config = getLevelConfig(result.fatigue_level);
  const StatusIcon = config.icon;

  return (
    <div className="p-6 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
      {/* 主状态卡片 */}
      <div className={`p-4 ${config.bg} border ${config.border} rounded-lg`}>
        <div className="flex items-start space-x-3">
          <StatusIcon className={`w-6 h-6 ${config.color} mt-0.5 flex-shrink-0`} />
          <div className="flex-1">
            <div className="flex items-baseline space-x-2 mb-1">
              <h4 className={`text-lg font-semibold ${config.color}`}>{result.fatigue_name}</h4>
              <span className="text-xs text-gray-500">等级 {result.fatigue_level}</span>
            </div>
            <p className="text-sm text-gray-700">{result.description}</p>
          </div>
        </div>
      </div>

      {/* 疲劳评分 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">疲劳综合评分</span>
          <span className="font-semibold text-gray-900">
            {result.fatigue_score.toFixed(1)}<span className="text-gray-500">/100</span>
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${config.barColor}`}
            style={{ width: `${result.fatigue_score}%` }}
          />
        </div>
      </div>

      {/* 建议 */}
      <div className={`p-3 border-l-4 ${config.border} bg-gray-50 rounded`}>
        <p className="text-xs text-gray-600 mb-1">安全建议</p>
        <p className="text-sm text-gray-700 font-medium">{result.recommendation}</p>
      </div>

      {/* 详细指标 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">置信度</p>
          <p className="text-lg font-semibold text-gray-900">{(result.confidence * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">表情识别</p>
          <p className="text-lg font-semibold text-gray-900">{result.indicators.emotion}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">情绪效价</p>
          <p className="text-lg font-mono text-gray-900">{result.indicators.valence.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">觉醒程度</p>
          <p className="text-lg font-mono text-gray-900">{result.indicators.arousal.toFixed(2)}</p>
        </div>
      </div>

      {/* AU单元 */}
      {result.indicators.fatigue_related_aus.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-2">疲劳相关AU单元</p>
          <div className="flex flex-wrap gap-2">
            {result.indicators.fatigue_related_aus.map(au => (
              <span
                key={au}
                className="px-2.5 py-1 bg-red-50 border border-red-200 rounded text-xs font-mono text-red-700"
              >
                {au}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 详细分析 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-900 font-medium mb-1">详细分析报告</p>
        <p className="text-xs text-blue-800 leading-relaxed">{result.detailed_analysis}</p>
      </div>

      {/* 时间戳 */}
      {result.timestamp && (
        <div className="text-center text-xs text-gray-400">
          检测时间: {new Date(result.timestamp).toLocaleString('zh-CN')}
        </div>
      )}
    </div>
  );
}