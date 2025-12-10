import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Clock, Filter, Search } from 'lucide-react';

type AlertType = 'all' | 'critical' | 'high' | 'medium';
type AlertStatus = 'all' | 'pending' | 'resolved';

export default function AlertCenter() {
  const [filterType, setFilterType] = useState<AlertType>('all');
  const [filterStatus, setFilterStatus] = useState<AlertStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const alerts = [
    {
      id: 1,
      type: 'critical',
      title: '检测到疲劳驾驶',
      description: '司机出现明显疲劳特征，眼睛闭合频率增加',
      vehicle: '车辆A-001',
      time: '2025-11-26 14:23:15',
      status: 'pending',
      confidence: 92.1,
    },
    {
      id: 2,
      type: 'high',
      title: '愤怒驾驶警报',
      description: '检测到愤怒表情，可能影响驾驶安全',
      vehicle: '车辆B-023',
      time: '2025-11-26 13:45:32',
      status: 'resolved',
      confidence: 89.7,
    },
    {
      id: 3,
      type: 'medium',
      title: '分心状态持续30秒',
      description: '司机注意力分散，建议提醒',
      vehicle: '车辆C-145',
      time: '2025-11-26 12:10:08',
      status: 'pending',
      confidence: 78.5,
    },
    {
      id: 4,
      type: 'critical',
      title: '长时间疲劳驾驶',
      description: '连续2小时检测到疲劳特征，建议立即停车休息',
      vehicle: '车辆A-001',
      time: '2025-11-26 11:28:42',
      status: 'resolved',
      confidence: 94.3,
    },
    {
      id: 5,
      type: 'medium',
      title: '压力驾驶状态',
      description: '检测到压力相关表情特征',
      vehicle: '车辆D-089',
      time: '2025-11-26 10:15:20',
      status: 'pending',
      confidence: 82.6,
    },
  ];

  const filteredAlerts = alerts.filter(alert => {
    const matchType = filterType === 'all' || alert.type === filterType;
    const matchStatus = filterStatus === 'all' || alert.status === filterStatus;
    const matchSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       alert.vehicle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const getAlertColor = (type: string) => {
    const colors = {
      critical: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-700',
        text: 'text-red-700 dark:text-red-400',
        iconBg: 'bg-red-100 dark:bg-red-900/30',
      },
      high: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-700',
        text: 'text-orange-700 dark:text-orange-400',
        iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      },
      medium: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-700',
        text: 'text-amber-700 dark:text-amber-400',
        iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      },
    };
    return colors[type as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          警报中心
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          管理和跟踪所有驾驶安全警报
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">总警报</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alerts.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">待处理</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alerts.filter(a => a.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">已解决</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alerts.filter(a => a.status === 'resolved').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">危险警报</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alerts.filter(a => a.type === 'critical').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 筛选和搜索 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* 类型筛选 */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              筛选:
            </span>
            <div className="flex space-x-2">
              {[
                { value: 'all', label: '全部' },
                { value: 'critical', label: '危险' },
                { value: 'high', label: '高' },
                { value: 'medium', label: '中等' },
              ].map(type => (
                <button
                  key={type.value}
                  onClick={() => setFilterType(type.value as AlertType)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filterType === type.value
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* 状态筛选 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              状态:
            </span>
            <div className="flex space-x-2">
              {[
                { value: 'all', label: '全部' },
                { value: 'pending', label: '待处理' },
                { value: 'resolved', label: '已解决' },
              ].map(status => (
                <button
                  key={status.value}
                  onClick={() => setFilterStatus(status.value as AlertStatus)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === status.value
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索警报..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 警报列表 */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">没有找到符合条件的警报</p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const colors = getAlertColor(alert.type);
            return (
              <div
                key={alert.id}
                className={`bg-white dark:bg-gray-800 rounded-xl border ${colors.border} p-4 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start space-x-4">
                  {/* 图标 */}
                  <div className={`w-12 h-12 ${colors.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <AlertTriangle className={`w-6 h-6 ${colors.text}`} />
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {alert.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {alert.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{alert.vehicle}</span>
                          <span>•</span>
                          <span className="font-mono">{alert.time}</span>
                          <span>•</span>
                          <span>置信度: {alert.confidence}%</span>
                        </div>
                      </div>

                      {/* 状态和操作 */}
                      <div className="flex items-center space-x-3 ml-4">
                        {alert.status === 'pending' ? (
                          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
                            待处理
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium">
                            已解决
                          </span>
                        )}
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <CheckCircle className="w-5 h-5 text-gray-400 hover:text-emerald-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}