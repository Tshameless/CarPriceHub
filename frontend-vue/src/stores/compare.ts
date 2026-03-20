// ── Pinia Store: Compare State ─────────────────────────────────
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Car } from '@/types';

export const useCompareStore = defineStore('compare', () => {
  // State
  const cars = ref<Car[]>([]);

  // Actions
  const addCar = (car: Car) => {
    if (cars.value.length >= 4) {
      return; // Max 4 cars
    }
    if (!cars.value.find(c => c.id === car.id)) {
      cars.value.push(car);
    }
  };

  const removeCar = (carId: string) => {
    cars.value = cars.value.filter(c => c.id !== carId);
  };

  const clearCars = () => {
    cars.value = [];
  };

  const isInCompare = (carId: string): boolean => {
    return cars.value.some(c => c.id === carId);
  };

  return {
    // State
    cars,
    // Actions
    addCar,
    removeCar,
    clearCars,
    isInCompare,
  };
}, {
  persist: {
    key: 'compare-storage',
  },
});
