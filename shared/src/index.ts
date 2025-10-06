/**
 * Shared types, configs, and utilities
 */

// Types
export type * from './types/game';
export type * from './types/messages';

// Config
export { DIFFICULTY_CONFIG, calculateDamage, getComboMultiplier } from './config/difficulty';

// Data
export { MOCK_WORDS, getRandomWord, getRandomWords } from './data/mockWords';

// Constants
export { GAME_CONSTANTS } from './constants/game';
