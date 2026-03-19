/**
 * 价格历史状态管理
 */
import { create } from 'zustand';
import axios from 'axios';
import type { PriceTrend, PriceHistory, PriceAlert } from '../types';

interface PriceState {
  // 价格趋势数据
  priceTrend: PriceTrend | null;
  priceTrends: PriceTrend[];
  
  // 价格历史
  priceHistory: PriceHistory[];
  
  // 价格提醒
  priceAlerts: PriceAlert[];
  
  // 加载状态
  loading: boolean;
  error: string | null;
  
  // 操作方法
  fetchPriceTrend: (carId: string, days?: number) => Promise<void>;
  fetchMultiplePriceTrends: (carIds: string[], days?: number) => Promise<void>;
  fetchPriceHistory: (carId: string) => Promise<void>;
  
  // 价格提醒
  fetchPriceAlerts: () => Promise<void>;
  createPriceAlert: (carId: string, targetPrice: number, notifyType: string) => Promise<void>;
  deletePriceAlert: (alertId: string) => Promise<void>;
  
  clearError: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const usePriceStore = create<PriceState>((set, get) => ({
  priceTrend: null,
  priceTrends: [],
  priceHistory: [],
  priceAlerts: [],
  loading: false,
  error: null,

  // 获取单个车型的价格趋势
  fetchPriceTrend: async (carId: string, days: number = 30) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get<PriceTrend>(
        `${API_BASE_URL}/cars/${carId}/price-trend`,
        { params: { days } }
      );
      set({ priceTrend: response.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '获取价格趋势失败', 
        loading: false 
      });
    }
  },

  // 获取多个车型的价格趋势（用于对比）
  fetchMultiplePriceTrends: async (carIds: string[], days: number = 30) => {
    set({ loading: true, error: null });
    try {
      const promises = carIds.map(carId =>
        axios.get<PriceTrend>(
          `${API_BASE_URL}/cars/${carId}/price-trend`,
          { params: { days } }
        )
      );
      
      const responses = await Promise.all(promises);
      const trends = responses.map(res => res.data);
      
      set({ priceTrends: trends, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '获取价格趋势失败', 
        loading: false 
      });
    }
  },

  // 获取价格历史记录
  fetchPriceHistory: async (carId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get<PriceHistory[]>(
        `${API_BASE_URL}/cars/${carId}/price-history`
      );
      set({ priceHistory: response.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '获取价格历史失败', 
        loading: false 
      });
    }
  },

  // 获取价格提醒列表
  fetchPriceAlerts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get<PriceAlert[]>(
        `${API_BASE_URL}/price-alerts`
      );
      set({ priceAlerts: response.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '获取价格提醒失败', 
        loading: false 
      });
    }
  },

  // 创建价格提醒
  createPriceAlert: async (carId: string, targetPrice: number, notifyType: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post<PriceAlert>(
        `${API_BASE_URL}/price-alerts`,
        { car_id: carId, target_price: targetPrice, notify_type: notifyType }
      );
      set(state => ({
        priceAlerts: [...state.priceAlerts, response.data],
        loading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '创建价格提醒失败', 
        loading: false 
      });
    }
  },

  // 删除价格提醒
  deletePriceAlert: async (alertId: string) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${API_BASE_URL}/price-alerts/${alertId}`);
      set(state => ({
        priceAlerts: state.priceAlerts.filter(a => a.id !== alertId),
        loading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '删除价格提醒失败', 
        loading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));
