import { create } from 'zustand';
import type { Provider, Session, User } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient';

type OAuthProvider = 'google';

type AuthState = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  supabaseReady: boolean;
  initialize: () => Promise<void>;
  signInWithProvider: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AUTH_REDIRECT_STORAGE_KEY = 'typefighter:auth:redirect';
export const authRedirectStorageKey = AUTH_REDIRECT_STORAGE_KEY;

let authSubscription: ReturnType<ReturnType<typeof getSupabaseClient>['auth']['onAuthStateChange']>['data']['subscription'] | null =
  null;

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: true,
  error: null,
  supabaseReady: isSupabaseConfigured(),

  initialize: async () => {
    if (!isSupabaseConfigured()) {
      set({
        isLoading: false,
        supabaseReady: false,
        session: null,
        user: null,
      });
      return;
    }

    const supabase = getSupabaseClient();
    set({ isLoading: true, error: null, supabaseReady: true });

    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('[Auth] Failed to get session', error);
      set({ error: error.message, isLoading: false });
    } else {
      set({ session: data.session, user: data.session?.user ?? null, isLoading: false });
    }

    if (authSubscription) {
      authSubscription.unsubscribe();
    }

    const { data: subscriptionData } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
      });
    });

    authSubscription = subscriptionData.subscription;
  },

  signInWithProvider: async (provider) => {
    if (!isSupabaseConfigured()) {
      set({
        error: 'Supabase が設定されていません。環境変数を確認してください。',
        supabaseReady: false,
      });
      return;
    }

    const supabase = getSupabaseClient();
    set({ isLoading: true, error: null });

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      sessionStorage.setItem(AUTH_REDIRECT_STORAGE_KEY, currentPath);
      const typedProvider = provider as Provider;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: typedProvider,
        options: {
          redirectTo,
        },
      });

      if (error) {
        console.error('[Auth] OAuth sign-in failed', error);
        set({ error: error.message, isLoading: false });
      }
    } catch (err) {
      console.error('[Auth] Unexpected error during sign-in', err);
      const message = err instanceof Error ? err.message : 'ログインに失敗しました。';
      set({ error: message, isLoading: false });
    }
  },

  signOut: async () => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = getSupabaseClient();
    set({ isLoading: true });
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[Auth] Sign-out failed', error);
      set({ error: error.message, isLoading: false });
      return;
    }

    set({ session: null, user: null, isLoading: false });
  },

  clearError: () => set({ error: null }),
}));
