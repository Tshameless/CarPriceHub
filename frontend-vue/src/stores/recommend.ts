// ── Pinia Store: Recommendation State ─────────────────────────
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Recommendation, RecommendRequest, UserProfile } from '@/types';

export const useRecommendStore = defineStore('recommend', () => {
  // State
  const recommendations = ref<Recommendation[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const profile = ref<UserProfile | null>(null);

  // Actions
  const setRecommendations = (recs: Recommendation[]) => {
    recommendations.value = recs;
  };

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading;
  };

  const setError = (err: string | null) => {
    error.value = err;
  };

  const submitProfile = async (userProfile: UserProfile) => {
    loading.value = true;
    error.value = null;
    profile.value = userProfile;
    try {
      const response = await fetch('/api/v1/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: userProfile } as RecommendRequest),
      });
      if (!response.ok) throw new Error('Failed to get recommendations');
      const data = await response.json();
      recommendations.value = data.recommendations;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    recommendations.value = [];
    loading.value = false;
    error.value = null;
    profile.value = null;
  };

  return {
    // State
    recommendations,
    loading,
    error,
    profile,
    // Actions
    setRecommendations,
    setLoading,
    setError,
    submitProfile,
    reset,
  };
});
