import React from 'react';
import { Activity, AlertTriangle, Clock, TrendingUp, Eye, Calendar } from 'lucide-react';

export default function Dashboard() {
  const stats = {
    totalDetections: 1847,
    criticalAlerts: 23,
    warningAlerts: 156,
    systemUptime: 99.8,
  };

  const recentDetections = [
    {
      id: 1,
      time: '14:23:15',
      state: '警觉状态',
      risk: 'safe',
      emotion: 'Happy',
      confidence: 87.2,
      vehicle: '车辆A-001',
    },
    {
      id: 2,
      time: '13:45:32',
      state: '疲劳驾驶',
      risk: 'critical',
      emotion: 'Sad',
      confidence: 92.1,
      vehicle: '车辆B-023',
    },
    {
      id: 3,
      time: '12:10:08',
      state: '分心状态',
      risk: 'medium',
      emotion: 'Neutral',
      confidence: 78.5,
      vehicle: '车辆C-145',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          系统概览
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          驾驶安全监测系统实时数据统计
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="总检测数"
          value={stats.totalDetections.toLocaleString()}
          icon={Activity}
          color="emerald"
          trend="+12.5%"
        />
        <StatCard
          label="危险警报"
          value={stats.criticalAlerts}
          icon={AlertTriangle}
          color="red"
          trend="-8.3%"
        />
        <StatCard
          label="一般警报"
          value={stats.warningAlerts}
          icon={Eye}
          color="amber"
          trend="+5.2%"
        />
        <StatCard
          label="系统在线率"
          value={`${stats.systemUptime}%`}
          icon={TrendingUp}
          color="blue"
          trend="+0.2%"
        />
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 实时状态 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            实时监测状态
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                  当前状态
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">
                    运行中
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                正常运行
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  在线摄像头
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  3/3
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  AI模型状态
                </span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  运行中
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  最后检测
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                  2秒前
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  平均置信度
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  84.7%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 最近检测记录 */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              最近检测记录
            </h3>
            <button className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium">
              查看全部 →
            </button>
          </div>

          <div className="space-y-3">
            {recentDetections.map(detection => (
              <DetectionCard key={detection.id} detection={detection} />
            ))}
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            7天检测趋势
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-center text-gray-400 dark:text-gray-600">
              <Activity className="w-16 h-16 mx-auto mb-2 opacity-20" />
              <p className="text-sm">图表区域 - 可集成 Recharts</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            状态分布
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-center text-gray-400 dark:text-gray-600">
              <Calendar className="w-16 h-16 mx-auto mb-2 opacity-20" />
              <p className="text-sm">图表区域 - 可集成 Recharts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, trend }: any) {
  const colors = {
    emerald: 'from-emerald-500 to-teal-500',
    red: 'from-red-500 to-rose-500',
    amber: 'from-amber-500 to-yellow-500',
    blue: 'from-blue-500 to-cyan-500',
  };

  const isPositive = trend.startsWith('+');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 bg-gradient-to-br ${colors[color as keyof typeof colors]} rounded-lg flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${
            isPositive
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}
        >
          {trend}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );
}

function DetectionCard({ detection }: any) {
  const getRiskColor = (risk: string) => {
    const colors = {
      safe: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-l-emerald-500',
        text: 'text-emerald-700 dark:text-emerald-400',
      },
      medium: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-l-amber-500',
        text: 'text-amber-700 dark:text-amber-400',
      },
      high: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-l-orange-500',
        text: 'text-orange-700 dark:text-orange-400',
      },
      critical: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-l-red-500',
        text: 'text-red-700 dark:text-red-400',
      },
    };
    return colors[risk as keyof typeof colors] || colors.safe;
  };

  const style = getRiskColor(detection.risk);

  return (
    <div className={`p-4 ${style.bg} border ${style.border} border-l-4 rounded-lg hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`font-bold ${style.text}`}>
              {detection.state}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              • {detection.vehicle}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">表情</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {detection.emotion}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">置信度</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {detection.confidence}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">时间</p>
              <p className="font-semibold text-gray-900 dark:text-white font-mono">
                {detection.time}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}