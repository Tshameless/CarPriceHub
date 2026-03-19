// ── Zustand Store: Recommendation State ─────────────────────────
import { create } from 'zustand';
import { Recommendation, RecommendRequest, RecommendResponse } from '../types';

interface RecommendState {
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
  profile: RecommendRequest['profile'] | null;

  setRecommendations: (recommendations: Recommendation[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  submitProfile: (profile: RecommendRequest['profile']) => Promise<void>;
  reset: () => void;
}

export const useRecommendStore = create<RecommendState>((set, get) => ({
  recommendations: [],
  loading: false,
  error: null,
  profile: null,

  setRecommendations: (recommendations) => set({ recommendations }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  submitProfile: async (profile) => {
    set({ loading: true, error: null, profile });
    try {
      const response = await fetch('/api/v1/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile } as RecommendRequest),
      });
      if (!response.ok) throw new Error('Failed to get recommendations');
      const data: RecommendResponse = await response.json();
      set({ recommendations: data.recommendations, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      });
    }
  },

  reset: () => set({ recommendations: [], loading: false, error: null, profile: null }),
}));
