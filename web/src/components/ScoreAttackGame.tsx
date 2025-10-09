import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SCORE_ATTACK_CONSTANTS } from 'shared';
import { useScoreAttackStore } from '@/store/scoreAttackStore';
import { useScoreAttackLeaderboardStore } from '@/store/scoreAttackLeaderboardStore';
import { ScoreAttackResultModal } from './ScoreAttackResultModal';
import { upsertScoreAttackHighScore } from '@/services/scoreAttackService';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { Countdown } from './Countdown';

type Props = {
  onBack: () => void;
};

type SubmissionState = 'idle' | 'success' | 'error' | 'skipped';

export function ScoreAttackGame({ onBack }: Props) {
  const status = useScoreAttackStore(state => state.status);
  const currentWord = useScoreAttackStore(state => state.currentWord);
  const currentInput = useScoreAttackStore(state => state.currentInput);
  const romajiMatcher = useScoreAttackStore(state => state.romajiMatcher);
  const noMissCount = useScoreAttackStore(state => state.noMissCount);
  const maxNoMissCount = useScoreAttackStore(state => state.maxNoMissCount);
  const score = useScoreAttackStore(state => state.score);
  const totalMisses = useScoreAttackStore(state => state.totalMisses);
  const totalWords = useScoreAttackStore(state => state.totalWords);
  const timeRemainingMs = useScoreAttackStore(state => state.timeRemainingMs);
  const totalDurationMs = useScoreAttackStore(state => state.totalDurationMs);
  const lastTimeBonusAt = useScoreAttackStore(state => state.lastTimeBonusAt);
  const start = useScoreAttackStore(state => state.start);
  const reset = useScoreAttackStore(state => state.reset);
  const handleKeyPress = useScoreAttackStore(state => state.handleKeyPress);
  const isLoadingWord = useScoreAttackStore(state => state.isLoadingWord);
  const result = useScoreAttackStore(state => state.result);

  const [isSubmittingHighScore, setIsSubmittingHighScore] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isTimeBonusVisible, setIsTimeBonusVisible] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(3);

  const user = useAuthStore(state => state.user);
  const supabaseReady = useAuthStore(state => state.supabaseReady);
  const profileDisplayName = useProfileStore(state => state.displayName);
  const profileFallbackName = useProfileStore(state => state.fallbackName);
  const fetchScoreLeaderboard = useScoreAttackLeaderboardStore(state => state.fetchLeaderboard);
  const scoreSupabaseReady = useScoreAttackLeaderboardStore(state => state.supabaseReady);

  useEffect(() => {
    if (countdown === null) return;

    const timer = window.setTimeout(() => {
      if (countdown === 0) {
        void start();
        setCountdown(null);
      } else {
        setCountdown(prev => (prev === null ? prev : prev - 1));
      }
    }, countdown === 0 ? 900 : 1000);

    return () => window.clearTimeout(timer);
  }, [countdown, start]);

  useEffect(() => () => reset(), [reset]);

  useEffect(() => {
    if (status === 'playing') {
      setSubmissionState('idle');
      setHasSubmitted(false);
    }
  }, [status]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (status !== 'playing') return;
      if (event.key.length !== 1) return;
      handleKeyPress(event.key);
    };

    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [status, handleKeyPress]);

  useEffect(() => {
    if (status !== 'finished' || !result) {
      return;
    }

    if (hasSubmitted) {
      return;
    }

    if (!user || !supabaseReady) {
      setSubmissionState(prev => (prev === 'idle' ? prev : 'idle'));
      setHasSubmitted(true);
      return;
    }

    let cancelled = false;
    const submit = async () => {
      setIsSubmittingHighScore(true);
      const displayName = profileDisplayName || profileFallbackName || user.email || 'Player';

      const outcome = await upsertScoreAttackHighScore({
        userId: user.id,
        displayName,
        score: result.score,
      });

      if (cancelled) return;

      setIsSubmittingHighScore(false);
      setHasSubmitted(true);

      if (outcome === 'inserted' || outcome === 'updated') {
        setSubmissionState('success');
        if (scoreSupabaseReady) {
          void fetchScoreLeaderboard();
        }
      } else if (outcome === 'skipped' || outcome === 'no-op') {
        setSubmissionState('skipped');
      } else {
        setSubmissionState('error');
      }
    };

    void submit();

    return () => {
      cancelled = true;
    };
  }, [status, result, user, supabaseReady, hasSubmitted, profileDisplayName, profileFallbackName, fetchScoreLeaderboard, scoreSupabaseReady]);

  const nextCharHint = romajiMatcher?.getNextCharHint() ?? '';
  const remainingInput = romajiMatcher?.getRemainingInputDisplay() ?? '';

  const timeRatio = totalDurationMs > 0 ? Math.max(0, Math.min(1, timeRemainingMs / totalDurationMs)) : 0;
  const remainingSeconds = Math.max(0, Math.ceil(timeRemainingMs / 1000));
  const timeDisplay = formatSeconds(remainingSeconds);

  const handleExit = () => {
    reset();
    onBack();
  };

  const handleRetry = () => {
    setSubmissionState('idle');
    setHasSubmitted(false);
    setIsSubmittingHighScore(false);
    void start();
  };

  const infoMessage = !user
    ? 'ログインすると最高スコアが保存されます。'
    : !supabaseReady
      ? 'スコア保存の設定が完了していないため記録できません。'
      : undefined;

  useEffect(() => {
    if (!lastTimeBonusAt) return;
    setIsTimeBonusVisible(true);
    const timer = window.setTimeout(() => setIsTimeBonusVisible(false), 750);
    return () => window.clearTimeout(timer);
  }, [lastTimeBonusAt]);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden">
      <Countdown count={countdown} />
      <AnimatePresence>
        {isTimeBonusVisible && (
          <>
            <motion.div
              key="bonus-flare-left"
              className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-amber-400/60 via-amber-200/40 to-transparent blur-sm"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              key="bonus-flare-right"
              className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-amber-400/60 via-amber-200/40 to-transparent blur-sm"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.3 }}
            />
          </>
        )}
      </AnimatePresence>

      <div className="relative w-full max-w-5xl space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary-800">Score Attack Mode</h1>
            <p className="text-sm text-primary-500">
              60秒で出来るだけ多くの課題をクリアしよう！20文字連続でノーミス入力すると +1 秒ボーナス。
            </p>
          </div>
          <button
            type="button"
            onClick={handleExit}
            className="self-start inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-primary-600 transition"
          >
            ← モード選択へ
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard icon="⏱️" label="残り時間" value={timeDisplay} accent="text-primary-600" />
          <StatCard icon="✨" label="ノーミスタイプ" value={`${noMissCount} 文字`} accent="text-rose-600" />
          <StatCard icon="💥" label="スコア" value={score.toLocaleString()} accent="text-amber-600" />
          <StatCard icon="✅" label="クリア課題" value={`${totalWords} 個`} accent="text-emerald-600" />
        </section>

        <div className="rounded-2xl bg-white shadow-2xl p-8">
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center justify-between text-xs text-primary-400 mb-2">
                <span>タイムゲージ</span>
                <span>最多ノーミスタイプ: {maxNoMissCount}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-primary-100">
                <motion.div
                  className="h-3 rounded-full bg-gradient-to-r from-primary-400 to-primary-600"
                  initial={{ width: '100%' }}
                  animate={{ width: `${timeRatio * 100}%` }}
                  transition={{ ease: 'easeOut', duration: 0.2 }}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-[2fr_1fr] gap-6">
              <div className="space-y-4">
                <div className="text-sm text-primary-400">お題</div>
                <div className="rounded-2xl border border-primary-100 bg-primary-50/70 px-6 py-8 text-center shadow-inner">
                  {isLoadingWord || !currentWord ? (
                    <span className="text-primary-300 text-sm">お題を読み込んでいます...</span>
                  ) : (
                    <span className="text-5xl font-bold text-primary-800 leading-tight break-words">
                      {currentWord.text}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-primary-400">入力</div>
                  <div className="rounded-2xl border border-primary-100 bg-white px-4 py-3 font-mono text-xl text-primary-700 break-words">
                    <span className="text-emerald-600">{currentInput}</span>
                    <span className="text-primary-200">{remainingInput}</span>
                  </div>
                </div>

                <div className="text-sm text-primary-500">
                  💡 次の文字: <span className="font-bold text-primary-700">{nextCharHint || '-'}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-primary-100 bg-primary-50/80 p-5 space-y-4 text-sm text-primary-600">
                <h2 className="text-base font-semibold text-primary-700">ルール</h2>
                <ul className="space-y-2 list-disc pl-4">
                  <li>制限時間は {SCORE_ATTACK_CONSTANTS.INITIAL_DURATION_MS / 1000} 秒。</li>
                  <li>20文字連続でノーミス入力すると +1 秒ボーナス。</li>
                  <li>スコアは課題の攻撃力の合計値で計算されます。</li>
                  <li>ログイン状態なら最高スコアを自動登録します。</li>
                </ul>
                <div className="rounded-xl border border-primary-200 bg-white px-3 py-2 text-xs text-primary-500">
                  ミス: {totalMisses} 回
                </div>
              </div>
            </div>
          </div>
        </div>

        <ScoreAttackResultModal
          isOpen={status === 'finished'}
          summary={result}
          onClose={handleExit}
          onRetry={handleRetry}
          isSubmittingHighScore={isSubmittingHighScore}
          submissionState={submissionState}
          infoMessage={infoMessage}
        />
      </div>
    </div>
  );
}

type StatCardProps = {
  icon: string;
  label: string;
  value: string | number;
  accent?: string;
};

function StatCard({ icon, label, value, accent }: StatCardProps) {
  return (
    <motion.div
      className="rounded-2xl border border-primary-100 bg-white p-6 shadow"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between">
        <span className="text-3xl">{icon}</span>
        <span className="text-xs text-primary-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className={`mt-4 text-2xl font-bold ${accent ?? 'text-primary-700'}`}>{value}</div>
    </motion.div>
  );
}

function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
