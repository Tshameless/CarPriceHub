/**
 * 认证相关 API
 */
import apiClient from './request';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface LoginResponse {
  access_token: string;
  user: User;
}

export const authApi = {
  /**
   * 用户登录
   */
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  /**
   * 用户注册
   */
  register: async (
    username: string,
    email: string,
    password: string
  ): Promise<User> => {
    const response = await apiClient.post<User>('/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
};
