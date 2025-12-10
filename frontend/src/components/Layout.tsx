
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0f1419]">
      {/* 侧边栏 */}
      <Sidebar />
      
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <TopBar />
        
        {/* 页面内容 */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#0f1419]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}