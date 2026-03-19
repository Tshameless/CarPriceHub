/**
 * 用户认证状态管理
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // 操作方法
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// 配置 axios 拦截器
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            username,
            password,
          });

          const { access_token, user } = response.data;
          
          localStorage.setItem('auth-token', access_token);
          
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || '登录失败',
            loading: false,
          });
          throw error;
        }
      },

      register: async (username: string, email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/register`, {
            username,
            email,
            password,
          });

          const user = response.data;
          
          set({ loading: false });
          
          // 注册成功后自动登录
          await get().login(username, password);
        } catch (error: any) {
          set({
            error: error.response?.data?.message || '注册失败',
            loading: false,
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('auth-token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      fetchCurrentUser: async () => {
        const token = localStorage.getItem('auth-token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ loading: true });
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/me`);
          set({
            user: response.data,
            token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          localStorage.removeItem('auth-token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
