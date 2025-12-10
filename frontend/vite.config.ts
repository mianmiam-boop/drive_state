import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    // 添加代理配置，将 API 请求转发到后端
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // 假设后端运行在 8000 端口
        changeOrigin: true,
        secure: false,
        // 如果后端 API 路径有前缀，可以重写路径
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  // 添加 React Router 未来标志配置
  define: {
    'process.env': {
      VITE_REACT_ROUTER_FUTURE: JSON.stringify({
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      })
    }
  }
})