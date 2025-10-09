/**
 * 難易度設定
 */

import type { Difficulty, DifficultyConfig } from '../types/game';

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    difficulty: 'EASY',
    charRange: [5, 10],
    baseDamage: 4,
    maxCombo: 3,
    expectedTime: 5,
    theoreticalDPS: 1.0,
  },
  NORMAL: {
    difficulty: 'NORMAL',
    charRange: [10, 18],
    baseDamage: 14,
    maxCombo: 5,
    expectedTime: 10,
    theoreticalDPS: 1.5,
  },
  SCORE: {
    difficulty: 'SCORE',
    charRange: [14, 24],
    baseDamage: 16,
    maxCombo: 6,
    expectedTime: 12,
    theoreticalDPS: 1.7,
  },
  HARD: {
    difficulty: 'HARD',
    charRange: [18, 30],
    baseDamage: 20,
    maxCombo: 7,
    expectedTime: 15,
    theoreticalDPS: 1.85,
  },
};

/**
 * ダメージ計算
 */
export function calculateDamage(
  difficulty: Difficulty,
  comboCount: number
): number {
  const config = DIFFICULTY_CONFIG[difficulty];
  const comboMultiplier = 1 + Math.min(comboCount, config.maxCombo) * 0.1;
  return Math.floor(config.baseDamage * comboMultiplier);
}

/**
 * コンボ倍率を取得
 */
export function getComboMultiplier(
  difficulty: Difficulty,
  comboCount: number
): number {
  const config = DIFFICULTY_CONFIG[difficulty];
  return 1 + Math.min(comboCount, config.maxCombo) * 0.1;
}
