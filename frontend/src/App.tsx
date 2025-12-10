import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import DetectionCenter from './pages/DetectionCenter';
import RealTimeMonitor from './pages/RealTimeMonitor';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import AlertCenter from './pages/AlertCenter';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

function RequireAuth({ children }: { children: JSX.Element }) {
  // 临时跳过认证检查 - 直接允许访问
  // const isAuth = useAuthStore(s => s.isAuthenticated)();
  // return isAuth ? children : <Navigate to="/login" replace />;
  
  return children; // 直接渲染子组件，跳过登录检查
}

export default function App() {
  const { theme, setTheme } = useThemeStore();

  // 初始化主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // 默认使用深色主题
      setTheme('dark');
    }
  }, [setTheme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/detection" replace />} />
          <Route path="detection" element={<DetectionCenter />} />
          <Route path="monitor" element={<RealTimeMonitor />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="alerts" element={<AlertCenter />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}