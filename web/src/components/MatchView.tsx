import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { Difficulty, PlayerState } from 'shared';
import { GAME_CONSTANTS } from 'shared';
import { useMatchStore } from '@/store/matchStore';
import { useGameStore } from '@/store/gameStore';
import { TypingGame } from './TypingGame';
import { HpGauge } from './HpGauge';
import { Countdown } from './Countdown';

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

  const {
    status,
    joinRoom,
    sendReady,
    leaveRoom,
    players,
    playerId,
    roomId: connectedRoom,
    countdown,
    error,
    clearError,
  } = useMatchStore();

  const gameMode = useGameStore(state => state.mode);

  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, [leaveRoom]);

  useEffect(() => {
    if (initialRoomId) {
      setRoomId(initialRoomId);
    }
  }, [initialRoomId]);

  const selfPlayer = useMemo(
    () => players.find(player => player.playerId === playerId) ?? null,
    [players, playerId]
  );

  const opponentPlayer = useMemo(
    () => players.find(player => player.playerId !== playerId) ?? null,
    [players, playerId]
  );

  const isConnected = status !== 'idle' && status !== 'connecting' ? playerId !== null : false;
  const isPlaying = status === 'playing' && gameMode === 'match';

  const handleJoin = () => {
    clearError();
    joinRoom({ roomId, playerName, difficulty });
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

  if (isPlaying) {
    return (
      <>
        <Countdown count={countdown} />
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
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="例: WakaFighter"
                  className="w-full px-4 py-2 rounded-lg border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
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
                disabled={!playerName || !roomId || status === 'connecting'}
                className={`w-full py-3 rounded-xl font-bold text-lg shadow transition ${
                  status === 'connecting'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-400 to-primary-600 text-white hover:shadow-lg'
                }`}
              >
                {status === 'connecting' ? '接続中...' : '入室 / ルーム作成'}
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
