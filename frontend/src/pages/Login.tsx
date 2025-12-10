import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff, Shield } from 'lucide-react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const loginStore = useAuthStore(s => s.login);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', form);
      if (res.data?.success) {
        loginStore(res.data.token, res.data.user);
        navigate('/');
      } else {
        setError(res.data?.error || '登录失败');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || '网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Driver Safety</h1>
          <p className="text-emerald-400 text-sm">驾驶安全监测系统</p>
        </div>

        {/* 登录卡片 */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6">请输入您的账户信息</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            {/* 邮箱 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">邮箱</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="请输入邮箱"
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="请输入密码"
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="text-right mt-2">
                <button type="button" className="text-sm text-emerald-400 hover:text-emerald-300">
                  忘记密码?
                </button>
              </div>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          {/* 分割线 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-800/50 text-gray-400">或使用以下方式登录</span>
            </div>
          </div>

          {/* 第三方登录 */}
          <div className="flex justify-center space-x-4">
            <button className="w-12 h-12 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg flex items-center justify-center transition-colors">
              <span className="text-white font-bold">G</span>
            </button>
            <button className="w-12 h-12 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg flex items-center justify-center transition-colors">
              <span className="text-white font-bold">Git</span>
            </button>
            <button className="w-12 h-12 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg flex items-center justify-center transition-colors">
              <span className="text-white font-bold">f</span>
            </button>
          </div>

          {/* 注册链接 */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">还没有账号？</span>
            <button className="ml-2 text-emerald-400 hover:text-emerald-300 font-medium">
              立即注册
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}