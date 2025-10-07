import { type PropsWithChildren, type JSX, useEffect } from 'react';
import { authRedirectStorageKey, useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';

export function AuthProvider({ children }: PropsWithChildren): JSX.Element {
  const initialize = useAuthStore((state) => state.initialize);
  const isLoading = useAuthStore((state) => state.isLoading);
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);
  const supabaseReady = useAuthStore((state) => state.supabaseReady);
  const loadProfile = useProfileStore((state) => state.loadProfile);
  const resetProfile = useProfileStore((state) => state.resetProfile);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (!supabaseReady) {
      return;
    }

    if (user) {
      void loadProfile(user);
    } else {
      resetProfile();
    }
  }, [user, supabaseReady, loadProfile, resetProfile]);

  useEffect(() => {
    if (window.location.pathname !== '/auth/callback' || isLoading) {
      return;
    }

    const storedPath = sessionStorage.getItem(authRedirectStorageKey);
    sessionStorage.removeItem(authRedirectStorageKey);

    const fallbackPath = '/';
    const targetPath = storedPath && storedPath !== '/auth/callback' ? storedPath : fallbackPath;
    window.history.replaceState(null, '', targetPath);
  }, [isLoading, session]);

  return <>{children}</>;
}
