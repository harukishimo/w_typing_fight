/**
 * 難易度設定
 */

import type { Difficulty, DifficultyConfig } from '../types/game';

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    difficulty: 'EASY',
    charRange: [5, 10],
    baseDamage: 7,
    maxCombo: 3,
    expectedTime: 5,
    theoreticalDPS: 1.4,
  },
  NORMAL: {
    difficulty: 'NORMAL',
    charRange: [10, 18],
    baseDamage: 12,
    maxCombo: 5,
    expectedTime: 10,
    theoreticalDPS: 1.5,
  },
  HARD: {
    difficulty: 'HARD',
    charRange: [18, 30],
    baseDamage: 18,
    maxCombo: 7,
    expectedTime: 15,
    theoreticalDPS: 1.67,
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
