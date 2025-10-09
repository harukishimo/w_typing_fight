import { create } from 'zustand';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { fetchScoreAttackHighScores } from '@/services/scoreAttackService';
import type { ScoreAttackHighScore } from 'shared';

type ScoreAttackLeaderboardState = {
  entries: ScoreAttackHighScore[];
  isLoading: boolean;
  error: string | null;
  supabaseReady: boolean;
  fetchLeaderboard: (limit?: number) => Promise<void>;
};

export const useScoreAttackLeaderboardStore = create<ScoreAttackLeaderboardState>((set) => ({
  entries: [],
  isLoading: false,
  error: null,
  supabaseReady: isSupabaseConfigured(),

  fetchLeaderboard: async (limit = 10) => {
    if (!isSupabaseConfigured()) {
      set({ supabaseReady: false, entries: [], error: null, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null, supabaseReady: true });
      const entries = await fetchScoreAttackHighScores(limit);
      set({ entries, isLoading: false, error: null, supabaseReady: true });
    } catch (error) {
      console.error('[ScoreAttackLeaderboard] Failed to fetch high scores', error);
      const message = error instanceof Error ? error.message : 'ランキングの取得に失敗しました。';
      set({ error: message, isLoading: false });
    }
  },
}));
