import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLeaderboardStore } from '@/store/leaderboardStore';
import { useAuthStore } from '@/store/authStore';

type LeaderboardPanelProps = {
  title?: string;
  limit?: number;
};

export function LeaderboardPanel({ title = '連勝ランキング', limit = 10 }: LeaderboardPanelProps) {
  const supabaseReady = useLeaderboardStore((state) => state.supabaseReady);
  const entries = useLeaderboardStore((state) => state.entries);
  const isLoading = useLeaderboardStore((state) => state.isLoading);
  const error = useLeaderboardStore((state) => state.error);
  const fetchLeaderboard = useLeaderboardStore((state) => state.fetchLeaderboard);
  const currentUserId = useAuthStore((state) => state.user?.id ?? null);

  useEffect(() => {
    if (!supabaseReady) return;
    void fetchLeaderboard(limit);
  }, [supabaseReady, fetchLeaderboard, limit]);

  if (!supabaseReady) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        Supabase の設定が完了すると連勝ランキングがここに表示されます。
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        ランキングの取得に失敗しました: {error}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary-200/60 bg-white/95 p-6 shadow-lg backdrop-blur"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary-700 flex items-center gap-2">
          <span className="text-xl">🏆</span>
          {title}
        </h3>
        {isLoading && <span className="text-xs text-primary-400">更新中...</span>}
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-primary-500">まだ連勝記録が登録されていません。先に試合をプレイして記録を作りましょう！</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry, index) => {
            const isCurrentUser = currentUserId === entry.user_id;
            return (
              <li
                key={entry.user_id}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                  isCurrentUser
                    ? 'border-primary-400 bg-primary-50 text-primary-800'
                    : 'border-primary-100 bg-white text-primary-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-lg text-primary-500">{index + 1}</span>
                  <div>
                    <div className="font-semibold">{entry.display_name}</div>
                    <div className="text-xs text-primary-400">Best {entry.best_streak} 連勝</div>
                  </div>
                </div>
                <div className="text-xs text-primary-500">
                  現在 {entry.current_streak} 連勝中
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
}
