import React, { useState, useEffect } from 'react';
import { Camera, Play, Pause, Radio, Zap, Clock } from 'lucide-react';

export default function RealTimeMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [fps, setFps] = useState(30);
  const [latency, setLatency] = useState(42);

  // 模拟实时数据更新
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setFps(28 + Math.random() * 4);
      setLatency(38 + Math.random() * 10);
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            实时监测
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            实时视频流驾驶状态分析
          </p>
        </div>
        <button
          onClick={() => setIsMonitoring(!isMonitoring)}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg ${
            isMonitoring
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          {isMonitoring ? (
            <>
              <Pause className="w-5 h-5" />
              <span>停止监测</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>开始监测</span>
            </>
          )}
        </button>
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 视频流区域 */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* LIVE 标识 */}
            {isMonitoring && (
              <div className="absolute top-4 left-4 flex items-center space-x-2 px-3 py-1.5 bg-red-600 rounded-lg z-10">
                <Radio className="w-4 h-4 text-white animate-pulse" />
                <span className="text-white text-sm font-bold">LIVE</span>
              </div>
            )}

            {/* 摄像头图标 */}
            <Camera className="w-24 h-24 text-gray-700" />

            {/* 覆盖层网格（仿监控效果） */}
            {isMonitoring && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent"></div>
                {/* 扫描线 */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent animate-pulse"></div>
              </div>
            )}

            {/* 时间戳 */}
            {isMonitoring && (
              <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/70 text-white text-xs font-mono rounded">
                {new Date().toLocaleTimeString('zh-CN', { hour12: false })}
              </div>
            )}
          </div>

          {/* 视频控制条 */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isMonitoring ? '正在监测' : '未连接'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>分辨率: 1920x1080</span>
              <span>码率: 2.5 Mbps</span>
            </div>
          </div>
        </div>

        {/* 右侧数据面板 */}
        <div className="space-y-4">
          {/* 当前状态 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              当前状态
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                  驾驶状态
                </p>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                  {isMonitoring ? '警觉状态' : '未检测'}
                </p>
                {isMonitoring && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    置信度: 87.2%
                  </p>
                )}
              </div>

              {isMonitoring && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400">表情</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Happy
                      </p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400">风险</p>
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        安全
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      活跃AU单元
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {['AU1', 'AU2', 'AU6', 'AU12'].map(au => (
                        <span
                          key={au}
                          className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 text-xs rounded font-mono"
                        >
                          {au}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 系统指标 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              系统指标
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">FPS</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                  {isMonitoring ? fps.toFixed(1) : '0'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">延迟</span>
                </div>
                <span className={`text-sm font-semibold font-mono ${
                  latency < 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {isMonitoring ? `${latency.toFixed(0)}ms` : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">模型版本</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                  v2.1
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">GPU使用</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                  {isMonitoring ? '45%' : '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* 最近警报 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              最近警报
            </h3>
            <div className="space-y-2 text-sm">
              {isMonitoring ? (
                <div className="flex items-start space-x-2 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium">正常运行</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">无异常检测</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  暂无警报
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}