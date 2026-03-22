/**
 * 推荐相关 API
 */
import apiClient from './request';
import type { RecommendRequest, RecommendResponse } from '@/types';

export const recommendApi = {
  /**
   * 提交用户画像获取推荐
   */
  getRecommendations: async (request: RecommendRequest): Promise<RecommendResponse> => {
    const response = await apiClient.post<RecommendResponse>('/recommend', request);
    return response.data;
  },
};
