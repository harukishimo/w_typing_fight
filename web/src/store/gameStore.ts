/**
 * ゲーム状態管理ストア (Zustand)
 */

import { create } from 'zustand';
import type { Difficulty, Word, PlayerState } from 'shared';
import { calculateDamage, GAME_CONSTANTS, getRandomWord } from 'shared';
import { RomajiMatcher } from '@/utils/romajiMatcher';

type GameMode = 'solo' | 'match';

interface MatchCompletionPayload {
  wordId: string;
  timeTaken: number;
  missCount: number;
}

interface GameState {
  // ゲーム設定
  difficulty: Difficulty | null;
  currentWord: Word | null;

  // プレイヤー状態
  hp: number;
  lives: number;
  combo: number;
  missCount: number;
  totalAttacks: number;

  // 入力状態
  currentInput: string;
  currentCharIndex: number;
  expectedRomaji: string; // 期待されるローマ字列
  romajiMatcher: RomajiMatcher | null; // 動的マッチャー
  currentWordMisses: number;

  // ゲーム進行
  isPlaying: boolean;
  startTime: number | null;
  mode: GameMode;

  // コールバック
  onWordComplete: ((payload: MatchCompletionPayload) => void) | null;
  onMiss: (() => void) | null;

  // アクション
  setDifficulty: (difficulty: Difficulty) => void;
  startGame: () => void;
  startMatchGame: (params: {
    difficulty: Difficulty;
    word: Word;
    onWordComplete: (payload: MatchCompletionPayload) => void;
    onMiss: () => void;
  }) => void;
  handleKeyPress: (key: string) => void;
  resetGame: () => void;
  nextWord: () => void;
  setMatchWord: (word: Word) => void;
  endMatchGame: () => void;
  syncPlayerState: (player: Pick<PlayerState, 'hp' | 'lives' | 'combo' | 'missCount'>) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // 初期状態
  difficulty: null,
  currentWord: null,
  hp: GAME_CONSTANTS.INITIAL_HP,
  lives: GAME_CONSTANTS.INITIAL_LIVES,
  combo: 0,
  missCount: 0,
  totalAttacks: 0,
  currentInput: '',
  currentCharIndex: 0,
  expectedRomaji: '',
  romajiMatcher: null,
  currentWordMisses: 0,
  isPlaying: false,
  startTime: null,
  mode: 'solo',
  onWordComplete: null,
  onMiss: null,

  // 難易度設定
  setDifficulty: (difficulty) => {
    set({ difficulty });
  },

  // ゲーム開始
  startGame: () => {
    const { difficulty } = get();
    if (!difficulty) return;

    const word = getRandomWord(difficulty);
    const matcher = new RomajiMatcher(word.reading);

    set({
      currentWord: word,
      expectedRomaji: word.romaji,
      romajiMatcher: matcher,
      hp: GAME_CONSTANTS.INITIAL_HP,
      lives: GAME_CONSTANTS.INITIAL_LIVES,
      combo: 0,
      missCount: 0,
      totalAttacks: 0,
      currentInput: '',
      currentCharIndex: 0,
      currentWordMisses: 0,
      isPlaying: true,
      startTime: Date.now(),
      mode: 'solo',
      onWordComplete: null,
      onMiss: null,
    });
  },

  // マッチ戦開始
  startMatchGame: ({ difficulty, word, onWordComplete, onMiss }) => {
    const matcher = new RomajiMatcher(word.reading);

    set({
      difficulty,
      currentWord: word,
      expectedRomaji: word.romaji,
      romajiMatcher: matcher,
      currentInput: '',
      currentCharIndex: 0,
      currentWordMisses: 0,
      isPlaying: true,
      startTime: Date.now(),
      mode: 'match',
      onWordComplete,
      onMiss,
    });
  },

  // キー入力処理
  handleKeyPress: (key) => {
    const state = get();
    if (!state.isPlaying || !state.currentWord || !state.romajiMatcher) return;

    const { romajiMatcher, difficulty, combo } = state;

    // 動的マッチング
    const result = romajiMatcher.handleInput(key);

    if (!result.isMatch) {
      // ミス
      console.log(`❌ ミス！入力: ${key}`);
      if (state.mode === 'match' && state.onMiss) {
        state.onMiss();
      }
      set({
        combo: 0,
        missCount: state.missCount + 1,
        currentWordMisses: state.currentWordMisses + 1,
      });
      return;
    }

    if (result.isComplete) {
      // 1文字確定
      console.log(`✅ 文字確定: ${result.completedChar}`);

      // お題全体が完了したかチェック
      if (romajiMatcher.isFinished()) {
        if (!difficulty) return;

        if (state.mode === 'solo') {
          // ダメージ計算
          const damage = calculateDamage(difficulty, combo);
          const newCombo = combo + 1;
          const newTotalAttacks = state.totalAttacks + 1;

          console.log(`✅ お題完了! ダメージ: ${damage}, コンボ: ${newCombo}`);

          // 次のお題へ
          setTimeout(() => {
            get().nextWord();
          }, 500);

          set({
            currentInput: '',
            currentCharIndex: romajiMatcher.getProgress().completedChars,
            combo: newCombo,
            totalAttacks: newTotalAttacks,
          });
        } else {
          const timeTaken = state.startTime ? Date.now() - state.startTime : 0;
          const payload: MatchCompletionPayload = {
            wordId: state.currentWord.id,
            timeTaken,
            missCount: state.currentWordMisses,
          };

          console.log(`✅ お題完了! マッチ送信:`, payload);
          state.onWordComplete?.(payload);

          set({
            currentInput: '',
            currentCharIndex: romajiMatcher.getProgress().completedChars,
            romajiMatcher: null,
            startTime: null,
          });
        }
      } else {
        // 次の文字へ
        set({
          currentInput: '',
          currentCharIndex: romajiMatcher.getProgress().completedChars,
        });
      }
    } else {
      // 部分一致 - 入力継続
      const progress = romajiMatcher.getProgress();
      set({
        currentInput: progress.currentInput,
      });
    }
  },

  // 次のお題へ
  nextWord: () => {
    const { difficulty } = get();
    if (!difficulty) return;

    const word = getRandomWord(difficulty);
    const matcher = new RomajiMatcher(word.reading);

    set({
      currentWord: word,
      expectedRomaji: word.romaji,
      romajiMatcher: matcher,
      currentInput: '',
      currentCharIndex: 0,
      startTime: Date.now(),
    });
  },

  setMatchWord: (word) => {
    const state = get();
    if (state.mode !== 'match') return;

    const matcher = new RomajiMatcher(word.reading);

    set({
      currentWord: word,
      expectedRomaji: word.romaji,
      romajiMatcher: matcher,
      currentInput: '',
      currentCharIndex: 0,
      currentWordMisses: 0,
      startTime: Date.now(),
    });
  },

  endMatchGame: () => {
    set({
      mode: 'solo',
      onWordComplete: null,
      onMiss: null,
      romajiMatcher: null,
      isPlaying: false,
      startTime: null,
    });
  },

  syncPlayerState: (player) => {
    set({
      hp: player.hp,
      lives: player.lives,
      combo: player.combo,
      missCount: player.missCount,
    });
  },

  // ゲームリセット
  resetGame: () => {
    set({
      difficulty: null,
      currentWord: null,
      hp: GAME_CONSTANTS.INITIAL_HP,
      lives: GAME_CONSTANTS.INITIAL_LIVES,
      combo: 0,
      missCount: 0,
      totalAttacks: 0,
      currentInput: '',
      currentCharIndex: 0,
      romajiMatcher: null,
      currentWordMisses: 0,
      isPlaying: false,
      startTime: null,
      mode: 'solo',
      onWordComplete: null,
      onMiss: null,
    });
  },
}));
