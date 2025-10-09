import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useScoreAttackLeaderboardStore } from '@/store/scoreAttackLeaderboardStore';

type ScoreAttackLeaderboardProps = {
  title?: string;
  limit?: number;
};

export function ScoreAttackLeaderboard({ title = 'スコアアタック最高スコア', limit = 10 }: ScoreAttackLeaderboardProps) {
  const entries = useScoreAttackLeaderboardStore((state) => state.entries);
  const isLoading = useScoreAttackLeaderboardStore((state) => state.isLoading);
  const error = useScoreAttackLeaderboardStore((state) => state.error);
  const supabaseReady = useScoreAttackLeaderboardStore((state) => state.supabaseReady);
  const fetchLeaderboard = useScoreAttackLeaderboardStore((state) => state.fetchLeaderboard);

  useEffect(() => {
    if (!supabaseReady) return;
    void fetchLeaderboard(limit);
  }, [supabaseReady, fetchLeaderboard, limit]);

  if (!supabaseReady) {
    return (
      <div className="rounded-2xl border border-primary-200/40 bg-primary-50/60 p-4 text-sm text-primary-600">
        Supabase の設定が完了するとスコアアタックランキングが表示されます。
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
          <span className="text-xl">🎯</span>
          {title}
        </h3>
        {isLoading && <span className="text-xs text-primary-400">更新中...</span>}
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-primary-500">まだ記録がありません。挑戦して最高スコアを目指しましょう！</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry, index) => (
            <li
              key={entry.userId}
              className="flex items-center justify-between rounded-xl border border-primary-100 bg-white px-4 py-3 text-sm text-primary-700"
            >
              <div className="flex items-start gap-3">
                <span className="font-semibold text-lg text-primary-500">{index + 1}</span>
                <div>
                  <div className="font-semibold">{entry.displayName}</div>
                  <div className="text-xs text-primary-400">Best Score {entry.bestScore.toLocaleString()}</div>
                </div>
              </div>
              <div className="text-xs text-primary-400">更新日: {new Date(entry.updatedAt).toLocaleDateString()}</div>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
