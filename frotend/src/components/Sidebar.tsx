import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Video, 
  Upload, 
  Clock, 
  Settings, 
  Shield,
  Activity
} from 'lucide-react';

export default function Sidebar() {
  const mainNavItems = [
    { path: '/live', label: '实时监测', icon: Video },
    { path: '/upload', label: '上传检测', icon: Upload },
    { path: '/history', label: '历史记录', icon: Clock },
  ];

  const bottomItems = [
    { path: '/settings', label: '系统设置', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo区域 */}
      <div className="h-16 px-6 flex items-center border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">驾驶疲劳监测系统</h1>
          </div>
        </div>
      </div>

      {/* 主导航 */}
      <nav className="flex-1 py-6 px-3">
        <div className="space-y-1">
          {mainNavItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className="text-sm">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* 底部导航 */}
      <div className="p-3 border-t border-gray-200">
        {bottomItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="text-sm">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
        
        {/* 版本信息 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 px-3">
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500">系统运行正常</span>
          </div>
          <p className="text-xs text-gray-400 px-3 mt-1">v2.0.1</p>
        </div>
      </div>
    </aside>
  );
}