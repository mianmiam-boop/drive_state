import React from 'react';
import { Search, Moon, Sun, LogOut, User } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function TopBar() {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-[#1a1f2e] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
      {/* 标题 */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          驾驶安全监测系统
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          AI-Powered Driver Safety Monitor
        </p>
      </div>

      {/* 右侧操作区 */}
      <div className="flex items-center space-x-4">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索..."
            className="w-64 pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* 主题切换 */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>

        {/* 用户信息 */}
        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-800">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.fullName || '管理员'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.email || 'admin@example.com'}
            </p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.fullName?.[0] || 'A'}
          </div>
        </div>

        {/* 登出按钮 */}
        <button
          onClick={handleLogout}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}