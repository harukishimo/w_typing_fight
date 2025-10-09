import { create } from 'zustand';
import { RomajiMatcher } from '@/utils/romajiMatcher';
import { hiraganaToDefaultRomaji } from '@/utils/romajiPatterns';
import { fetchRandomWord } from '@/services/wordService';
import { SCORE_ATTACK_CONSTANTS, calculateDamage } from 'shared';
import type { Difficulty, ScoreAttackSummary, Word } from 'shared';

const TICK_INTERVAL_MS = 100;
const SCORE_DIFFICULTY = SCORE_ATTACK_CONSTANTS.DIFFICULTY as Difficulty;

let timerHandle: number | null = null;

type ScoreAttackStatus = 'idle' | 'playing' | 'finished';

interface ScoreAttackState {
  status: ScoreAttackStatus;
  currentWord: Word | null;
  currentInput: string;
  expectedRomaji: string;
  romajiMatcher: RomajiMatcher | null;
  combo: number;
  maxComboAchieved: number;
  noMissCount: number;
  maxNoMissCount: number;
  score: number;
  totalMisses: number;
  totalWords: number;
  timeRemainingMs: number;
  totalDurationMs: number;
  startedAt: string | null;
  startedAtMs: number | null;
  finishedAt: string | null;
  result: ScoreAttackSummary | null;
  isLoadingWord: boolean;
  currentWordMisses: number;
  lastTimeBonusAt: number | null;
  start: () => Promise<void>;
  reset: () => void;
  handleKeyPress: (key: string) => void;
  loadNextWord: () => Promise<void>;
  finishGame: () => void;
}

const clearTimer = () => {
  if (timerHandle !== null) {
    window.clearInterval(timerHandle);
    timerHandle = null;
  }
};

const initialState: Omit<ScoreAttackState, 'start' | 'reset' | 'handleKeyPress' | 'loadNextWord' | 'finishGame'> = {
  status: 'idle',
  currentWord: null,
  currentInput: '',
  expectedRomaji: '',
  romajiMatcher: null,
  combo: 0,
  maxComboAchieved: 0,
  score: 0,
  totalMisses: 0,
  totalWords: 0,
  timeRemainingMs: SCORE_ATTACK_CONSTANTS.INITIAL_DURATION_MS,
  totalDurationMs: SCORE_ATTACK_CONSTANTS.INITIAL_DURATION_MS,
  startedAt: null,
  startedAtMs: null,
  finishedAt: null,
  result: null,
  isLoadingWord: false,
  currentWordMisses: 0,
  noMissCount: 0,
  maxNoMissCount: 0,
  lastTimeBonusAt: null,
};

export const useScoreAttackStore = create<ScoreAttackState>((set, get) => ({
  ...initialState,

  start: async () => {
    if (get().status === 'playing') {
      return;
    }

    clearTimer();
    const startDate = new Date();

    set({
      ...initialState,
      status: 'playing',
      isLoadingWord: true,
      startedAt: startDate.toISOString(),
      startedAtMs: startDate.getTime(),
      finishedAt: null,
      result: null,
      timeRemainingMs: SCORE_ATTACK_CONSTANTS.INITIAL_DURATION_MS,
      totalDurationMs: SCORE_ATTACK_CONSTANTS.INITIAL_DURATION_MS,
      lastTimeBonusAt: null,
    });

    const startTimer = () => {
      clearTimer();
      timerHandle = window.setInterval(() => {
        const state = get();
        if (state.status !== 'playing') {
          clearTimer();
          return;
        }

        const newRemaining = state.timeRemainingMs - TICK_INTERVAL_MS;
        if (newRemaining <= 0) {
          clearTimer();
          set({ timeRemainingMs: 0 });
          get().finishGame();
          return;
        }

        set({ timeRemainingMs: newRemaining });
      }, TICK_INTERVAL_MS);
    };

    startTimer();
    await get().loadNextWord();
  },

  reset: () => {
    clearTimer();
    set({
      ...initialState,
    });
  },

  loadNextWord: async () => {
    set({ isLoadingWord: true });

    try {
      const word = await fetchRandomWord(SCORE_DIFFICULTY);
      const matcher = new RomajiMatcher(word.reading);

      if (get().status !== 'playing') {
        return;
      }

      set({
        currentWord: word,
        romajiMatcher: matcher,
        expectedRomaji: hiraganaToDefaultRomaji(word.reading),
        currentInput: '',
        currentWordMisses: 0,
        isLoadingWord: false,
      });
    } catch (error) {
      console.error('[ScoreAttack] Failed to load next word', error);
      set({ isLoadingWord: false });
      get().finishGame();
    }
  },

  finishGame: () => {
    const state = get();
    if (state.status === 'finished') {
      return;
    }

    clearTimer();
    const endDate = new Date();
    const durationMs = state.startedAtMs ? Math.max(0, endDate.getTime() - state.startedAtMs) : SCORE_ATTACK_CONSTANTS.INITIAL_DURATION_MS;

    const summary: ScoreAttackSummary = {
      score: state.score,
      totalWords: state.totalWords,
      totalMisses: state.totalMisses,
      maxNoMissCount: state.maxNoMissCount,
      durationMs,
      startedAt: state.startedAt ?? endDate.toISOString(),
      finishedAt: endDate.toISOString(),
    };

    set({
      status: 'finished',
      finishedAt: summary.finishedAt,
      result: summary,
      romajiMatcher: null,
      isLoadingWord: false,
    });
  },

  handleKeyPress: (key: string) => {
    const state = get();
    if (state.status !== 'playing' || !state.romajiMatcher || !state.currentWord) {
      return;
    }

    if (key.length !== 1) {
      return;
    }

    const { romajiMatcher } = state;
    const matchResult = romajiMatcher.handleInput(key);

    if (!matchResult.isMatch) {
      set({
        combo: 0,
        totalMisses: state.totalMisses + 1,
        currentWordMisses: state.currentWordMisses + 1,
        currentInput: romajiMatcher.getProgress().currentInput,
        noMissCount: 0,
        lastTimeBonusAt: null,
      });
      return;
    }

    const progress = romajiMatcher.getProgress();
    const threshold = SCORE_ATTACK_CONSTANTS.TIME_BONUS_NO_MISS_THRESHOLD;
    const prevNoMissCount = state.noMissCount;
    let nextNoMissCount = prevNoMissCount;
    let nextMaxNoMissCount = state.maxNoMissCount;
    let bonusMs = 0;

    if (matchResult.isComplete) {
      nextNoMissCount = prevNoMissCount + 1;
      nextMaxNoMissCount = Math.max(state.maxNoMissCount, nextNoMissCount);

      const prevThresholds = Math.floor(prevNoMissCount / threshold);
      const currentThresholds = Math.floor(nextNoMissCount / threshold);
      const bonusesEarned = currentThresholds - prevThresholds;
      if (bonusesEarned > 0) {
        bonusMs = bonusesEarned * SCORE_ATTACK_CONSTANTS.TIME_BONUS_MS;
      }
    }

    if (matchResult.isComplete && romajiMatcher.isFinished()) {
      const damage = calculateDamage(SCORE_DIFFICULTY, state.combo) * SCORE_ATTACK_CONSTANTS.DAMAGE_MULTIPLIER;
      const newCombo = state.combo + 1;
      const newScore = state.score + damage;
      const newMaxCombo = Math.max(state.maxComboAchieved, newCombo);
      const totalBonusMs = bonusMs;
      set({
        score: newScore,
        combo: newCombo,
        maxComboAchieved: newMaxCombo,
        totalWords: state.totalWords + 1,
        currentInput: '',
        currentWordMisses: 0,
        romajiMatcher: null,
        isLoadingWord: true,
        timeRemainingMs: state.timeRemainingMs + totalBonusMs,
        totalDurationMs: state.totalDurationMs + totalBonusMs,
        noMissCount: nextNoMissCount,
        maxNoMissCount: nextMaxNoMissCount,
        ...(totalBonusMs > 0 ? { lastTimeBonusAt: Date.now() } : {}),
      });

      void get().loadNextWord();
      return;
    }

    if (matchResult.isComplete) {
      set({
        currentInput: '',
        noMissCount: nextNoMissCount,
        maxNoMissCount: nextMaxNoMissCount,
        timeRemainingMs: state.timeRemainingMs + bonusMs,
        totalDurationMs: state.totalDurationMs + bonusMs,
        ...(bonusMs > 0 ? { lastTimeBonusAt: Date.now() } : {}),
      });
      return;
    }

    set({
      currentInput: progress.currentInput,
    });
  },
}));
