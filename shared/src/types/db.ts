import type { Difficulty } from './game';

export interface TypingPromptRow {
  id: string;
  text: string;
  reading: string;
  romaji: string;
  difficulty: Difficulty;
  char_count: number;
  category: string | null;
  created_at: string;
}
