import { create } from 'zustand';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient';

export type LeaderboardEntry = {
  user_id: string;
  display_name: string;
  current_streak: number;
  best_streak: number;
  updated_at: string;
};

type LeaderboardState = {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  supabaseReady: boolean;
  fetchLeaderboard: (limit?: number) => Promise<void>;
};

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  entries: [],
  isLoading: false,
  error: null,
  supabaseReady: isSupabaseConfigured(),

  fetchLeaderboard: async (limit = 10) => {
    if (!isSupabaseConfigured()) {
      set({ supabaseReady: false, entries: [] });
      return;
    }

    const supabase = getSupabaseClient();
    set({ isLoading: true, error: null, supabaseReady: true });

    const { data, error } = await supabase
      .from('v_leaderboard_streaks')
      .select('*')
      .limit(limit);

    if (error) {
      console.error('[Leaderboard] Failed to load leaderboard', error);
      set({ error: error.message, isLoading: false });
      return;
    }

    set({ entries: data ?? [], isLoading: false, error: null });
  },
}));
