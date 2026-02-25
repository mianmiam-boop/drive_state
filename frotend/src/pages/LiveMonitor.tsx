import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, AlertTriangle, CheckCircle, Activity, Eye } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

interface LiveDetectionResult {
  success: boolean;
  fatigue_level: number;
  fatigue_name: string;
  fatigue_score: number;
  confidence: number;
  risk_level: string;
  risk_color: string;
  indicators: {
    valence: number;
    arousal: number;
    emotion: string;
    fatigue_related_aus: string[];
  };
  recommendation: string;
  timestamp?: string;
}

export default function LiveMonitor() {
  const { token } = useAuthStore();
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResult, setCurrentResult] = useState<LiveDetectionResult | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 启动摄像头
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 1280, 
          height: 720,
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError(null);
        
        // 等待视频加载后开始检测
        videoRef.current.onloadedmetadata = () => {
          startDetection();
        };
      }
    } catch (error) {
      console.error('摄像头启动失败:', error);
      setError('无法访问摄像头，请检查权限设置');
    }
  };

  // 停止摄像头
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    setIsStreaming(false);
    setCurrentResult(null);
    setError(null);
  };

  // 开始检测循环
  const startDetection = () => {
    // 每2秒检测一次
    detectionIntervalRef.current = setInterval(() => {
      captureAndDetect();
    }, 2000);
  };

  // 捕获画面并检测
  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return;
    
    // 设置画布尺寸
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // 绘制当前帧
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 转换为 blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      setDetecting(true);
      
      try {
        // 创建 FormData
        const formData = new FormData();
        formData.append('file', blob, 'frame.jpg');
        
        // 调用检测API
        const response = await axios.post('/api/detect/image', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 5000
        });
        
        if (response.data?.success) {
          setCurrentResult(response.data);
          setError(null);
          
          // 绘制面部检测区域（模拟）
          drawFaceRegion(ctx, canvas.width, canvas.height);
        }
      } catch (err: any) {
        console.error('检测失败:', err);
        // 不显示错误，避免频繁提示
      } finally {
        setDetecting(false);
      }
    }, 'image/jpeg', 0.8);
  };

  // 绘制面部检测区域
  const drawFaceRegion = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!faceCanvasRef.current) return;
    
    const faceCanvas = faceCanvasRef.current;
    const faceCtx = faceCanvas.getContext('2d');
    if (!faceCtx) return;
    
    // 模拟面部区域（中心区域）
    const faceWidth = width * 0.4;
    const faceHeight = height * 0.5;
    const faceX = (width - faceWidth) / 2;
    const faceY = (height - faceHeight) / 2;
    
    // 设置面部画布尺寸
    faceCanvas.width = faceWidth;
    faceCanvas.height = faceHeight;
    
    // 从主画布复制面部区域
    if (canvasRef.current) {
      faceCtx.drawImage(
        canvasRef.current,
        faceX, faceY, faceWidth, faceHeight,
        0, 0, faceWidth, faceHeight
      );
    }
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const getLevelConfig = (level: number) => {
    const configs = {
      0: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, barColor: 'bg-green-500' },
      1: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertTriangle, barColor: 'bg-yellow-500' },
      2: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertTriangle, barColor: 'bg-orange-500' },
      3: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, barColor: 'bg-red-600' },
    };
    return configs[level as keyof typeof configs];
  };

  const config = currentResult ? getLevelConfig(currentResult.fatigue_level) : null;
  const StatusIcon = config?.icon;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 顶部标题栏 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">实时监测</h2>
            <p className="text-sm text-gray-500 mt-0.5">Live Fatigue Detection</p>
          </div>
          <div className="flex items-center space-x-3">
            {isStreaming && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 font-medium">监测中</span>
              </div>
            )}
            {detecting && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-blue-700">检测中...</span>
              </div>
            )}
            <button
              onClick={isStreaming ? stopCamera : startCamera}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isStreaming
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isStreaming ? (
                <>
                  <CameraOff className="w-4 h-4" />
                  <span>停止监测</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>开始监测</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* 主内容区 */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-3 gap-6 h-full">
          {/* 左侧：摄像头画面 (2/3宽度) */}
          <div className="col-span-2 space-y-4">
            {/* 主摄像头画面 */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm h-[calc(100%-180px)]">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">摄像头画面</h3>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Camera className="w-3.5 h-3.5" />
                    <span>1280 × 720</span>
                  </div>
                </div>
              </div>
              <div className="relative bg-black h-[calc(100%-49px)]">
                {!isStreaming ? (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <CameraOff className="w-16 h-16 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">点击"开始监测"启动摄像头</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </>
                )}
              </div>
            </div>

            {/* 面部检测小窗 */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm h-[160px]">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700">面部检测区域</h3>
              </div>
              <div className="relative bg-black h-[calc(100%-49px)]">
                {!isStreaming ? (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Eye className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">等待面部检测</p>
                    </div>
                  </div>
                ) : (
                  <canvas
                    ref={faceCanvasRef}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 右侧：检测数据 (1/3宽度) */}
          <div className="space-y-4">
            {currentResult && config && StatusIcon ? (
              <>
                {/* 疲劳状态卡片 */}
                <div className={`bg-white border ${config.border} rounded-xl overflow-hidden shadow-sm`}>
                  <div className={`px-4 py-3 ${config.bg} border-b ${config.border}`}>
                    <div className="flex items-center space-x-2">
                      <StatusIcon className={`w-5 h-5 ${config.color}`} />
                      <h3 className={`text-sm font-semibold ${config.color}`}>当前状态</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="mb-4">
                      <div className="flex items-baseline space-x-2 mb-1">
                        <span className={`text-2xl font-bold ${config.color}`}>
                          {currentResult.fatigue_name}
                        </span>
                        <span className="text-sm text-gray-500">L{currentResult.fatigue_level}</span>
                      </div>
                      <p className="text-xs text-gray-600">{currentResult.recommendation}</p>
                    </div>

                    {/* 疲劳分数 */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span>疲劳评分</span>
                        <span className="font-mono font-semibold">{currentResult.fatigue_score.toFixed(1)}/100</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${config.barColor}`}
                          style={{ width: `${currentResult.fatigue_score}%` }}
                        />
                      </div>
                    </div>

                    {/* 置信度 */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <span className="text-xs text-gray-600">检测置信度</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {(currentResult.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 详细指标 */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-700">实时指标</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">表情识别</span>
                      <span className="text-sm font-medium text-gray-900">{currentResult.indicators.emotion}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">情绪效价</span>
                      <span className="text-sm font-mono text-gray-900">{currentResult.indicators.valence.toFixed(3)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">觉醒程度</span>
                      <span className="text-sm font-mono text-gray-900">{currentResult.indicators.arousal.toFixed(3)}</span>
                    </div>
                  </div>
                </div>

                {/* AU单元 */}
                {currentResult.indicators.fatigue_related_aus.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-sm font-medium text-gray-700">疲劳AU单元</h3>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {currentResult.indicators.fatigue_related_aus.map(au => (
                          <span
                            key={au}
                            className="px-2.5 py-1 bg-red-50 border border-red-200 rounded text-xs font-mono text-red-700"
                          >
                            {au}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 时间戳 */}
                <div className="text-center">
                  <p className="text-xs text-gray-400">
                    最后更新: {currentResult.timestamp ? new Date(currentResult.timestamp).toLocaleTimeString('zh-CN') : new Date().toLocaleTimeString('zh-CN')}
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">等待检测数据...</p>
                <p className="text-xs text-gray-400 mt-2">启动摄像头后将自动检测</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}