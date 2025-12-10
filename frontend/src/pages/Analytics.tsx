import React, { useState } from 'react';
import { BarChart3, TrendingUp, PieChart, Calendar, Download } from 'lucide-react';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');

  const timeRanges = [
    { value: '24h', label: '24小时' },
    { value: '7d', label: '7天' },
    { value: '30d', label: '30天' },
    { value: '90d', label: '90天' },
  ];

  // 模拟数据
  const stateDistribution = [
    { state: '警觉状态', count: 1245, percentage: 68.2, color: 'bg-emerald-500' },
    { state: '放松状态', count: 342, percentage: 18.7, color: 'bg-blue-500' },
    { state: '分心状态', count: 156, percentage: 8.5, color: 'bg-amber-500' },
    { state: '疲劳驾驶', count: 45, percentage: 2.5, color: 'bg-orange-500' },
    { state: '愤怒驾驶', count: 38, percentage: 2.1, color: 'bg-red-500' },
  ];

  const hourlyData = [
    { hour: '00:00', count: 12 },
    { hour: '02:00', count: 8 },
    { hour: '04:00', count: 5 },
    { hour: '06:00', count: 45 },
    { hour: '08:00', count: 125 },
    { hour: '10:00', count: 98 },
    { hour: '12:00', count: 78 },
    { hour: '14:00', count: 112 },
    { hour: '16:00', count: 145 },
    { hour: '18:00', count: 156 },
    { hour: '20:00', count: 89 },
    { hour: '22:00', count: 45 },
  ];

  return (
    <div className="space-y-6">
      {/* 标题和筛选 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            数据分析
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            驾驶状态统计与趋势分析
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* 时间范围选择 */}
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            {timeRanges.map(range => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  timeRange === range.value
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* 导出按钮 */}
          <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              导出报告
            </span>
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="总检测数"
          value="1,826"
          change="+12.5%"
          isPositive={true}
          icon={BarChart3}
        />
        <StatCard
          label="平均置信度"
          value="84.7%"
          change="+2.3%"
          isPositive={true}
          icon={TrendingUp}
        />
        <StatCard
          label="危险事件"
          value="83"
          change="-8.2%"
          isPositive={true}
          icon={PieChart}
        />
        <StatCard
          label="在线时长"
          value="156h"
          change="+5.4%"
          isPositive={true}
          icon={Calendar}
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 状态分布 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            驾驶状态分布
          </h3>
          <div className="space-y-4">
            {stateDistribution.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.state}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.count}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 24小时检测趋势 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            24小时检测趋势
          </h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {hourlyData.map((item, index) => {
              const maxCount = Math.max(...hourlyData.map(d => d.count));
              const height = (item.count / maxCount) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-t transition-all cursor-pointer relative group"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.count} 次
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {item.hour.split(':')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 详细表格 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          检测记录明细
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  时间
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  状态
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  表情
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  置信度
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  风险等级
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { time: '14:23:15', state: '警觉状态', emotion: 'Happy', confidence: 87.2, risk: 'safe' },
                { time: '13:45:32', state: '疲劳驾驶', emotion: 'Sad', confidence: 92.1, risk: 'critical' },
                { time: '12:10:08', state: '分心状态', emotion: 'Neutral', confidence: 78.5, risk: 'medium' },
                { time: '11:28:42', state: '警觉状态', emotion: 'Happy', confidence: 85.3, risk: 'safe' },
                { time: '10:15:20', state: '愤怒驾驶', emotion: 'Angry', confidence: 89.7, risk: 'high' },
              ].map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {item.time}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">
                    {item.state}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {item.emotion}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-mono">
                    {item.confidence}%
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.risk === 'safe'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400'
                          : item.risk === 'medium'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
                          : item.risk === 'high'
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      }`}
                    >
                      {item.risk === 'safe' ? '安全' : item.risk === 'medium' ? '中等' : item.risk === 'high' ? '高' : '危险'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, change, isPositive, icon: Icon }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${
            isPositive
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}
        >
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );
}