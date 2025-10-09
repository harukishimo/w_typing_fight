import { motion, AnimatePresence } from 'framer-motion';
import type { ScoreAttackSummary } from 'shared';

type ScoreAttackResultModalProps = {
  isOpen: boolean;
  summary: ScoreAttackSummary | null;
  onClose: () => void;
  onRetry: () => void;
  isSubmittingHighScore: boolean;
  submissionState: 'idle' | 'success' | 'error' | 'skipped';
  infoMessage?: string;
};

export function ScoreAttackResultModal({
  isOpen,
  summary,
  onClose,
  onRetry,
  isSubmittingHighScore,
  submissionState,
  infoMessage,
}: ScoreAttackResultModalProps) {
  return (
    <AnimatePresence>
      {isOpen && summary && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="text-center space-y-3 mb-6">
              <h2 className="text-3xl font-bold text-primary-700">スコアアタック結果</h2>
              <p className="text-sm text-primary-500">お疲れさまでした！結果を確認しましょう。</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <ResultStat label="スコア" value={summary.score.toLocaleString()} accent="text-amber-600" />
              <ResultStat label="総タイプ数" value={`${summary.totalWords} 課題`} accent="text-primary-600" />
              <ResultStat label="最大ノーミスタイプ" value={`${summary.maxNoMissCount} 文字`} accent="text-rose-600" />
              <ResultStat label="ミス" value={`${summary.totalMisses} 回`} accent="text-slate-600" />
            </div>

            <div className="rounded-2xl bg-primary-50 border border-primary-100 p-4 text-sm text-primary-600 mb-6">
              <p>
                合計プレイ時間: {formatDuration(summary.durationMs)}
              </p>
              <p>挑戦開始: {new Date(summary.startedAt).toLocaleString()}</p>
              <p>終了時刻: {new Date(summary.finishedAt).toLocaleString()}</p>
            </div>

            <HighScoreStatus state={submissionState} isSubmitting={isSubmittingHighScore} infoMessage={infoMessage} />

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-full border border-primary-200 px-5 py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition"
              >
                モード選択へ戻る
              </button>
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center justify-center rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-primary-600 transition"
              >
                もう一度挑戦する
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type ResultStatProps = {
  label: string;
  value: string | number;
  accent?: string;
};

function ResultStat({ label, value, accent }: ResultStatProps) {
  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-4 text-center shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-widest text-primary-400 mb-2">{label}</div>
      <div className={`text-2xl font-bold ${accent ?? 'text-primary-700'}`}>{value}</div>
    </div>
  );
}

type HighScoreStatusProps = {
  state: 'idle' | 'success' | 'error' | 'skipped';
  isSubmitting: boolean;
  infoMessage?: string;
};

function HighScoreStatus({ state, isSubmitting, infoMessage }: HighScoreStatusProps) {
  if (isSubmitting) {
    return (
      <div className="rounded-xl bg-primary-50 border border-primary-100 px-4 py-3 text-sm text-primary-600">
        最高スコアを更新中...
      </div>
    );
  }

  if (state === 'idle' && infoMessage) {
    return (
      <div className="rounded-xl bg-primary-50 border border-primary-100 px-4 py-3 text-sm text-primary-600">
        {infoMessage}
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
        新しい自己ベストを登録しました！
      </div>
    );
  }

  if (state === 'skipped') {
    return (
      <div className="rounded-xl bg-primary-50 border border-primary-100 px-4 py-3 text-sm text-primary-600">
        自己ベストを更新できませんでした。また挑戦してみましょう！
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
        スコア登録に失敗しました。時間を置いて再試行してください。
      </div>
    );
  }

  return null;
}

function formatDuration(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}分${remainingSeconds.toString().padStart(2, '0')}秒`;
}
