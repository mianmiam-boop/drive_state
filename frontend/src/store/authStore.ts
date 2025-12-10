// src/store/authStore.ts
import { create } from 'zustand';
import type { User } from '../types/index';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')!) // 修复这里的空格
    : null,
  token: localStorage.getItem('token'),

  login: (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },

  isAuthenticated: () => {
    return !!get().token;
  },
}));