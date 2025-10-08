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

export const useMatchStore = create<MatchState>((set, get) => {
  const HEARTBEAT_INTERVAL = 30_000;
  const HEARTBEAT_TIMEOUT = HEARTBEAT_INTERVAL * 2;
  const RECONNECT_DELAY = 2_000;
  const MAX_RECONNECT_ATTEMPTS = 5;

  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let manualDisconnect = false;
  let lastPongAt = 0;
  let reconnectAttempts = 0;
  let lastJoinOptions: JoinOptions | null = null;

  const clearHeartbeat = () => {
    if (heartbeatTimer !== null) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  };

  const clearReconnectTimer = () => {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const cleanupTimers = () => {
    clearHeartbeat();
    clearReconnectTimer();
  };

  const startHeartbeat = (socket: WebSocket) => {
    clearHeartbeat();
    lastPongAt = Date.now();
    heartbeatTimer = setInterval(() => {
      if (socket.readyState !== WebSocket.OPEN) {
        return;
      }

      const now = Date.now();
      if (now - lastPongAt > HEARTBEAT_TIMEOUT) {
        console.warn('[MatchStore] Heartbeat timeout detected, closing socket');
        socket.close();
        return;
      }

      const pingMessage: ClientMessage = { type: 'ping' };
      socket.send(JSON.stringify(pingMessage));
    }, HEARTBEAT_INTERVAL);
  };

  const scheduleReconnect = () => {
    clearReconnectTimer();

    if (!lastJoinOptions) {
      return;
    }

    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.warn('[MatchStore] Reconnect attempts exceeded');
      manualDisconnect = true;
      lastJoinOptions = null;
      cleanupTimers();
      window.history.replaceState(null, '', '/match');
      set(() => ({
        ...initialState,
        error: '接続が切断されました。もう一度入室してください。',
      }));
      return;
    }

    reconnectAttempts += 1;
    const delay = RECONNECT_DELAY * reconnectAttempts;
    console.log('[MatchStore] Scheduling reconnect attempt', reconnectAttempts, 'in', delay, 'ms');

    reconnectTimer = setTimeout(() => {
      if (!lastJoinOptions) {
        return;
      }
      console.log('[MatchStore] Attempting reconnect', reconnectAttempts);
      connect(lastJoinOptions);
    }, delay);
  };

  const connect = (options: JoinOptions) => {
    const trimmedRoomId = options.roomId.trim();
    if (!trimmedRoomId) {
      set({ error: 'ルームコードを入力してください。' });
      return;
    }

    manualDisconnect = false;
    lastJoinOptions = { ...options, roomId: trimmedRoomId };
    cleanupTimers();

    const wsUrl = `${DEFAULT_WORKER_URL}/?roomId=${encodeURIComponent(trimmedRoomId)}`;

    try {
      console.log('[MatchStore] creating WebSocket to', wsUrl);
      const socket = new WebSocket(wsUrl);

      set({
        status: 'connecting',
        roomId: trimmedRoomId,
        playerName: options.playerName,
        difficulty: options.difficulty,
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

              if (self) {
                gameStore.syncPlayerState(self);
              }

              if (state.status === 'countdown') {
                return {
                  players: message.players,
                  status: state.status,
                };
              }

              if (state.status !== 'playing' && state.status !== 'finished') {
                nextStatus = !playerId || !self ? 'waiting' : self.isReady ? 'ready' : 'waiting';
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
                const { socket: currentSocket } = get();
                if (!currentSocket || currentSocket.readyState !== WebSocket.OPEN) return;

                const attackMessage: ClientMessage = {
                  type: 'attack',
                  wordId: payload.wordId,
                  timeTaken: payload.timeTaken,
                  missCount: payload.missCount,
                };
                currentSocket.send(JSON.stringify(attackMessage));
              },
              onMiss: () => {
                const { socket: currentSocket } = get();
                if (!currentSocket || currentSocket.readyState !== WebSocket.OPEN) return;
                const missMessage: ClientMessage = {
                  type: 'miss',
                };
                currentSocket.send(JSON.stringify(missMessage));
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
          case 'pong': {
            lastPongAt = Date.now();
            break;
          }
          default:
            break;
        }
      };

      socket.onopen = () => {
        console.log('[MatchStore] WebSocket open, sending join');
        reconnectAttempts = 0;
        lastPongAt = Date.now();
        startHeartbeat(socket);

        const { session, user } = useAuthStore.getState();
        const authPayload =
          session?.access_token && user?.id
            ? { accessToken: session.access_token, userId: user.id }
            : undefined;

        const joinMessage: ClientMessage = authPayload
          ? {
              type: 'join',
              playerName: options.playerName,
              difficulty: options.difficulty,
              auth: authPayload,
            }
          : {
              type: 'join',
              playerName: options.playerName,
              difficulty: options.difficulty,
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
        set(state => ({
          ...state,
          error: '接続中にエラーが発生しました。',
        }));
      };

      socket.onclose = (event) => {
        console.log('[MatchStore] WebSocket closed', event);
        const gameStore = useGameStore.getState();
        gameStore.endMatchGame();
        cleanupTimers();

        const currentStatus = get().status;
        const shouldAttemptReconnect =
          !manualDisconnect &&
          lastJoinOptions !== null &&
          currentStatus !== 'finished';

        if (shouldAttemptReconnect) {
          set(state => ({
            ...state,
            socket: null,
            playerId: null,
            status: 'connecting',
            error: '接続が切断されました。再接続しています…',
          }));
          scheduleReconnect();
          return;
        }

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
  };

  return {
    ...initialState,

    joinRoom: ({ roomId, playerName, difficulty }) => {
      reconnectAttempts = 0;
      connect({ roomId, playerName, difficulty });
    },

    sendReady: () => {
      const { socket, status } = get();
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      if (status === 'ready' || status === 'playing') return;

      const readyMessage: ClientMessage = { type: 'ready' };
      socket.send(JSON.stringify(readyMessage));
    },

    leaveRoom: () => {
      manualDisconnect = true;
      lastJoinOptions = null;
      reconnectAttempts = 0;
      cleanupTimers();

      const { socket } = get();
      if (socket) {
        try {
          socket.close();
        } catch (error) {
          console.error('[MatchStore] Error closing socket', error);
        }
      }

      set(() => ({ ...initialState }));
    },

    clearError: () => set({ error: null }),
  };
});
