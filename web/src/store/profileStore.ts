import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient';

type ProfileState = {
  userId: string | null;
  displayName: string;
  fallbackName: string;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  supabaseReady: boolean;
  loadProfile: (user: User) => Promise<void>;
  resetProfile: () => void;
  updateDisplayName: (displayName: string) => Promise<void>;
  clearError: () => void;
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  userId: null,
  displayName: '',
  fallbackName: '',
  isLoading: false,
  isSaving: false,
  error: null,
  supabaseReady: isSupabaseConfigured(),

  loadProfile: async (user) => {
    if (!isSupabaseConfigured()) {
      set({ supabaseReady: false, userId: user.id, displayName: user.email ?? '', fallbackName: user.email ?? '' });
      return;
    }

    const supabase = getSupabaseClient();
    const fallbackName =
      (user.user_metadata?.display_name as string | undefined) ||
      (user.user_metadata?.full_name as string | undefined) ||
      user.email ||
      'Guest';

    set({ isLoading: true, supabaseReady: true, userId: user.id, fallbackName });

    const { data, error } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('[Profile] Failed to load profile', error);
      set({ error: error.message, isLoading: false, displayName: fallbackName });
      return;
    }

    if (!data) {
      set({ displayName: fallbackName, isLoading: false, error: null });
      return;
    }

    set({ displayName: data.display_name, isLoading: false, error: null });
  },

  resetProfile: () => {
    set({ userId: null, displayName: '', fallbackName: '', isLoading: false, isSaving: false, error: null });
  },

  updateDisplayName: async (displayName) => {
    const trimmed = displayName.trim();
    const { userId, fallbackName, supabaseReady } = get();

    if (!userId) {
      set({ error: 'ログインしてから表示名を変更してください。' });
      return;
    }

    if (trimmed.length === 0) {
      set({ error: '表示名を入力してください。' });
      return;
    }

    if (trimmed.length > 32) {
      set({ error: '表示名は32文字以内にしてください。' });
      return;
    }

    if (!supabaseReady || !isSupabaseConfigured()) {
      set({ displayName: trimmed, error: null });
      return;
    }

    const supabase = getSupabaseClient();
    set({ isSaving: true, error: null });

    const { error } = await supabase.from('profiles').upsert({
      user_id: userId,
      display_name: trimmed,
    });

    if (error) {
      console.error('[Profile] Failed to update display name', error);
      set({ isSaving: false, error: error.message, displayName: fallbackName ?? trimmed });
      return;
    }

    set({ displayName: trimmed, isSaving: false, error: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
