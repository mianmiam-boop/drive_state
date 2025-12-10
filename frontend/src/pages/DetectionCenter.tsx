import React, { useState } from 'react';
import { Upload, FileImage, Video, Play, X, Activity } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

interface DetectionResult {
  state: string;
  riskLevel: string;
  confidence: number;
  emotion: string;
  emotionConfidence: number;
  valence: number;
  arousal: number;
  activeAUs: string[];
  recommendation: string;
  timestamp: string;
}

export default function DetectionCenter() {
  const { token } = useAuthStore();
  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => setPreview(event.target.result as string);
      reader.readAsDataURL(selectedFile);
      setResult(null);
    }
  };

  const handleDetect = async () => {
    if (!file) return;
    
    setDetecting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/detect/image', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data);
    } catch (error) {
      console.error('检测失败:', error);
      alert('检测失败，请重试');
    } finally {
      setDetecting(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">检测中心</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          上传图像或视频进行驾驶状态分析
        </p>
      </div>

      {/* 模式切换 */}
      <div className="flex space-x-3">
        <button
          onClick={() => setMode('image')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg border font-medium transition-all ${
            mode === 'image'
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-500'
          }`}
        >
          <FileImage className="w-5 h-5" />
          <span>图像检测</span>
        </button>
        <button
          onClick={() => setMode('video')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg border font-medium transition-all ${
            mode === 'video'
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-500'
          }`}
        >
          <Video className="w-5 h-5" />
          <span>视频检测</span>
        </button>
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 上传区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-emerald-500" />
            上传{mode === 'image' ? '图像' : '视频'}
          </h3>

          {!preview ? (
            <label className="block">
              <input
                type="file"
                accept={mode === 'image' ? 'image/*' : 'video/*'}
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-emerald-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                <FileImage className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                  点击上传或拖拽文件到此处
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  支持 {mode === 'image' ? 'JPG, PNG' : 'MP4, AVI'} 格式，最大 50MB
                </p>
              </div>
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-xl overflow-hidden">
                <img src={preview} alt="Preview" className="w-full h-auto" />
                <button
                  onClick={clearFile}
                  className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <button
                onClick={handleDetect}
                disabled={detecting}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
              >
                {detecting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>分析中...</span>
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

        {/* 检测结果 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-emerald-500" />
            检测结果
          </h3>

          {!result ? (
            <div className="h-96 flex items-center justify-center text-gray-400 dark:text-gray-600">
              <div className="text-center">
                <Activity className="w-20 h-20 mx-auto mb-4 opacity-20" />
                <p>等待检测结果...</p>
              </div>
            </div>
          ) : (
            <ResultDisplay result={result} />
          )}
        </div>
      </div>
    </div>
  );
}

// 结果展示组件
function ResultDisplay({ result }: { result: DetectionResult }) {
  const getRiskColor = (level: string) => {
    const colors = {
      safe: 'from-emerald-500 to-teal-500',
      medium: 'from-amber-500 to-yellow-500',
      high: 'from-orange-500 to-red-500',
      critical: 'from-red-600 to-rose-600'
    };
    return colors[level as keyof typeof colors] || colors.safe;
  };

  const getRiskBorder = (level: string) => {
    const colors = {
      safe: 'border-l-emerald-500',
      medium: 'border-l-amber-500',
      high: 'border-l-orange-500',
      critical: 'border-l-red-500'
    };
    return colors[level as keyof typeof colors] || colors.safe;
  };

  return (
    <div className="space-y-4">
      {/* 主状态卡片 */}
      <div className={`p-4 bg-gradient-to-r ${getRiskColor(result.riskLevel)} rounded-xl border-l-4 ${getRiskBorder(result.riskLevel)}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-bold text-xl">{result.state}</span>
          <span className="text-white/90 text-sm">
            置信度 {(result.confidence * 100).toFixed(1)}%
          </span>
        </div>
        <p className="text-white/95 text-sm">{result.recommendation}</p>
      </div>

      {/* 详细指标 */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="表情" value={result.emotion} subValue={`${(result.emotionConfidence * 100).toFixed(1)}%`} />
        <MetricCard label="风险等级" value={result.riskLevel.toUpperCase()} />
        <MetricCard label="效价值" value={result.valence.toFixed(3)} />
        <MetricCard label="觉醒度" value={result.arousal.toFixed(3)} />
      </div>

      {/* AU单元 */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">
          激活的动作单元 (AU)
        </h4>
        <div className="flex flex-wrap gap-2">
          {result.activeAUs.map(au => (
            <span
              key={au}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded text-blue-700 dark:text-blue-400 text-xs font-mono"
            >
              {au}
            </span>
          ))}
        </div>
      </div>

      {/* 时间戳 */}
      <div className="text-xs text-gray-500 dark:text-gray-600 text-right">
        {result.timestamp}
      </div>
    </div>
  );
}

function MetricCard({ label, value, subValue }: { label: string; value: string; subValue?: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      {subValue && <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subValue}</p>}
    </div>
  );
}