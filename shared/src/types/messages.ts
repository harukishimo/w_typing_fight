/**
 * WebSocket メッセージ型定義
 * クライアント ⇄ サーバー間の通信プロトコル
 */

import type { Difficulty, PlayerState, Word } from './game';

// ============================================================
// Client → Server メッセージ
// ============================================================

/**
 * プレイヤー参加リクエスト
 */
export interface JoinMessage {
  type: 'join';
  playerName: string;
  difficulty: Difficulty;
}

/**
 * 準備完了
 */
export interface ReadyMessage {
  type: 'ready';
}

/**
 * 攻撃（お題クリア）
 */
export interface AttackMessage {
  type: 'attack';
  wordId: string;
  timeTaken: number;  // ミリ秒
  missCount: number;  // このお題でのミス回数
}

/**
 * ミス
 */
export interface MissMessage {
  type: 'miss';
}

/**
 * クライアントから送信可能なメッセージ
 */
export type ClientMessage =
  | JoinMessage
  | ReadyMessage
  | AttackMessage
  | MissMessage;

// ============================================================
// Server → Client メッセージ
// ============================================================

/**
 * 参加成功
 */
export interface JoinedMessage {
  type: 'joined';
  playerId: string;
  roomId: string;
  playerCount: number;
}

/**
 * プレイヤー情報更新
 */
export interface PlayerUpdateMessage {
  type: 'playerUpdate';
  players: PlayerState[];
}

/**
 * ゲーム開始
 */
export interface GameStartMessage {
  type: 'gameStart';
  round: number;
  words: {
    [playerId: string]: Word;
  };
}

/**
 * 攻撃通知
 */
export interface AttackNotificationMessage {
  type: 'attackNotification';
  attackerId: string;
  targetId: string;
  damage: number;
  combo: number;
  targetHp: number;
  nextWord: Word;
}

/**
 * ミス通知
 */
export interface MissNotificationMessage {
  type: 'missNotification';
  playerId: string;
  missCount: number;
}

/**
 * ラウンド終了
 */
export interface RoundEndMessage {
  type: 'roundEnd';
  round: number;
  winnerId: string;
  players: PlayerState[];
}

/**
 * ゲーム終了
 */
export interface GameEndMessage {
  type: 'gameEnd';
  winnerId: string;
  players: PlayerState[];
}

/**
 * プレイヤー退出
 */
export interface PlayerLeftMessage {
  type: 'playerLeft';
  playerId: string;
}

/**
 * エラー
 */
export interface ErrorMessage {
  type: 'error';
  message: string;
}

/**
 * サーバーから送信可能なメッセージ
 */
export type ServerMessage =
  | JoinedMessage
  | PlayerUpdateMessage
  | GameStartMessage
  | AttackNotificationMessage
  | MissNotificationMessage
  | RoundEndMessage
  | GameEndMessage
  | PlayerLeftMessage
  | ErrorMessage;

/**
 * 全メッセージ型
 */
export type Message = ClientMessage | ServerMessage;
