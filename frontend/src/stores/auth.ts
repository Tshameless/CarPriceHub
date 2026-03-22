/**
 * 用户认证状态管理
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
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

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!token.value);

  // Actions
  const login = async (username: string, password: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password,
      });

      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('auth-token', access_token);
      
      user.value = userData;
      token.value = access_token;
    } catch (err: any) {
      error.value = err.response?.data?.message || '登录失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    loading.value = true;
    error.value = null;
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        username,
        email,
        password,
      });

      // 注册成功后自动登录
      await login(username, password);
    } catch (err: any) {
      error.value = err.response?.data?.message || '注册失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    user.value = null;
    token.value = null;
    error.value = null;
  };

  const fetchCurrentUser = async () => {
    const savedToken = localStorage.getItem('auth-token');
    if (!savedToken) {
      isAuthenticated.value = false;
      user.value = null;
      return;
    }

    loading.value = true;
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`);
      user.value = response.data;
      token.value = savedToken;
    } catch (err) {
      localStorage.removeItem('auth-token');
      user.value = null;
      token.value = null;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    // Actions
    login,
    register,
    logout,
    fetchCurrentUser,
    clearError,
  };
}, {
  persist: {
    key: 'auth-storage',
    paths: ['token', 'user'],
  },
});
