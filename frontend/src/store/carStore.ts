// ── Zustand Store: Car Data State ─────────────────────────────────
import { create } from 'zustand';
import { Car, SearchQuery, SearchResult } from '../types';

interface CarState {
  // Search results
  searchResults: Car[];
  total: number;
  loading: boolean;
  error: string | null;
  query: SearchQuery | null;

  // Featured cars
  featuredCars: Car[];

  // Current car detail
  currentCar: Car | null;

  // Actions
  setSearchResults: (results: Car[], total: number, query: SearchQuery) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchCars: (query: SearchQuery) => Promise<void>;
  fetchFeaturedCars: () => Promise<void>;
  fetchCarById: (id: string) => Promise<Car | null>;
  setCurrentCar: (car: Car | null) => void;
}

export const useCarStore = create<CarState>((set, get) => ({
  // Initial state
  searchResults: [],
  total: 0,
  loading: false,
  error: null,
  query: null,
  featuredCars: [],
  currentCar: null,

  // Actions
  setSearchResults: (results, total, query) => set({ searchResults: results, total, query }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCurrentCar: (car) => set({ currentCar: car }),

  fetchCars: async (query) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/v1/cars/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      });
      if (!response.ok) throw new Error('Failed to fetch cars');
      const data: SearchResult = await response.json();
      set({ searchResults: data.cars, total: data.total, query, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },

  fetchFeaturedCars: async () => {
    set({ loading: true, error: null });
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
      set({ featuredCars: data.cars, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },

  fetchCarById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/v1/cars/${id}/price-detail`);
      if (!response.ok) throw new Error('Failed to fetch car detail');
      const car: Car = await response.json();
      set({ currentCar: car, loading: false });
      return car;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
      return null;
    }
  },
}));
