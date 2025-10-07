/**
 * タイピングゲームコンポーネント
 */

import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import type { PlayerState } from 'shared';
import { GAME_CONSTANTS, calculateDamage, getComboMultiplier } from 'shared';
import { HpGauge } from './HpGauge';

type Props = {
  onExit?: () => void;
  selfPlayer?: PlayerState | null;
  opponentPlayer?: PlayerState | null;
};

export function TypingGame({ onExit, selfPlayer, opponentPlayer }: Props) {
  const {
    currentWord,
    currentInput,
    romajiMatcher,
    combo,
    missCount,
    totalAttacks,
    difficulty,
    hp,
    lives,
    mode,
    handleKeyPress,
    resetGame,
  } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.length > 1) return;
      handleKeyPress(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  const effectiveSelf = useMemo<PlayerState | null>(() => {
    if (selfPlayer) return selfPlayer;
    if (!difficulty) return null;
    return {
      playerId: 'self',
      playerName: 'プレイヤー',
      difficulty,
      hp,
      lives,
      combo,
      missCount,
      currentWord: currentWord ?? null,
      isReady: true,
    };
  }, [selfPlayer, difficulty, hp, lives, combo, missCount, currentWord]);

  if (!currentWord || !difficulty) {
    return null;
  }

  // parseHiragana を使用して拗音を正しく分割（romajiMatcherと同じロジック）
  const damage = calculateDamage(difficulty, combo);
  const comboMultiplier = getComboMultiplier(difficulty, combo);
  const inputDisplayClass = difficulty === 'HARD' ? 'text-2xl' : 'text-3xl';
  const isMatchMode = mode === 'match';

  const progress = romajiMatcher?.getProgress();
  const nextCharHint = romajiMatcher?.getNextCharHint() || '';
  const remainingInput = romajiMatcher?.getRemainingInputDisplay() || '';

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      resetGame();
    }
  };

  const exitLabel = isMatchMode ? 'ロビーへ戻る' : '終了';

  const renderLivesRow = (livesCount: number) => (
    <div className="flex gap-1 text-xs">
      {Array.from({ length: GAME_CONSTANTS.INITIAL_LIVES }).map((_, index) => (
        <span
          key={index}
          className={index < livesCount ? 'text-rose-500 text-sm' : 'text-primary-200 text-sm'}
        >
          ♥
        </span>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="mb-8 flex justify-between items-center">
          <div className="text-primary-800">
            <h2 className="text-2xl font-bold">難易度: {difficulty}</h2>
            <p className="text-sm text-gray-500">
              HP {hp} / ライフ {lives}
            </p>
          </div>
          <button
            onClick={handleExit}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
          >
            {exitLabel}
          </button>
        </div>

        {isMatchMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <HpStatusCard
              title={effectiveSelf?.playerName ?? 'あなた'}
              player={effectiveSelf}
              tone="self"
              renderLives={renderLivesRow}
            />
            <HpStatusCard
              title={opponentPlayer?.playerName ?? '相手'}
              player={opponentPlayer ?? null}
              tone="opponent"
              renderLives={renderLivesRow}
            />
          </div>
        ) : (
          <div className="mb-8">
            <HpGauge
              label="あなたのHP"
              hp={hp}
              tone="self"
              footer={renderLivesRow(lives)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            className="bg-white rounded-xl p-6 shadow-lg text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-4xl mb-2">🔥</div>
            <div className="text-3xl font-bold text-primary-600">{combo}</div>
            <div className="text-sm text-gray-600">COMBO</div>
            <div className="text-xs text-gray-500 mt-1">×{comboMultiplier.toFixed(1)}</div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-lg text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-4xl mb-2">⚔️</div>
            <div className="text-3xl font-bold text-primary-600">{damage}</div>
            <div className="text-sm text-gray-600">DAMAGE</div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-lg text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-4xl mb-2">❌</div>
            <div className="text-3xl font-bold text-gray-600">{missCount}</div>
            <div className="text-sm text-gray-600">MISS</div>
            <div className="text-xs text-gray-500 mt-1">{totalAttacks} 攻撃</div>
          </motion.div>
        </div>

        <motion.div
          className="bg-white rounded-2xl p-12 shadow-2xl mb-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={currentWord.id}
        >
          <div className="text-center mb-4">
            <span className="text-sm text-gray-500">お題</span>
          </div>

          <div className="text-6xl font-mono mb-4 text-gray-800 text-center">
            {currentWord.text}
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">入力</div>
            <div className={`${inputDisplayClass} font-mono break-words break-all max-w-full mx-auto`}>
              <span className="text-green-500">{currentInput}</span>
              <span className="text-gray-300">{remainingInput}</span>
            </div>
          </div>

          <div className="mt-8">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-primary-400 to-primary-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: progress
                    ? `${(progress.completedChars / progress.totalChars) * 100}%`
                    : '0%',
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>

        <div className="text-center text-gray-600">
          <p className="text-sm">
            💡 次の文字: <span className="font-mono text-xl text-primary-600 font-bold">
              {nextCharHint || '-'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

type HpStatusCardProps = {
  title: string;
  player: PlayerState | null;
  tone: 'self' | 'opponent';
  renderLives: (lives: number) => ReactNode;
};

function HpStatusCard({ title, player, tone, renderLives }: HpStatusCardProps) {
  if (!player) {
    return (
      <div
        className={`rounded-xl p-6 shadow text-center text-primary-500 flex flex-col justify-center border ${
          tone === 'self' ? 'bg-primary-50/60 border-primary-100' : 'bg-rose-50/60 border-rose-100'
        }`}
      >
        <div className="text-sm font-semibold mb-2">{title}</div>
        <div className="text-xs">待機中...</div>
      </div>
    );
  }

  const toneStyles =
    tone === 'self'
      ? {
          container:
            'bg-gradient-to-br from-white via-primary-50 to-primary-100 border border-primary-200 shadow-primary-200/60',
          badgeBg: 'bg-primary-500/10 text-primary-600 border-primary-400/40',
          icon: 'bg-primary-500 text-white',
        }
      : {
          container:
            'bg-gradient-to-br from-white via-rose-50 to-rose-100 border border-rose-200 shadow-rose-200/60',
          badgeBg: 'bg-rose-500/10 text-rose-600 border-rose-400/40',
          icon: 'bg-rose-500 text-white',
        };

  const icon = tone === 'self' ? '🛡️' : '⚔️';

  return (
    <div className={`rounded-xl p-6 space-y-4 shadow ${toneStyles.container}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-8 w-8 rounded-full flex items-center justify-center text-lg ${toneStyles.icon}`}>
            {icon}
          </span>
          <div>
            <div className="text-sm font-bold text-primary-800">{title}</div>
            <div className="text-[10px] uppercase tracking-wider text-primary-400">
              {tone === 'self' ? 'YOU' : 'RIVAL'}
            </div>
          </div>
        </div>
        <div
          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full border ${toneStyles.badgeBg}`}
        >
          {player.difficulty}
        </div>
      </div>
      <HpGauge
        label="HP"
        hp={player.hp}
        tone={tone}
        footer={<div className="flex items-center justify-between text-xs text-primary-500">
          <span>ライフ</span>
          {renderLives(player.lives)}
        </div>}
      />
      <div className="flex items-center justify-between text-xs text-primary-500">
        <span>コンボ</span>
        <span className="text-sm font-bold text-primary-700">{player.combo}</span>
      </div>
    </div>
  );
}
