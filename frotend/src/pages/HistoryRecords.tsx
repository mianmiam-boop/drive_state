import React, { useState, useEffect } from 'react';
import { Clock, Search, Filter, ChevronRight, FileImage, Video, TrendingDown, TrendingUp, Download, Trash2, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

interface HistoryRecord {
  id: number;
  timestamp: string;
  type: 'image' | 'video';
  fileName: string;
  fatigue_level: number;
  fatigue_name: string;
  fatigue_score: number;
  confidence: number;
  risk_level: string;
  result?: any;
}

export default function HistoryRecords() {
  const { token } = useAuthStore();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<'all' | 0 | 1 | 2 | 3>('all');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  // 加载历史记录
  useEffect(() => {
    loadHistory();
  }, []); // 添加 loadHistory 到依赖项数组

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        setRecords(response.data.records);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
      // 如果API失败，使用模拟数据
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  // 模拟数据（用于演示）
  const loadMockData = () => {
    const mockRecords: HistoryRecord[] = [
      {
        id: 1,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        type: 'image',
        fileName: 'driver_001.jpg',
        fatigue_level: 0,
        fatigue_name: '正常状态',
        fatigue_score: 18.5,
        confidence: 0.89,
        risk_level: 'safe',
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        type: 'image',
        fileName: 'driver_002.jpg',
        fatigue_level: 3,
        fatigue_name: '重度疲劳',
        fatigue_score: 89.3,
        confidence: 0.92,
        risk_level: 'critical',
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        type: 'image',
        fileName: 'driver_003.jpg',
        fatigue_level: 2,
        fatigue_name: '中度疲劳',
        fatigue_score: 62.7,
        confidence: 0.78,
        risk_level: 'medium',
      },
      {
        id: 4,
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        type: 'image',
        fileName: 'driver_004.jpg',
        fatigue_level: 1,
        fatigue_name: '轻度疲劳',
        fatigue_score: 38.2,
        confidence: 0.85,
        risk_level: 'low',
      },
      {
        id: 5,
        timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
        type: 'image',
        fileName: 'driver_005.jpg',
        fatigue_level: 0,
        fatigue_name: '正常状态',
        fatigue_score: 22.1,
        confidence: 0.87,
        risk_level: 'safe',
      },
    ];
    setRecords(mockRecords);
  };

  // 筛选记录
  const filteredRecords = records.filter(record => {
    const matchSearch = record.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLevel = filterLevel === 'all' || record.fatigue_level === filterLevel;
    const matchType = filterType === 'all' || record.type === filterType;
    return matchSearch && matchLevel && matchType;
  });

  // 删除记录
  const deleteRecord = async (id: number) => {
    if (!window.confirm('确定要删除这条记录吗？')) return;
    
    try {
      await axios.delete(`/api/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(records.filter(r => r.id !== id));
    } catch (error) {
      console.error('删除失败:', error);
      // 模拟删除
      setRecords(records.filter(r => r.id !== id));
    }
  };

  // 导出记录
  const exportRecords = () => {
    const dataStr = JSON.stringify(filteredRecords, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `history_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getLevelConfig = (level: number) => {
    const configs = {
      0: { badge: 'bg-green-100 text-green-700 border-green-200', color: 'bg-green-500' },
      1: { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', color: 'bg-yellow-500' },
      2: { badge: 'bg-orange-100 text-orange-700 border-orange-200', color: 'bg-orange-500' },
      3: { badge: 'bg-red-100 text-red-700 border-red-200', color: 'bg-red-500' },
    };
    return configs[level as keyof typeof configs];
  };

  // 统计数据
  const stats = {
    total: records.length,
    normal: records.filter(r => r.fatigue_level === 0).length,
    warning: records.filter(r => r.fatigue_level === 1 || r.fatigue_level === 2).length,
    critical: records.filter(r => r.fatigue_level === 3).length,
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 顶部标题栏 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">历史记录</h2>
            <p className="text-sm text-gray-500 mt-0.5">Detection History</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadHistory}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm text-gray-700">刷新</span>
            </button>
            <button
              onClick={exportRecords}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">导出</span>
            </button>
            <div className="text-sm text-gray-600">
              共 {records.length} 条记录
            </div>
          </div>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">总检测数</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-green-700">正常状态</p>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-semibold text-green-700">{stats.normal}</p>
            <p className="text-xs text-green-600 mt-1">
              {stats.total > 0 ? ((stats.normal / stats.total) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-yellow-700">需要关注</p>
              <TrendingDown className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-2xl font-semibold text-yellow-700">{stats.warning}</p>
            <p className="text-xs text-yellow-600 mt-1">
              {stats.total > 0 ? ((stats.warning / stats.total) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-red-700">危险警报</p>
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-2xl font-semibold text-red-700">{stats.critical}</p>
            <p className="text-xs text-red-600 mt-1">
              {stats.total > 0 ? ((stats.critical / stats.total) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索文件名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 等级筛选 */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">等级:</span>
            <div className="flex space-x-1">
              {[
                { value: 'all', label: '全部' },
                { value: 0, label: 'L0' },
                { value: 1, label: 'L1' },
                { value: 2, label: 'L2' },
                { value: 3, label: 'L3' },
              ].map(item => (
                <button
                  key={item.value}
                  onClick={() => setFilterLevel(item.value as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    filterLevel === item.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 类型筛选 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">类型:</span>
            <div className="flex space-x-1">
              {[
                { value: 'all', label: '全部' },
                { value: 'image', label: '图像' },
                { value: 'video', label: '视频' },
              ].map(item => (
                <button
                  key={item.value}
                  onClick={() => setFilterType(item.value as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    filterType === item.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 记录列表 */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">加载中...</p>
            </div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500">没有找到符合条件的记录</p>
            <p className="text-xs text-gray-400 mt-2">
              {records.length === 0 ? '开始检测后，记录将显示在这里' : '尝试调整筛选条件'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map(record => {
              const config = getLevelConfig(record.fatigue_level);
              return (
                <div
                  key={record.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => setSelectedRecord(record)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* 图标 */}
                      <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        {record.type === 'image' ? (
                          <FileImage className="w-6 h-6 text-gray-600" />
                        ) : (
                          <Video className="w-6 h-6 text-gray-600" />
                        )}
                      </div>

                      {/* 信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{record.fileName}</h4>
                          <span className={`px-2.5 py-0.5 border rounded-full text-xs font-semibold flex-shrink-0 ${config.badge}`}>
                            L{record.fatigue_level} {record.fatigue_name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(record.timestamp).toLocaleString('zh-CN')}</span>
                          </span>
                          <span>疲劳分数: {record.fatigue_score.toFixed(1)}/100</span>
                          <span>置信度: {(record.confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>

                      {/* 分数可视化 */}
                      <div className="w-32 flex-shrink-0">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>分数</span>
                          <span className="font-mono">{record.fatigue_score.toFixed(0)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${config.color}`}
                            style={{ width: `${record.fatigue_score}%` }}
                          />
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRecord(record.id);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      {selectedRecord && (
        <RecordDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}

// 详情弹窗组件
function RecordDetailModal({ record, onClose }: { record: HistoryRecord; onClose: () => void }) {
  const getLevelConfig = (level: number) => {
    const configs = {
      0: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
      1: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
      2: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
      3: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    };
    return configs[level as keyof typeof configs];
  };

  const config = getLevelConfig(record.fatigue_level);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">检测详情</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-gray-500 text-xl">×</span>
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-4">
          {/* 基本信息 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">基本信息</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">文件名：</span>
                <span className="text-gray-900">{record.fileName}</span>
              </div>
              <div>
                <span className="text-gray-600">类型：</span>
                <span className="text-gray-900">{record.type === 'image' ? '图像' : '视频'}</span>
              </div>
              <div>
                <span className="text-gray-600">检测时间：</span>
                <span className="text-gray-900">{new Date(record.timestamp).toLocaleString('zh-CN')}</span>
              </div>
              <div>
                <span className="text-gray-600">记录ID：</span>
                <span className="text-gray-900 font-mono">#{record.id}</span>
              </div>
            </div>
          </div>

          {/* 检测结果 */}
          <div className={`${config.bg} border ${config.border} rounded-lg p-4`}>
            <h4 className={`text-sm font-medium ${config.color} mb-3`}>检测结果</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">疲劳等级</span>
                <span className={`text-lg font-bold ${config.color}`}>
                  L{record.fatigue_level} {record.fatigue_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">疲劳分数</span>
                <span className="text-lg font-bold text-gray-900">
                  {record.fatigue_score.toFixed(1)}/100
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">置信度</span>
                <span className="text-lg font-bold text-gray-900">
                  {(record.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-3">
            <button
              onClick={() => {
                const dataStr = JSON.stringify(record, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `record_${record.id}.json`;
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>下载结果</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}