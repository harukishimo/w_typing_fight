/**
 * Room Durable Object
 * リアルタイム対戦ルームの状態管理
 */

import type {
  PlayerState,
  RoomState,
  ClientMessage,
  ServerMessage,
  Word,
} from 'shared';
import { GAME_CONSTANTS, calculateDamage, getRandomWord } from 'shared';

type JoinClientMessage = Extract<ClientMessage, { type: 'join' }>;

export class RoomDO {
  private state: DurableObjectState;
  private env: Env;
  private sessions: Map<string, WebSocket> = new Map();
  private playerAuth: Map<string, PlayerAuthContext> = new Map();
  private readonly heartbeatIntervalMs = 30_000;
  private heartbeatScheduled = false;
  private roomState: RoomState = {
    roomId: '',
    players: new Map(),
    currentRound: 1,
    maxRounds: GAME_CONSTANTS.MAX_ROUNDS,
    status: 'waiting',
    winner: null,
  };

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;

    // ルームIDを初期化（Durable Objectの名前があればそれを利用）
    this.roomState.roomId = state.id.name ?? state.id.toString();

    // Hibernation APIで管理されているWebSocketを復元
    const hibernatedSockets = this.state.getWebSockets();
    for (const ws of hibernatedSockets) {
      const playerId = this.getPlayerId(ws);
      if (playerId) {
        this.sessions.set(playerId, ws);
      }
    }

    // プレイヤー状態をStorageから復元（非同期操作を避けるため遅延ロード）
    this.state.blockConcurrencyWhile(async () => {
      const storedPlayers = await this.state.storage.get<Map<string, PlayerState>>('players');
      if (storedPlayers) {
        this.roomState.players = new Map(storedPlayers);
      }
    });

    console.log('[RoomDO] Constructor called', {
      roomId: this.roomState.roomId,
      doId: state.id.toString(),
      existingPlayers: this.roomState.players.size,
      existingSessions: this.sessions.size,
      hibernatedSockets: hibernatedSockets.length,
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.searchParams.has('roomId')) {
      this.roomState.roomId = url.searchParams.get('roomId') ?? this.roomState.roomId;
    }

    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected websocket', { status: 400 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    console.log('[RoomDO] fetch upgrade accepted', this.roomState.roomId);

    this.state.waitUntil(this.handleSession(server));

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async handleSession(websocket: WebSocket): Promise<void> {
    console.log('[RoomDO] handleSession start');

    // WebSocket Hibernation APIを使用してDurable Objectが管理
    this.state.acceptWebSocket(websocket);

    console.log('[RoomDO] WebSocket accepted by Durable Object state');
  }

  async webSocketMessage(
    websocket: WebSocket,
    message: string | ArrayBuffer
  ): Promise<void> {
    try {
      console.log('[RoomDO] websocketMessage received:', message);
      const text = this.normalizeMessageData(message);
      if (!text) {
        console.log('[RoomDO] Received empty message data');
        return;
      }

      console.log('[RoomDO] Raw message:', text);
      const data = JSON.parse(text);
      await this.handleMessage(websocket, data);
    } catch (error) {
      console.error('Message handling error:', error);
      this.sendError(websocket, 'Invalid message format');
    }
  }

  webSocketClose(websocket: WebSocket, code: number, reason: string): void {
    console.log('[RoomDO] WebSocket closed', { code, reason });
    this.handleClose(websocket);
  }

  webSocketError(websocket: WebSocket, error: unknown): void {
    console.error('WebSocket error:', error);
    this.sendError(websocket, 'WebSocket error occurred');
  }

  private normalizeMessageData(
    message: string | ArrayBuffer | ArrayBufferView | SharedArrayBuffer
  ): string | null {
    if (typeof message === 'string') {
      return message;
    }

    const decoder = new TextDecoder();

    if (message instanceof ArrayBuffer) {
      return decoder.decode(new Uint8Array(message));
    }

    if (typeof SharedArrayBuffer !== 'undefined' && message instanceof SharedArrayBuffer) {
      return decoder.decode(new Uint8Array(message as ArrayBufferLike));
    }

    if (ArrayBuffer.isView(message)) {
      const view = message as ArrayBufferView;
      const buffer = view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
      return decoder.decode(new Uint8Array(buffer));
    }

    return null;
  }

  async handleMessage(websocket: WebSocket, data: unknown): Promise<void> {
    const message = data as ClientMessage;
    console.log('[RoomDO] Received message:', message);

    try {
      switch (message.type) {
        case 'join':
          await this.handleJoin(websocket, message);
          break;
        case 'ready':
          await this.handleReady(websocket);
          break;
        case 'attack':
          await this.handleAttack(websocket, message);
          break;
        case 'miss':
          await this.handleMiss(websocket);
          break;
        case 'ping':
          this.send(websocket, { type: 'pong' });
          break;
        default:
          this.sendError(websocket, 'Unknown message type');
      }
    } catch (error) {
      console.error('Message handling error:', error);
      this.sendError(websocket, 'Internal server error');
    }
  }

  /**
   * プレイヤー参加処理
   */
  private async handleJoin(
    websocket: WebSocket,
    message: JoinClientMessage
  ): Promise<void> {
    // ルーム満員チェック
    if (this.roomState.players.size >= 2) {
      this.sendError(websocket, 'Room is full');
      return;
    }

    // ゲーム進行中チェック
    if (this.roomState.status !== 'waiting') {
      this.sendError(websocket, 'Game already in progress');
      return;
    }

    // プレイヤーID生成
    const playerId = crypto.randomUUID();

    // プレイヤー状態初期化
    const playerState: PlayerState = {
      playerId,
      playerName: message.playerName,
      difficulty: message.difficulty,
      hp: GAME_CONSTANTS.INITIAL_HP,
      lives: GAME_CONSTANTS.INITIAL_LIVES,
      combo: 0,
      missCount: 0,
      currentWord: null,
      isReady: false,
    };

    await this.registerPlayerAuth(playerId, message.auth);

    // セッション登録
    this.attachSession(websocket, playerId);
    this.roomState.players.set(playerId, playerState);

    // プレイヤー状態を永続化
    await this.state.storage.put('players', this.roomState.players);

    console.log('[RoomDO] Player joined:', playerState);
    console.log('[RoomDO] Active sessions after join:', this.sessions.size);

    // 参加成功を通知
    this.send(websocket, {
      type: 'joined',
      playerId,
      roomId: this.roomState.roomId,
      playerCount: this.roomState.players.size,
    });
    console.log('[RoomDO] Sent joined message to player:', playerId);

    // 全員にプレイヤー情報を通知
    this.broadcastPlayerUpdate();
    console.log('[RoomDO] Broadcasted player update');
  }

  /**
   * 準備完了処理
   */
  private async handleReady(websocket: WebSocket): Promise<void> {
    const playerId = this.getPlayerId(websocket);
    console.log('[RoomDO] handleReady from player:', playerId);
    if (!playerId) {
      this.sendError(websocket, 'Not joined');
      return;
    }

    const player = this.roomState.players.get(playerId);
    if (!player) {
      this.sendError(websocket, 'Player not found');
      return;
    }

    // 準備完了
    player.isReady = true;

    // 全員にプレイヤー情報を通知
    this.broadcastPlayerUpdate();

    // 全員が準備完了したらゲーム開始
    const allReady = Array.from(this.roomState.players.values()).every(p => p.isReady);
    if (allReady && this.roomState.players.size === 2) {
      await this.startGame();
    }
  }

  /**
   * 攻撃処理（お題クリア）
   */
  private async handleAttack(
    websocket: WebSocket,
    message: Extract<ClientMessage, { type: 'attack' }>
  ): Promise<void> {
    const attackerId = this.getPlayerId(websocket);
    console.log('[RoomDO] handleAttack from player:', attackerId);
    if (!attackerId) {
      this.sendError(websocket, 'Not joined');
      return;
    }

    const attacker = this.roomState.players.get(attackerId);
    if (!attacker) {
      this.sendError(websocket, 'Player not found');
      return;
    }

    if (!attacker.currentWord || attacker.currentWord.id !== message.wordId) {
      this.sendError(websocket, 'Invalid word');
      return;
    }

    // 相手プレイヤーを取得
    const targetId = Array.from(this.roomState.players.keys()).find(id => id !== attackerId);
    if (!targetId) {
      this.sendError(websocket, 'No opponent');
      return;
    }

    const target = this.roomState.players.get(targetId);
    if (!target) {
      this.sendError(websocket, 'Opponent not found');
      return;
    }

    // ダメージ計算
    const damage = calculateDamage(attacker.difficulty, attacker.combo);

    // 相手にダメージ適用
    target.hp = Math.max(0, target.hp - damage);

    // ミス数を加算（お題ごとのミスを蓄積）
    attacker.missCount += message.missCount;

    // コンボ増加
    attacker.combo += 1;

    // 次のお題を取得
    const nextWord = this.assignNextWord(attackerId);
    if (!nextWord) {
      this.sendError(websocket, 'Failed to assign next word');
      return;
    }

    // 攻撃通知をブロードキャスト
    this.broadcast({
      type: 'attackNotification',
      attackerId,
      targetId,
      damage,
      combo: attacker.combo,
      targetHp: target.hp,
      nextWord,
    });

    // プレイヤー状態更新を共有
    this.broadcastPlayerUpdate();

    // HP=0チェック
    if (target.hp === 0) {
      await this.handleKnockout(targetId);
    }
  }

  /**
   * ミス処理
   */
  private async handleMiss(websocket: WebSocket): Promise<void> {
    const playerId = this.getPlayerId(websocket);
    console.log('[RoomDO] handleMiss from player:', playerId);
    if (!playerId) {
      this.sendError(websocket, 'Not joined');
      return;
    }

    const player = this.roomState.players.get(playerId);
    if (!player) {
      this.sendError(websocket, 'Player not found');
      return;
    }

    // コンボリセット
    player.combo = 0;
    player.missCount += 1;

    // ミス通知をブロードキャスト
    this.broadcast({
      type: 'missNotification',
      playerId,
      missCount: player.missCount,
    });

    this.broadcastPlayerUpdate();
  }

  /**
   * ゲーム開始
   */
  private async startGame(): Promise<void> {
    this.roomState.status = 'waiting';
    this.roomState.currentRound = 0;

    for (const player of this.roomState.players.values()) {
      player.hp = GAME_CONSTANTS.INITIAL_HP;
      player.lives = GAME_CONSTANTS.INITIAL_LIVES;
      player.combo = 0;
      player.missCount = 0;
      player.isReady = false;
      player.currentWord = null;
    }

    await this.beginRound(true);
  }

  /**
   * ラウンド開始処理（ラウンド番号カウントと演出）
   */
  private async beginRound(incrementRound: boolean): Promise<void> {
    this.roomState.status = 'waiting';

    if (incrementRound) {
      this.roomState.currentRound = Math.min(
        this.roomState.currentRound + 1,
        this.roomState.maxRounds
      );
    }

    for (const player of this.roomState.players.values()) {
      player.hp = GAME_CONSTANTS.INITIAL_HP;
      player.combo = 0;
      player.missCount = 0;
      player.isReady = false;
      player.currentWord = null;
    }

    this.broadcastPlayerUpdate();

    await this.showRoundIntroAndCountdown();

    const words: Record<string, Word> = {};
    for (const [playerId] of this.roomState.players) {
      const word = this.assignNextWord(playerId);
      if (word) {
        words[playerId] = word;
      }
    }

    this.roomState.status = 'playing';

    this.broadcast({
      type: 'gameStart',
      round: this.roomState.currentRound,
      words,
    });

    await this.sleep(1000);
    this.broadcast({ type: 'countdown', count: -1 });

    this.broadcastPlayerUpdate();
  }

  /**
   * ノックアウト処理
   */
  private async handleKnockout(knockedPlayerId: string): Promise<void> {
    const player = this.roomState.players.get(knockedPlayerId);
    if (!player) return;

    // ライフ減少
    player.hp = 0;
    player.lives = Math.max(0, player.lives - 1);
    player.combo = 0;
    player.missCount = 0;

    this.broadcast({
      type: 'knockout',
      playerId: knockedPlayerId,
      remainingLives: player.lives,
      round: this.roomState.currentRound,
    });

    this.roomState.status = 'waiting';

    this.broadcastPlayerUpdate();

    const opponentId = Array.from(this.roomState.players.keys()).find(
      id => id !== knockedPlayerId
    );

    const winnerId = opponentId ?? knockedPlayerId;

    const snapshot = Array.from(this.roomState.players.values());

    this.broadcast({
      type: 'roundEnd',
      round: this.roomState.currentRound,
      winnerId,
      players: snapshot,
    });

    await this.sleep(2000);

    if (player.lives <= 0) {
      await this.endGame(winnerId);
      return;
    }

    if (this.roomState.currentRound >= this.roomState.maxRounds) {
      await this.endGame(winnerId);
      return;
    }

    await this.beginRound(true);
  }

  /**
   * ゲーム終了
   */
  private async endGame(winnerId: string): Promise<void> {
    this.roomState.status = 'finished';
    this.roomState.winner = winnerId;

    const players = Array.from(this.roomState.players.values());

    this.broadcast({
      type: 'gameEnd',
      winnerId,
      players,
    });

    const winnerState = players.find(player => player.playerId === winnerId) ?? null;
    const loserState = players.find(player => player.playerId !== winnerId) ?? null;

    if (winnerState && loserState) {
      const winnerAuth = this.playerAuth.get(winnerState.playerId);
      const loserAuth = this.playerAuth.get(loserState.playerId);

      const payload: PersistMatchParams = {
        roomId: this.roomState.roomId,
        winner: {
          playerId: winnerState.playerId,
          playerName: winnerState.playerName,
        },
        loser: {
          playerId: loserState.playerId,
          playerName: loserState.playerName,
        },
        winnerAuth,
        loserAuth,
      };

      this.state.waitUntil(this.persistMatchResult(payload));
    } else {
      console.warn('[RoomDO] Unable to determine winner/loser states for persistence');
    }
  }

  private async showRoundIntroAndCountdown(): Promise<void> {
    this.broadcast({
      type: 'roundIntro',
      round: this.roomState.currentRound,
    });

    await this.sleep(1500);

    for (let count = 3; count >= 0; count--) {
      this.broadcast({ type: 'countdown', count });
      await this.sleep(1000);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private assignNextWord(playerId: string): Word | null {
    const player = this.roomState.players.get(playerId);
    if (!player) return null;

    const word = getRandomWord(player.difficulty);
    player.currentWord = word;
    return word;
  }

  /**
   * プレイヤー情報更新をブロードキャスト
   */
  private broadcastPlayerUpdate(): void {
    const players = Array.from(this.roomState.players.values());
    console.log('[RoomDO] Broadcasting player update', players.length);
    this.broadcast({
      type: 'playerUpdate',
      players,
    });
  }

  /**
   * メッセージ送信（単一クライアント）
   */
  private send(websocket: WebSocket, message: ServerMessage): void {
    try {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify(message));
      } else {
        console.warn('[RoomDO] Cannot send to non-open WebSocket', {
          readyState: websocket.readyState,
          messageType: message.type,
        });
      }
    } catch (error) {
      console.error('[RoomDO] Send error:', error);
    }
  }

  /**
   * エラー送信
   */
  private sendError(websocket: WebSocket, message: string): void {
    this.send(websocket, {
      type: 'error',
      message,
    });
  }

  handleClose(websocket: WebSocket): void {
    const playerId = this.getPlayerId(websocket);
    if (playerId) {
      this.roomState.players.delete(playerId);
      this.sessions.delete(playerId);
      this.playerAuth.delete(playerId);

      // プレイヤー状態の変更を永続化
      this.state.storage.put('players', this.roomState.players);

      this.broadcast({ type: 'playerLeft', playerId });
      console.log('[RoomDO] Session closed', {
        playerId,
        remainingSessions: this.sessions.size,
      });
    }

    if (this.sessions.size === 0) {
      this.heartbeatScheduled = false;

      // 全員退室したらルーム状態をリセット（再利用可能に）
      console.log('[RoomDO] All players left, resetting room state');
      this.resetRoom();
    }
  }

  broadcast(message: ServerMessage): void {
    const payload = JSON.stringify(message);
    this.sessions.forEach((ws, playerId) => {
      try {
        // WebSocketの接続状態を確認してから送信
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
        } else {
          console.warn('[RoomDO] Skipping broadcast to closed WebSocket', {
            playerId,
            readyState: ws.readyState,
          });
        }
      } catch (error) {
        console.error('[RoomDO] Broadcast error:', error, { playerId });
      }
    });
  }

  private attachSession(websocket: WebSocket, playerId: string): void {
    // WebSocketのメタデータとして playerIdを保存（Durable Object管理下で永続化）
    if (typeof websocket.serializeAttachment === 'function') {
      websocket.serializeAttachment({ playerId });
    }

    // セッションMapに追加（インスタンス変数として一時管理）
    this.sessions.set(playerId, websocket);
    console.log('[RoomDO] Attached session', {
      playerId,
      totalSessions: this.sessions.size,
    });

    this.ensureHeartbeat();
  }

  private ensureHeartbeat(): void {
    if (this.sessions.size === 0 || this.heartbeatScheduled) {
      return;
    }

    this.heartbeatScheduled = true;
    this.state.storage.setAlarm(Date.now() + this.heartbeatIntervalMs);
  }

  private getPlayerId(websocket: WebSocket): string | null {
    if (typeof websocket.deserializeAttachment === 'function') {
      const data = websocket.deserializeAttachment();
      if (data && typeof data === 'object' && 'playerId' in data) {
        return (data as { playerId: string }).playerId;
      }
      if (typeof data === 'string') {
        return data;
      }
    }

    for (const [playerId, ws] of this.sessions.entries()) {
      if (ws === websocket) {
        return playerId;
      }
    }

    return null;
  }

  async alarm(): Promise<void> {
    this.heartbeatScheduled = false;

    if (this.sessions.size === 0) {
      return;
    }

    this.broadcast({ type: 'pong' });
    this.ensureHeartbeat();
  }

  /**
   * ルーム状態をリセット（再利用可能にする）
   */
  private resetRoom(): void {
    // ルーム状態を初期化
    this.roomState.players.clear();
    this.roomState.currentRound = 1;
    this.roomState.status = 'waiting';
    this.roomState.winner = null;

    // Storageもクリア
    this.state.storage.delete('players');

    console.log('[RoomDO] Room state reset, ready for new game');
  }

  private async registerPlayerAuth(
    playerId: string,
    authPayload: JoinClientMessage['auth']
  ): Promise<void> {
    if (!authPayload?.userId) {
      this.playerAuth.delete(playerId);
      return;
    }

    try {
      const verifiedUserId = authPayload.accessToken
        ? await this.verifyPlayerAuth(authPayload)
        : null;

      const finalUserId = verifiedUserId ?? authPayload.userId;
      this.playerAuth.set(playerId, { userId: finalUserId });
    } catch (error) {
      console.error('[RoomDO] Failed to verify Supabase auth token', error);
      this.playerAuth.set(playerId, { userId: authPayload.userId });
    }
  }

  private async verifyPlayerAuth(
    authPayload: NonNullable<JoinClientMessage['auth']>
  ): Promise<string | null> {
    const { accessToken, userId } = authPayload;
    if (!accessToken || !userId) {
      return null;
    }

    const supabaseUser = await this.fetchSupabaseUser(accessToken);
    if (!supabaseUser) {
      return null;
    }

    if (supabaseUser.id !== userId) {
      console.warn('[RoomDO] Supabase token user mismatch');
      return null;
    }

    return userId;
  }

  private async fetchSupabaseUser(accessToken: string): Promise<SupabaseUser | null> {
    const supabaseUrl = this.env.SUPABASE_URL;
    const apiKey = this.env.SUPABASE_SERVICE_ROLE_KEY ?? this.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !apiKey) {
      console.warn('[RoomDO] Supabase credentials missing; skip auth verification');
      return null;
    }

    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: apiKey,
        },
      });

      if (!response.ok) {
        console.warn('[RoomDO] Failed to verify Supabase token', response.status);
        return null;
      }

      const data = (await response.json()) as SupabaseUser;
      return data;
    } catch (error) {
      console.error('[RoomDO] Error verifying Supabase token', error);
      return null;
    }
  }

  private async persistMatchResult(params: PersistMatchParams): Promise<void> {
    const supabaseUrl = this.env.SUPABASE_URL;
    const serviceRoleKey = this.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.warn('[RoomDO] Supabase environment not configured; skipping match logging');
      return;
    }

    const { winner, loser, winnerAuth, loserAuth, roomId } = params;

    if (!winnerAuth?.userId) {
      if (loserAuth?.userId) {
        await this.resetUserStreak(loserAuth.userId);
      }
      console.log('[RoomDO] Skipping match logging because winner is not authenticated');
      return;
    }

    const payload = {
      room_id: roomId,
      winner_id: winnerAuth.userId,
      loser_id: loserAuth?.userId ?? null,
      winner_display_name: winner.playerName,
      loser_display_name: loser.playerName,
      ended_at: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[RoomDO] Failed to persist match result', response.status, errorText);
      } else {
        console.log('[RoomDO] Match result persisted to Supabase');
      }
    } catch (error) {
      console.error('[RoomDO] Error persisting match result', error);
    }
  }

  private async resetUserStreak(userId: string): Promise<void> {
    const supabaseUrl = this.env.SUPABASE_URL;
    const serviceRoleKey = this.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.warn('[RoomDO] Supabase environment not configured; skipping streak reset');
      return;
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/user_streaks?on_conflict=user_id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({
          user_id: userId,
          current_streak: 0,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[RoomDO] Failed to reset user streak', response.status, errorText);
      }
    } catch (error) {
      console.error('[RoomDO] Error resetting user streak', error);
    }
  }
}

interface Env {
  ROOM: DurableObjectNamespace;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_ANON_KEY?: string;
}

interface PlayerAuthContext {
  userId: string;
}

interface SupabaseUser {
  id: string;
}

interface PersistMatchParams {
  roomId: string;
  winner: {
    playerId: string;
    playerName: string;
  };
  loser: {
    playerId: string;
    playerName: string;
  };
  winnerAuth?: PlayerAuthContext;
  loserAuth?: PlayerAuthContext;
}
