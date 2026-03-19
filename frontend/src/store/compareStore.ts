// ── Zustand Store: Compare State ─────────────────────────────────
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Car } from '../types';

interface CompareState {
  cars: Car[];
  addCar: (car: Car) => void;
  removeCar: (carId: string) => void;
  clearCars: () => void;
  isInCompare: (carId: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      cars: [],

      addCar: (car) => {
        const { cars } = get();
        if (cars.length >= 4) {
          return; // Max 4 cars
        }
        if (!cars.find(c => c.id === car.id)) {
          set({ cars: [...cars, car] });
        }
      },

      removeCar: (carId) => {
        set({ cars: get().cars.filter(c => c.id !== carId) });
      },

      clearCars: () => set({ cars: [] }),

      isInCompare: (carId) => get().cars.some(c => c.id === carId),
    }),
    {
      name: 'compare-storage',
    }
  )
);
