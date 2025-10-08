/**
 * ゲーム関連の型定義
 */

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD' | 'SCORE';

export interface DifficultyConfig {
  difficulty: Difficulty;
  charRange: [number, number];  // [min, max] 文字数範囲
  baseDamage: number;            // 基礎ダメージ
  maxCombo: number;              // コンボ上限
  expectedTime: number;          // 想定クリア時間（秒）
  theoreticalDPS: number;        // 理論DPS
}

export interface Word {
  id: string;
  text: string;        // 表示用（漢字混じり）
  reading: string;     // マッチング用（ひらがなのみ）
  romaji: string;      // ローマ字表記
  difficulty: Difficulty;
  charCount: number;
  category?: string;
}

export interface PlayerState {
  playerId: string;
  playerName: string;
  difficulty: Difficulty;
  hp: number;
  lives: number;
  combo: number;
  missCount: number;
  currentWord: Word | null;
  isReady: boolean;
}

export interface RoomState {
  roomId: string;
  players: Map<string, PlayerState>;
  currentRound: number;
  maxRounds: number;
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  winner: string | null;
}

export interface MatchResult {
  id: string;
  roomId: string;
  player1Name: string;
  player1Difficulty: Difficulty;
  player1Score: number;
  player1MissCount: number;
  player2Name: string;
  player2Difficulty: Difficulty;
  player2Score: number;
  player2MissCount: number;
  winner: string;
  roundsPlayed: number;
  createdAt: string;
}
