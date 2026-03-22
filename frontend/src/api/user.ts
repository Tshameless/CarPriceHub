/**
 * 用户相关 API（收藏、提醒、历史）
 */
import apiClient from './request';
import type { Car } from '@/types';

// 收藏相关
export interface Favorite {
  id: string;
  car_id: string;
  brand: string;
  model_name: string;
  price_discount: number;
  created_at: string;
}

export const favoriteApi = {
  /**
   * 获取用户收藏列表
   */
  getFavorites: async (): Promise<Favorite[]> => {
    const response = await apiClient.get<Favorite[]>('/user/favorites');
    return response.data;
  },

  /**
   * 添加收藏
   */
  addFavorite: async (carId: string): Promise<void> => {
    await apiClient.post('/user/favorites', { car_id: carId });
  },

  /**
   * 取消收藏
   */
  removeFavorite: async (carId: string): Promise<void> => {
    await apiClient.delete(`/user/favorites/${carId}`);
  },

  /**
   * 检查是否已收藏
   */
  checkFavorite: async (carId: string): Promise<boolean> => {
    const response = await apiClient.get<{ is_favorite: boolean }>(`/user/favorites/check/${carId}`);
    return response.data.is_favorite;
  },
};

// 价格提醒相关
export interface PriceAlert {
  id: string;
  car_id: string;
  carName: string;
  targetPrice: number;
  status: 'active' | 'triggered' | 'cancelled';
  created_at: string;
}

export const priceAlertApi = {
  /**
   * 获取用户价格提醒列表
   */
  getAlerts: async (): Promise<PriceAlert[]> => {
    const response = await apiClient.get<PriceAlert[]>('/user/alerts');
    return response.data;
  },

  /**
   * 创建价格提醒
   */
  createAlert: async (carId: string, targetPrice: number): Promise<void> => {
    await apiClient.post('/user/alerts', { car_id: carId, target_price: targetPrice });
  },

  /**
   * 删除价格提醒
   */
  removeAlert: async (alertId: string): Promise<void> => {
    await apiClient.delete(`/user/alerts/${alertId}`);
  },

  /**
   * 取消价格提醒
   */
  cancelAlert: async (alertId: string): Promise<void> => {
    await apiClient.patch(`/user/alerts/${alertId}/cancel`);
  },
};

// 查询历史相关
export interface SearchHistory {
  id: string;
  keyword?: string;
  filters?: Record<string, any>;
  result_count: number;
  timestamp: string;
}

export const searchHistoryApi = {
  /**
   * 获取用户查询历史
   */
  getHistory: async (): Promise<SearchHistory[]> => {
    const response = await apiClient.get<SearchHistory[]>('/user/history');
    return response.data;
  },

  /**
   * 添加查询历史
   */
  addHistory: async (data: {
    keyword?: string;
    filters?: Record<string, any>;
    result_count: number;
  }): Promise<void> => {
    await apiClient.post('/user/history', data);
  },

  /**
   * 删除单条历史
   */
  removeHistory: async (historyId: string): Promise<void> => {
    await apiClient.delete(`/user/history/${historyId}`);
  },

  /**
   * 清空所有历史
   */
  clearHistory: async (): Promise<void> => {
    await apiClient.delete('/user/history');
  },
};
