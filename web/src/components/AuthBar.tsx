import { useState, type JSX } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';

type ProviderOption = {
  key: 'google';
  label: string;
  accent: string;
};

const PROVIDERS: ProviderOption[] = [
  { key: 'google', label: 'Google でログイン', accent: 'bg-[#4285F4]/10 text-[#4285F4]' },
];

export function AuthBar(): JSX.Element {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  const supabaseReady = useAuthStore((state) => state.supabaseReady);
  const clearAuthError = useAuthStore((state) => state.clearError);
  const signInWithProvider = useAuthStore((state) => state.signInWithProvider);
  const signOut = useAuthStore((state) => state.signOut);
  const [isProviderMenuOpen, setIsProviderMenuOpen] = useState(false);
  const [showRankingHint, setShowRankingHint] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const profileDisplayName = useProfileStore((state) => state.displayName);
  const profileError = useProfileStore((state) => state.error);
  const isSavingProfile = useProfileStore((state) => state.isSaving);
  const updateDisplayName = useProfileStore((state) => state.updateDisplayName);
  const clearProfileError = useProfileStore((state) => state.clearError);

  const displayName = profileDisplayName ||
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    (user ? 'ログイン中' : null);

  const handleSignIn = async (provider: ProviderOption['key']) => {
    setIsProviderMenuOpen(false);
    await signInWithProvider(provider);
  };

  const handleSignOut = async () => {
    setIsProviderMenuOpen(false);
    setShowRankingHint(false);
    await signOut();
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {(authError || profileError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-2 rounded-xl bg-rose-100/95 border border-rose-300 px-4 py-3 text-sm text-rose-700 shadow-lg"
          >
            <span>{profileError ?? authError}</span>
            <button
              type="button"
              onClick={profileError ? clearProfileError : clearAuthError}
              className="ml-2 rounded-full bg-rose-200 px-2 py-1 text-xs font-semibold text-rose-800"
            >
              閉じる
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowRankingHint((prev) => !prev)}
          className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-primary-600 shadow hover:bg-primary-50 border border-primary-200 backdrop-blur"
        >
          🏆 ランキング案内
        </button>

        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs text-primary-600 border border-primary-100 shadow backdrop-blur">
              {isEditingName ? (
                <form
                  className="flex items-center gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    const value = (formData.get('displayName') as string | null) ?? '';
                    void updateDisplayName(value);
                    if (value.trim().length > 0 && value.trim().length <= 32) {
                      setIsEditingName(false);
                    }
                  }}
                >
                  <input
                    name="displayName"
                    defaultValue={displayName ?? ''}
                    maxLength={32}
                    className="rounded-lg border border-primary-200 px-2 py-1 text-xs text-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-400"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-primary-500 px-2 py-1 text-xs font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
                    disabled={isSavingProfile}
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="rounded-md bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-300"
                  >
                    キャンセル
                  </button>
                </form>
              ) : (
                <>
                  <span className="font-semibold text-primary-800">{displayName}</span>
                  <span className="text-primary-400">ログイン中</span>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="rounded-md bg-primary-100 px-2 py-1 text-xs font-semibold text-primary-600 hover:bg-primary-200"
                  >
                    編集
                  </button>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-600"
              disabled={isLoading}
            >
              {isLoading ? '処理中...' : 'ログアウト'}
            </button>
          </div>
        ) : supabaseReady ? (
          <button
            type="button"
            onClick={() => setIsProviderMenuOpen((prev) => !prev)}
            className="rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-600"
          >
            {isLoading ? '処理中...' : 'ログイン'}
          </button>
        ) : (
          <div className="rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-700 border border-amber-200 shadow">
            認証未設定
          </div>
        )}
      </div>

      <AnimatePresence>
        {isProviderMenuOpen && supabaseReady && !user && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="w-56 rounded-2xl border border-primary-100 bg-white/95 p-3 text-sm text-primary-600 shadow-xl backdrop-blur"
          >
            <p className="mb-2 text-xs text-primary-500">ランキング登録にはログインが必要です</p>
            <div className="space-y-2">
              {PROVIDERS.map((provider) => (
                <button
                  key={provider.key}
                  type="button"
                  onClick={() => void handleSignIn(provider.key)}
                  className={`w-full rounded-xl px-3 py-2 text-left font-semibold transition hover:shadow ${provider.accent}`}
                  disabled={isLoading}
                >
                  {provider.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRankingHint && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="w-72 rounded-2xl border border-primary-100 bg-white/95 p-4 text-sm text-primary-700 shadow-xl backdrop-blur"
          >
            <div className="mb-2 text-xs font-semibold text-primary-500 uppercase tracking-[0.3em]">
              Ranking Info
            </div>
            {user ? (
              <p className="text-sm leading-relaxed">
                <span className="font-semibold text-primary-800">{displayName}</span>
                さん、ログイン済みです。この状態で対戦結果を送信するとランキングに記録されます。
                表示名はログイン後に編集ボタンから変更できます。
              </p>
            ) : supabaseReady ? (
              <p className="text-sm leading-relaxed">
                ランキングに名前を残すにはログインしてください。Google アカウントでログインすると記録が紐づきます。
              </p>
            ) : (
              <p className="text-sm leading-relaxed text-amber-700">
                Supabase の環境変数が未設定のため、現在ランキング認証は利用できません。
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
