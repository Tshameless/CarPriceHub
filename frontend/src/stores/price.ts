/**
 * 价格历史状态管理
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import type { PriceTrend, PriceHistory, PriceAlert } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const usePriceStore = defineStore('price', () => {
  // State
  const priceTrend = ref<PriceTrend | null>(null);
  const priceTrends = ref<PriceTrend[]>([]);
  const priceHistory = ref<PriceHistory[]>([]);
  const priceAlerts = ref<PriceAlert[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  const fetchPriceTrend = async (carId: string, days: number = 30) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<PriceTrend>(
        `${API_BASE_URL}/cars/${carId}/price-trend`,
        { params: { days } }
      );
      priceTrend.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || '获取价格趋势失败';
    } finally {
      loading.value = false;
    }
  };

  const fetchMultiplePriceTrends = async (carIds: string[], days: number = 30) => {
    loading.value = true;
    error.value = null;
    try {
      const promises = carIds.map(carId =>
        axios.get<PriceTrend>(
          `${API_BASE_URL}/cars/${carId}/price-trend`,
          { params: { days } }
        )
      );
      
      const responses = await Promise.all(promises);
      priceTrends.value = responses.map(res => res.data);
    } catch (err: any) {
      error.value = err.response?.data?.message || '获取价格趋势失败';
    } finally {
      loading.value = false;
    }
  };

  const fetchPriceHistory = async (carId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<PriceHistory[]>(
        `${API_BASE_URL}/cars/${carId}/price-history`
      );
      priceHistory.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || '获取价格历史失败';
    } finally {
      loading.value = false;
    }
  };

  const fetchPriceAlerts = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<PriceAlert[]>(
        `${API_BASE_URL}/price-alerts`
      );
      priceAlerts.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || '获取价格提醒失败';
    } finally {
      loading.value = false;
    }
  };

  const createPriceAlert = async (carId: string, targetPrice: number, notifyType: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.post<PriceAlert>(
        `${API_BASE_URL}/price-alerts`,
        { car_id: carId, target_price: targetPrice, notify_type: notifyType }
      );
      priceAlerts.value.push(response.data);
    } catch (err: any) {
      error.value = err.response?.data?.message || '创建价格提醒失败';
    } finally {
      loading.value = false;
    }
  };

  const deletePriceAlert = async (alertId: string) => {
    loading.value = true;
    error.value = null;
    try {
      await axios.delete(`${API_BASE_URL}/price-alerts/${alertId}`);
      priceAlerts.value = priceAlerts.value.filter(a => a.id !== alertId);
    } catch (err: any) {
      error.value = err.response?.data?.message || '删除价格提醒失败';
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    priceTrend,
    priceTrends,
    priceHistory,
    priceAlerts,
    loading,
    error,
    // Actions
    fetchPriceTrend,
    fetchMultiplePriceTrends,
    fetchPriceHistory,
    fetchPriceAlerts,
    createPriceAlert,
    deletePriceAlert,
    clearError,
  };
});
