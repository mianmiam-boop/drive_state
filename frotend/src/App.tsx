import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LiveMonitor from './pages/LiveMonitor';
import UploadDetection from './pages/UploadDetection';
import HistoryRecords from './pages/HistoryRecords';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 直接使用 Layout，不需要登录 */}
        <Route path="/" element={<Layout />}>
          {/* 默认重定向到实时监测 */}
          <Route index element={<Navigate to="/live" replace />} />
          
          {/* 各个功能页面 */}
          <Route path="live" element={<LiveMonitor />} />
          <Route path="upload" element={<UploadDetection />} />
          <Route path="history" element={<HistoryRecords />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 404 页面 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;