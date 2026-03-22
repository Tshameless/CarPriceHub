// ── Pinia Store: Car Data State ─────────────────────────────────
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Car, SearchQuery, SearchResult } from '@/types';

export const useCarStore = defineStore('car', () => {
  // State
  const searchResults = ref<Car[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const query = ref<SearchQuery | null>(null);
  const featuredCars = ref<Car[]>([]);
  const currentCar = ref<Car | null>(null);

  // Actions
  const setSearchResults = (results: Car[], totalCount: number, searchQuery: SearchQuery) => {
    searchResults.value = results;
    total.value = totalCount;
    query.value = searchQuery;
  };

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading;
  };

  const setError = (err: string | null) => {
    error.value = err;
  };

  const setCurrentCar = (car: Car | null) => {
    currentCar.value = car;
  };

  const fetchCars = async (searchQuery: SearchQuery) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch('/api/v1/cars/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchQuery),
      });
      if (!response.ok) throw new Error('Failed to fetch cars');
      const data: SearchResult = await response.json();
      searchResults.value = data.cars;
      total.value = data.total;
      query.value = searchQuery;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading.value = false;
    }
  };

  const fetchFeaturedCars = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch('/api/v1/cars/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: 1,
          page_size: 8,
        } as SearchQuery),
      });
      if (!response.ok) throw new Error('Failed to fetch featured cars');
      const data: SearchResult = await response.json();
      featuredCars.value = data.cars;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading.value = false;
    }
  };

  const fetchCarById = async (id: string): Promise<Car | null> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`/api/v1/cars/${id}/price-detail`);
      if (!response.ok) throw new Error('Failed to fetch car detail');
      const car: Car = await response.json();
      currentCar.value = car;
      return car;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    searchResults,
    total,
    loading,
    error,
    query,
    featuredCars,
    currentCar,
    // Actions
    setSearchResults,
    setLoading,
    setError,
    setCurrentCar,
    fetchCars,
    fetchFeaturedCars,
    fetchCarById,
  };
});
