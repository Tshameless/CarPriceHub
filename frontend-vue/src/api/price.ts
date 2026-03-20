/**
 * 价格相关 API
 */
import apiClient from './request';
import type { PriceTrend, PriceHistory, PriceAlert } from '@/types';

export const priceApi = {
  /**
   * 获取价格趋势
   */
  getPriceTrend: async (carId: string, days: number = 30): Promise<PriceTrend> => {
    const response = await apiClient.get<PriceTrend>(`/cars/${carId}/price-trend`, {
      params: { days },
    });
    return response.data;
  },

  /**
   * 获取价格历史
   */
  getPriceHistory: async (carId: string): Promise<PriceHistory[]> => {
    const response = await apiClient.get<PriceHistory[]>(`/cars/${carId}/price-history`);
    return response.data;
  },

  /**
   * 获取价格提醒列表
   */
  getPriceAlerts: async (): Promise<PriceAlert[]> => {
    const response = await apiClient.get<PriceAlert[]>('/price-alerts');
    return response.data;
  },

  /**
   * 创建价格提醒
   */
  createPriceAlert: async (
    carId: string,
    targetPrice: number,
    notifyType: string
  ): Promise<PriceAlert> => {
    const response = await apiClient.post<PriceAlert>('/price-alerts', {
      car_id: carId,
      target_price: targetPrice,
      notify_type: notifyType,
    });
    return response.data;
  },

  /**
   * 删除价格提醒
   */
  deletePriceAlert: async (alertId: string): Promise<void> => {
    await apiClient.delete(`/price-alerts/${alertId}`);
  },
};
