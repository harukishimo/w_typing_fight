import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Difficulty, PlayerState } from 'shared';
import { GAME_CONSTANTS } from 'shared';
import { useMatchStore } from '@/store/matchStore';
import { useGameStore } from '@/store/gameStore';
import { TypingGame } from './TypingGame';
import { HpGauge } from './HpGauge';
import { Countdown } from './Countdown';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';

type Props = {
  onBack: () => void;
  initialRoomId?: string;
};

const DIFFICULTIES: Difficulty[] = ['EASY', 'NORMAL', 'HARD'];

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    code += chars[idx];
  }
  return code;
}

export function MatchView({ onBack, initialRoomId }: Props) {
  const [roomId, setRoomId] = useState(initialRoomId ?? '');
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [hasEditedName, setHasEditedName] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const {
    status,
    joinRoom,
    sendReady,
    leaveRoom,
    players,
    playerId,
    roomId: connectedRoom,
    countdown,
    roundIntro,
    gameResult,
    error,
    clearError,
  } = useMatchStore();

  const gameMode = useGameStore(state => state.mode);
  const user = useAuthStore((state) => state.user);
  const supabaseReady = useAuthStore((state) => state.supabaseReady);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const signInWithProvider = useAuthStore((state) => state.signInWithProvider);
  const authDisplayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    null;
  const previousUserIdRef = useRef<string | null>(null);
  const profileDisplayName = useProfileStore(state => state.displayName);
  const profileFallbackName = useProfileStore(state => state.fallbackName);

  useEffect(() => {
    if (initialRoomId) {
      setRoomId(initialRoomId);
    }
  }, [initialRoomId]);

  useEffect(() => {
    if (isJoining && (status === 'waiting' || status === 'ready' || status === 'playing' || status === 'countdown')) {
      setIsJoining(false);
    }
  }, [status, isJoining]);

  useEffect(() => {
    return () => {
      leaveRoom();
      setIsJoining(false);
    };
  }, [leaveRoom]);

  useEffect(() => {
    const currentUserId = user?.id ?? null;
    if (currentUserId !== previousUserIdRef.current) {
      previousUserIdRef.current = currentUserId;
      setHasEditedName(false);
    }
  }, [user?.id]);

  const preferredDisplayName = useMemo(() => {
    const profileName = profileDisplayName?.trim();
    if (profileName) {
      return profileName;
    }

    const fallbackName = profileFallbackName?.trim();
    if (fallbackName) {
      return fallbackName;
    }

    return authDisplayName ?? '';
  }, [profileDisplayName, profileFallbackName, authDisplayName]);

  useEffect(() => {
    if (!hasEditedName && playerName !== preferredDisplayName) {
      setPlayerName(preferredDisplayName);
    }
  }, [preferredDisplayName, hasEditedName, playerName]);

  const selfPlayer = useMemo(
    () => players.find(player => player.playerId === playerId) ?? null,
    [players, playerId]
  );

  const opponentPlayer = useMemo(
    () => players.find(player => player.playerId !== playerId) ?? null,
    [players, playerId]
  );

  const isConnected = status !== 'idle' && status !== 'connecting' ? playerId !== null : false;
  const isPlayingView = (status === 'playing' || status === 'countdown') && gameMode === 'match';

  const handleJoin = () => {
    clearError();
    if (isJoining || status === 'connecting') {
      return;
    }
    const trimmedName = playerName.trim();
    const trimmedRoomId = roomId.trim();
    if (!trimmedName || !trimmedRoomId) {
      return;
    }
    setIsJoining(true);
    joinRoom({ roomId: trimmedRoomId, playerName: trimmedName, difficulty });
  };

  const handleGenerateCode = () => {
    const code = generateRoomCode();
    setRoomId(code);
    window.history.pushState(null, '', `/room/${code}`);
  };

  const handleLeave = () => {
    leaveRoom();
    onBack();
  };

  const countdownOverlay = <Countdown count={countdown} />;

  const roundIntroOverlay = roundIntro !== null ? (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.1, opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center bg-white/90 px-12 py-10 rounded-3xl shadow-2xl border border-primary-200"
      >
        <div className="text-sm tracking-[0.4em] text-primary-500 uppercase mb-2">Next Round</div>
        <div className="text-6xl font-black text-primary-700 drop-shadow-sm">Round {roundIntro}</div>
      </motion.div>
    </div>
  ) : null;

  const isWinner = gameResult?.winnerId && playerId && gameResult.winnerId === playerId;
  const endOverlay = status === 'finished' && gameResult ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`relative px-10 py-9 rounded-3xl shadow-2xl border text-center max-w-xl w-full
          ${gameResult.winnerId
            ? gameResult.winnerId === playerId
              ? 'bg-white border-amber-300 text-amber-800'
              : 'bg-white border-sky-300 text-sky-800'
            : 'bg-white border-slate-300 text-slate-800'
          }
        `}
      >
        <div className="text-sm uppercase tracking-[0.4em] mb-3 text-gray-500">
          {gameResult.winnerId ? 'Battle Result' : 'It’s a Draw'}
        </div>
        <div className="text-6xl font-black drop-shadow-sm mb-4 text-gray-900">
          {gameResult.winnerId
            ? gameResult.winnerId === playerId
              ? 'WIN!!!'
              : 'LOSE...'
            : 'DRAW'}
        </div>
        <div className="text-base mb-6 text-gray-600">
          {gameResult.winnerId
            ? gameResult.winnerId === playerId
              ? 'おめでとう！勝利をつかみました。'
              : '惜しい！次のバトルでリベンジしよう。'
            : '互角の勝負でした！'}
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-200">
          <div className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3">Players</div>
          <div className="space-y-2">
            {gameResult.players.map(player => {
              const playerIsWinner = gameResult.winnerId === player.playerId;
              return (
                <div
                  key={player.playerId}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-left
                    ${playerIsWinner ? 'bg-amber-100 text-amber-900' : 'bg-white text-gray-700 border border-gray-100'}`}
                >
                  <div>
                    <div className="text-sm font-semibold">{player.playerName}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">{player.difficulty}</div>
                  </div>
                  <div className="text-xs text-gray-500">HP {player.hp} / Lives {player.lives}</div>
                </div>
              );
            })}
          </div>
        </div>
        <button
          onClick={handleLeave}
          className={`px-6 py-3 rounded-2xl font-semibold shadow transition
            ${isWinner
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-sky-500 text-white hover:bg-sky-600'}
          `}
        >
          ロビーへ戻る
        </button>
      </motion.div>
    </div>
  ) : null;

  if (isPlayingView) {
    return (
      <>
        {roundIntroOverlay}
        {countdownOverlay}
        {endOverlay}
        <div className="min-h-screen bg-primary-50">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={handleLeave}
                className="px-4 py-2 rounded-lg bg-white text-primary-600 shadow hover:bg-primary-100"
              >
                ロビーへ戻る
              </button>

              <div className="bg-white rounded-lg px-4 py-2 shadow text-sm text-primary-700">
                ルームコード: <span className="font-mono text-lg">{connectedRoom}</span>
              </div>
            </div>

            <TypingGame
              onExit={handleLeave}
              selfPlayer={selfPlayer}
              opponentPlayer={opponentPlayer}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {roundIntroOverlay}
      {countdownOverlay}
      {endOverlay}
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 p-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <button
              onClick={handleLeave}
              className="px-4 py-2 bg-white text-primary-600 rounded-lg shadow hover:bg-primary-100"
            >
            ← モード選択へ
          </button>

          {connectedRoom && (
            <div className="bg-white px-4 py-2 rounded-lg shadow text-sm text-primary-700">
              ルームコード: <span className="font-mono text-lg">{connectedRoom}</span>
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
        >
          <header className="space-y-2">
            <h2 className="text-3xl font-bold text-primary-800">オンラインルーム</h2>
            <p className="text-primary-600 text-sm">
              ルームコードを共有して友達と一緒にバトルしよう！
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-primary-700">
                  ニックネーム
                </label>
                <input
                  value={playerName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPlayerName(value);
                    setHasEditedName(value.trim().length > 0);
                  }}
                  placeholder="例: WakaFighter"
                  className="w-full px-4 py-2 rounded-lg border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
                <div className="rounded-lg border border-primary-100 bg-primary-50/70 px-3 py-2 text-xs text-primary-600">
                  {user ? (
                    <span>
                      <span className="font-semibold text-primary-800">{authDisplayName}</span>
                      さんがログイン中です。対戦結果はランキングに記録されます。
                    </span>
                  ) : supabaseReady ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-left sm:text-sm">
                        ランキングに名前を残すには Google でログインしてください。
                      </p>
                      <button
                        type="button"
                        onClick={() => void signInWithProvider('google')}
                        disabled={isAuthLoading}
                        className="w-full sm:w-auto rounded-lg bg-[#4285F4]/10 px-3 py-1.5 text-xs font-semibold text-[#4285F4] hover:bg-[#4285F4]/20 disabled:opacity-60"
                      >
                        Google ログイン
                      </button>
                    </div>
                  ) : (
                    <span className="text-amber-700">
                      Supabase の設定が未完了のため、ランキング登録は現在無効です。
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-primary-700">
                  ルームコード
                </label>
                <div className="flex gap-2">
                  <input
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    maxLength={GAME_CONSTANTS.ROOM_CODE_LENGTH}
                    className="flex-1 px-4 py-2 rounded-lg border border-primary-200 uppercase tracking-[0.5em] text-center font-mono focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
                  >
                    生成
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-primary-700">
                  難易度（戦術）
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {DIFFICULTIES.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDifficulty(value)}
                      className={`rounded-lg py-2 text-sm font-semibold transition border ${
                        difficulty === value
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-primary-600 border-primary-200 hover:bg-primary-50'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleJoin}
                disabled={!playerName.trim() || !roomId.trim() || status === 'connecting' || isJoining || isConnected}
                className={`w-full py-3 rounded-xl font-bold text-lg shadow transition ${
                  status === 'connecting' || isJoining || isConnected
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-400 to-primary-600 text-white hover:shadow-lg'
                }`}
              >
                {status === 'connecting' || isJoining
                  ? '接続中...'
                  : isConnected
                    ? '入室済み'
                    : '入室 / ルーム作成'}
              </button>
            </div>

            <div className="bg-primary-50 rounded-xl p-6 border border-primary-100 space-y-4">
              <h3 className="font-bold text-primary-700 flex items-center gap-2">
                <span className="text-xl">👥</span>
                参加プレイヤー
              </h3>

              {players.length === 0 ? (
                <p className="text-sm text-primary-500">まだ誰も入室していません。</p>
              ) : (
                <div className="space-y-3">
                  {players.map((player) => (
                    <PlayerCard
                      key={player.playerId}
                      player={player}
                      highlight={player.playerId === playerId}
                    />
                  ))}
                </div>
              )}

              {isConnected && (
                <button
                  type="button"
                  onClick={sendReady}
                  disabled={selfPlayer?.isReady}
                  className={`w-full py-2 rounded-lg font-semibold transition ${
                    selfPlayer?.isReady
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-primary-600 border border-primary-300 hover:bg-primary-100'
                  }`}
                >
                  {selfPlayer?.isReady ? 'READY!' : 'READY を送信'}
                </button>
              )}

              {isConnected && (
                <button
                  type="button"
                  onClick={leaveRoom}
                  className="w-full py-2 rounded-lg font-semibold text-sm text-red-500 bg-red-50 border border-red-200 hover:bg-red-100"
                >
                  退出する
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
        </motion.div>
      </div>
    </div>
    </>
  );
}

type PlayerCardProps = {
  player: PlayerState;
  title?: string;
  highlight?: boolean;
};

function PlayerCard({ player, title, highlight }: PlayerCardProps) {
  const hpFooter = (
    <span className="flex items-center gap-1">
      {Array.from({ length: GAME_CONSTANTS.INITIAL_LIVES }).map((_, index) => (
        <span
          key={index}
          className={
            index < player.lives ? 'text-rose-500 text-sm' : 'text-primary-200 text-sm'
          }
        >
          ♥
        </span>
      ))}
    </span>
  );

  return (
    <div
      className={`rounded-xl p-5 shadow bg-white border ${
        highlight ? 'border-primary-400' : 'border-transparent'
      }`}
    >
      {title && (
        <div className="text-xs text-primary-500 font-semibold mb-2 uppercase tracking-wide">
          {title}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-primary-800">{player.playerName}</div>
          <div className="text-xs text-primary-500">{player.difficulty}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            player.isReady ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
          }`}>
            {player.isReady ? 'READY' : 'WAIT'}
          </span>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <HpGauge
          label="HP"
          hp={player.hp}
          tone={highlight ? 'self' : 'opponent'}
          footer={<span className="flex items-center gap-2 text-primary-500">{hpFooter}</span>}
        />
        <div className="flex items-center justify-between text-xs text-primary-500">
          <span className="font-semibold">コンボ</span>
          <span className="text-sm font-bold text-primary-700">{player.combo}</span>
        </div>
      </div>
    </div>
  );
}
