import { create } from 'zustand';
import type {
  ClientMessage,
  Difficulty,
  PlayerState,
  ServerMessage,
  Word,
} from 'shared';
import { useGameStore } from './gameStore';
import { useAuthStore } from '@/store/authStore';

// WebSocket URL設定
// Pages Functionsを使用するため、同一ドメインで接続
const getWorkerUrl = (): string => {
  // 環境変数が設定されている場合はそれを使用
  if (import.meta.env.VITE_WORKER_WS_URL) {
    return import.meta.env.VITE_WORKER_WS_URL;
  }

  // 開発環境: ローカルWorkers Dev Server
  if (import.meta.env.DEV) {
    return 'ws://localhost:8787';
  }

  // 本番環境: Pages Functions (同一ドメイン)
  // https://w-typing-fight.pages.dev → wss://w-typing-fight.pages.dev
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}`;
};

const DEFAULT_WORKER_URL = getWorkerUrl();

type MatchStatus =
  | 'idle'
  | 'connecting'
  | 'waiting'
  | 'countdown'
  | 'ready'
  | 'playing'
  | 'finished';

interface JoinOptions {
  roomId: string;
  playerName: string;
  difficulty: Difficulty;
}

interface MatchState {
  roomId: string;
  playerId: string | null;
  playerName: string;
  difficulty: Difficulty | null;
  status: MatchStatus;
  players: PlayerState[];
  round: number;
  currentWord: Word | null;
  roundIntro: number | null;
  countdown: number | null;
  error: string | null;
  socket: WebSocket | null;
  gameResult: { winnerId: string; players: PlayerState[] } | null;

  joinRoom: (options: JoinOptions) => void;
  sendReady: () => void;
  leaveRoom: () => void;
  clearError: () => void;
}

const initialState: Omit<MatchState, 'joinRoom' | 'sendReady' | 'leaveRoom' | 'clearError'> = {
  roomId: '',
  playerId: null,
  playerName: '',
  difficulty: null,
  status: 'idle',
  players: [],
  round: 1,
  currentWord: null,
  roundIntro: null,
  countdown: null,
  error: null,
  socket: null,
  gameResult: null,
};

export const useMatchStore = create<MatchState>((set, get) => ({
  ...initialState,

  joinRoom: ({ roomId, playerName, difficulty }) => {
    const trimmedRoomId = roomId.trim();
    if (!trimmedRoomId) {
      set({ error: 'ルームコードを入力してください。' });
      return;
    }

    const { session, user } = useAuthStore.getState();
    const authPayload =
      session?.access_token && user?.id
        ? { accessToken: session.access_token, userId: user.id }
        : undefined;

    const wsUrl = `${DEFAULT_WORKER_URL}/?roomId=${encodeURIComponent(trimmedRoomId)}`;

    try {
      console.log('[MatchStore] creating WebSocket to', wsUrl);
      const socket = new WebSocket(wsUrl);

      set({
        status: 'connecting',
        roomId: trimmedRoomId,
        playerName,
        difficulty,
        socket,
        error: null,
        gameResult: null,
      });

      const handleServerMessage = (message: ServerMessage) => {
        switch (message.type) {
          case 'joined': {
            set({
              playerId: message.playerId,
              roomId: message.roomId,
              status: 'waiting',
            });
            window.history.pushState(null, '', `/room/${message.roomId}`);
            break;
          }
          case 'playerUpdate': {
            const gameStore = useGameStore.getState();

            set(state => {
              const { playerId } = state;
              let nextStatus = state.status;
              const self = playerId
                ? message.players.find(p => p.playerId === playerId) ?? null
                : null;

              if (state.status === 'countdown') {
                return {
                players: message.players,
                status: state.status,
              };
            }

              if (self) {
                gameStore.syncPlayerState(self);
              }

              if (state.status !== 'playing' && state.status !== 'finished') {
                if (!playerId || !self) {
                  nextStatus = 'waiting';
                } else {
                  nextStatus = self.isReady ? 'ready' : 'waiting';
                }
              }

              return {
                players: message.players,
                status: nextStatus,
              };
            });

            break;
          }
          case 'roundIntro': {
            const gameStore = useGameStore.getState();
            gameStore.pauseMatchRound();
            set({
              status: 'countdown',
              roundIntro: message.round,
              countdown: null,
              round: message.round,
              gameResult: null,
            });
            break;
          }
          case 'countdown': {
            set(state => ({
              countdown: message.count,
              roundIntro: message.count >= 0 ? null : state.roundIntro,
              status:
                message.count >= 0 && state.status !== 'playing'
                  ? 'countdown'
                  : state.status,
            }));
            break;
          }
          case 'gameStart': {
            const { playerId } = get();
            if (!playerId) break;

            const assignedWord = message.words[playerId];
            if (!assignedWord) break;

            set({
              status: 'playing',
              round: message.round,
              currentWord: assignedWord,
              roundIntro: null,
              countdown: null,
              gameResult: null,
            });

            const gameStore = useGameStore.getState();
            const difficulty = get().difficulty ?? 'EASY';
            gameStore.startMatchGame({
              difficulty,
              word: assignedWord,
              onWordComplete: (payload) => {
                const { socket } = get();
                if (!socket || socket.readyState !== WebSocket.OPEN) return;

                const attackMessage: ClientMessage = {
                  type: 'attack',
                  wordId: payload.wordId,
                  timeTaken: payload.timeTaken,
                  missCount: payload.missCount,
                };
                socket.send(JSON.stringify(attackMessage));
              },
              onMiss: () => {
                const { socket } = get();
                if (!socket || socket.readyState !== WebSocket.OPEN) return;
                const missMessage: ClientMessage = {
                  type: 'miss',
                };
                socket.send(JSON.stringify(missMessage));
              },
            });

            break;
          }
          case 'attackNotification': {
            const { playerId } = get();
            if (playerId && message.attackerId === playerId) {
              set({ currentWord: message.nextWord });
              const gameStore = useGameStore.getState();
              gameStore.setMatchWord(message.nextWord);
            }
            break;
          }
          case 'missNotification': {
            break;
          }
          case 'knockout': {
            const gameStore = useGameStore.getState();
            gameStore.pauseMatchRound();
            set({ countdown: null, status: 'countdown', roundIntro: null });
            break;
          }
          case 'roundEnd': {
            set({ status: 'countdown', round: message.round });
            break;
          }
          case 'gameEnd': {
            set({
              status: 'finished',
              countdown: null,
              roundIntro: null,
              gameResult: {
                winnerId: message.winnerId,
                players: message.players,
              },
            });
            const gameStore = useGameStore.getState();
            gameStore.endMatchGame();
            break;
          }
          case 'playerLeft': {
            set(state => ({
              players: state.players.filter(p => p.playerId !== message.playerId),
            }));
            break;
          }
          case 'error': {
            set({ error: message.message });
            break;
          }
          default:
            break;
        }
      };

      socket.onopen = () => {
        console.log('[MatchStore] WebSocket open, sending join');
        const joinMessage: ClientMessage = authPayload
          ? {
              type: 'join',
              playerName,
              difficulty,
              auth: authPayload,
            }
          : {
              type: 'join',
              playerName,
              difficulty,
            };
        socket.send(JSON.stringify(joinMessage));
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data as string) as ServerMessage;
          console.log('[MatchStore] Received message', message);
          handleServerMessage(message);
        } catch (error) {
          console.error('[MatchStore] Failed to parse message', event.data, error);
        }
      };

      socket.onerror = (event) => {
        console.error('[MatchStore] WebSocket error', event);
        set({ error: '接続中にエラーが発生しました。', status: 'idle' });
        window.history.replaceState(null, '', '/match');
      };

      socket.onclose = (event) => {
        console.log('[MatchStore] WebSocket closed', event);
        const gameStore = useGameStore.getState();
        gameStore.endMatchGame();

        set(state => {
          if (state.status === 'finished') {
            return {
              ...state,
              socket: null,
            };
          }
          window.history.replaceState(null, '', '/match');
          return { ...initialState };
        });
      };
    } catch (error) {
      console.error('WebSocket connection error', error);
      set({ error: 'WebSocket接続に失敗しました。', status: 'idle' });
    }
  },

  sendReady: () => {
    const { socket, status } = get();
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    if (status === 'ready' || status === 'playing') return;

    const readyMessage: ClientMessage = { type: 'ready' };
    socket.send(JSON.stringify(readyMessage));
  },

  leaveRoom: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
    }
    set(() => ({ ...initialState }));
  },

  clearError: () => set({ error: null }),
}));
