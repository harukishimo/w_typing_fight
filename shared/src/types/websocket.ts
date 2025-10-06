/**
 * WebSocket メッセージの型定義
 */

import type { Difficulty, PlayerState, Word } from './game';

export type WSMessageType =
  | 'join'
  | 'ready'
  | 'start'
  | 'attack'
  | 'miss'
  | 'roomUpdate'
  | 'roundEnd'
  | 'matchEnd'
  | 'error';

export interface WSMessage {
  type: WSMessageType;
  payload?: unknown;
}

// クライアント → サーバー

export interface JoinMessage extends WSMessage {
  type: 'join';
  payload: {
    playerName: string;
    roomId: string;
  };
}

export interface ReadyMessage extends WSMessage {
  type: 'ready';
  payload: {
    playerId: string;
    difficulty: Difficulty;
  };
}

export interface AttackMessage extends WSMessage {
  type: 'attack';
  payload: {
    playerId: string;
    wordCompleted: string;
    timeTaken: number;
    missCount: number;
  };
}

export interface MissMessage extends WSMessage {
  type: 'miss';
  payload: {
    playerId: string;
  };
}

// サーバー → クライアント

export interface RoomUpdateMessage extends WSMessage {
  type: 'roomUpdate';
  payload: {
    players: PlayerState[];
    status: string;
    currentRound: number;
  };
}

export interface StartMessage extends WSMessage {
  type: 'start';
  payload: {
    countdown: number;
    words: Record<string, Word>;
  };
}

export interface AttackResultMessage extends WSMessage {
  type: 'attack';
  payload: {
    attackerId: string;
    targetId: string;
    damage: number;
    combo: number;
    targetHp: number;
    targetLives: number;
  };
}

export interface RoundEndMessage extends WSMessage {
  type: 'roundEnd';
  payload: {
    roundWinner: string;
    nextRound: number;
  };
}

export interface MatchEndMessage extends WSMessage {
  type: 'matchEnd';
  payload: {
    winner: string;
    matchResult: unknown;
  };
}

export interface ErrorMessage extends WSMessage {
  type: 'error';
  payload: {
    message: string;
  };
}
