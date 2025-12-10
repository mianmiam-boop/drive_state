import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Upload, 
  MonitorPlay, 
  Activity, 
  BarChart3, 
  Bell, 
  Users, 
  FileText, 
  Settings, 
  Shield 
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { path: '/detection', label: '检测中心', icon: Upload },
    { path: '/monitor', label: '实时监测', icon: MonitorPlay },
    { path: '/dashboard', label: '仪表盘', icon: Activity },
    { path: '/analytics', label: '数据分析', icon: BarChart3 },
    { path: '/alerts', label: '警报中心', icon: Bell },
  ];

  const bottomItems = [
    { path: '/users', label: '用户管理', icon: Users },
    { path: '/logs', label: '系统日志', icon: FileText },
    { path: '/settings', label: '系统设置', icon: Settings },
  ];

  return (
    <aside className="w-16 bg-white dark:bg-[#1a1f2e] border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* 主导航 */}
      <nav className="flex-1 py-6 space-y-2 px-2">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-center w-12 h-12 rounded-lg transition-all group relative ${
                  isActive
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Icon className="w-6 h-6" />
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* 底部导航 */}
      <div className="py-4 space-y-2 px-2 border-t border-gray-200 dark:border-gray-800">
        {bottomItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-center w-12 h-12 rounded-lg transition-all group relative ${
                  isActive
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}