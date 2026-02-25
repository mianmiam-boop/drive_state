import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Database, Palette, Save } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Settings() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // 通用设置
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    dateFormat: 'YYYY-MM-DD',
    
    // 检测设置
    detectionInterval: 2,
    confidenceThreshold: 0.7,
    autoSave: true,
    
    // 通知设置
    emailNotifications: true,
    pushNotifications: false,
    criticalAlerts: true,
    weeklyReports: true,
    
    // 显示设置
    theme: 'light',
    compactMode: false,
    showAnimations: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // 这里应该调用API保存设置
    console.log('保存设置:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'general', label: '通用设置', icon: SettingsIcon },
    { id: 'detection', label: '检测设置', icon: Shield },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'display', label: '显示设置', icon: Palette },
    { id: 'data', label: '数据管理', icon: Database },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 顶部标题栏 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">系统设置</h2>
            <p className="text-sm text-gray-500 mt-0.5">System Settings</p>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{saved ? '已保存' : '保存设置'}</span>
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-hidden flex">
        {/* 左侧标签 */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <nav className="space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 右侧内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl">
            {activeTab === 'general' && <GeneralSettings settings={settings} setSettings={setSettings} />}
            {activeTab === 'detection' && <DetectionSettings settings={settings} setSettings={setSettings} />}
            {activeTab === 'notifications' && <NotificationSettings settings={settings} setSettings={setSettings} />}
            {activeTab === 'display' && <DisplaySettings settings={settings} setSettings={setSettings} />}
            {activeTab === 'data' && <DataManagement />}
          </div>
        </div>
      </div>
    </div>
  );
}

// 通用设置
function GeneralSettings({ settings, setSettings }: any) {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">通用设置</h3>
        
        {/* 用户信息 */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">用户信息</h4>
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
              {user?.fullName?.[0] || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.fullName || '管理员'}</p>
              <p className="text-sm text-gray-500">{user?.email || 'admin@example.com'}</p>
            </div>
          </div>
        </div>

        {/* 语言和时区 */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">区域设置</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">语言</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">时区</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Asia/Shanghai">北京时间 (UTC+8)</option>
                <option value="Asia/Tokyo">东京时间 (UTC+9)</option>
                <option value="America/New_York">纽约时间 (UTC-5)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">日期格式</label>
              <select
                value={settings.dateFormat}
                onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="YYYY-MM-DD">2025-12-11</option>
                <option value="MM/DD/YYYY">12/11/2025</option>
                <option value="DD/MM/YYYY">11/12/2025</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 检测设置
function DetectionSettings({ settings, setSettings }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">检测设置</h3>
        
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              检测间隔 (秒)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.detectionInterval}
              onChange={(e) => setSettings({ ...settings, detectionInterval: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">实时监测时，每隔几秒进行一次检测</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              置信度阈值
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.confidenceThreshold}
                onChange={(e) => setSettings({ ...settings, confidenceThreshold: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm font-mono text-gray-900 w-12">
                {(settings.confidenceThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">低于此置信度的检测结果将被忽略</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">自动保存检测结果</p>
              <p className="text-xs text-gray-500 mt-1">自动将检测结果保存到历史记录</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// 通知设置
function NotificationSettings({ settings, setSettings }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">通知设置</h3>
        
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">邮件通知</p>
              <p className="text-xs text-gray-500 mt-1">接收检测报告和系统通知</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">推送通知</p>
              <p className="text-xs text-gray-500 mt-1">浏览器推送通知</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">危险警报</p>
              <p className="text-xs text-gray-500 mt-1">检测到重度疲劳时立即通知</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.criticalAlerts}
                onChange={(e) => setSettings({ ...settings, criticalAlerts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">每周报告</p>
              <p className="text-xs text-gray-500 mt-1">每周一发送统计报告</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.weeklyReports}
                onChange={(e) => setSettings({ ...settings, weeklyReports: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// 显示设置
function DisplaySettings({ settings, setSettings }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">显示设置</h3>
        
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">紧凑模式</p>
              <p className="text-xs text-gray-500 mt-1">减小间距，显示更多内容</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(e) => setSettings({ ...settings, compactMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">显示动画</p>
              <p className="text-xs text-gray-500 mt-1">启用界面过渡动画</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showAnimations}
                onChange={(e) => setSettings({ ...settings, showAnimations: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// 数据管理
function DataManagement() {
  const [clearing, setClearing] = useState(false);

  const clearHistory = () => {
    if (!window.confirm('确定要清空所有历史记录吗？此操作无法撤销！')) return;
    setClearing(true);
    setTimeout(() => {
      setClearing(false);
      window.alert('历史记录已清空');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">数据管理</h3>
        
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="pb-4 border-b border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-2">存储使用情况</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">历史记录</span>
              <span className="text-sm font-mono text-gray-900">2.5 MB</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600" style={{ width: '25%' }}></div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={clearHistory}
              disabled={clearing}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-all"
            >
              {clearing ? '清空中...' : '清空历史记录'}
            </button>
            <button className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all">
              导出所有数据
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}