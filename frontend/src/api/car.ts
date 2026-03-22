/**
 * 车辆相关 API
 */
import apiClient from './request';
import type { Car, SearchQuery, SearchResult } from '@/types';

export const carApi = {
  /**
   * 搜索车辆
   */
  searchCars: async (query: SearchQuery): Promise<SearchResult> => {
    const response = await apiClient.post<SearchResult>('/cars/search', query);
    return response.data;
  },

  /**
   * 获取车辆详情
   */
  getCarDetail: async (id: string): Promise<Car> => {
    const response = await apiClient.get<Car>(`/cars/${id}/price-detail`);
    return response.data;
  },

  /**
   * 获取热门车辆
   */
  getFeaturedCars: async (pageSize: number = 8): Promise<SearchResult> => {
    const response = await apiClient.post<SearchResult>('/cars/search', {
      page: 1,
      page_size: pageSize,
    });
    return response.data;
  },
};
