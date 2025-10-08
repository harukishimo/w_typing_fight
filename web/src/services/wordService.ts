import type { Difficulty, TypingPromptRow, Word } from 'shared';
import { getRandomWord } from 'shared';

import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient';

type PromptCache = Partial<Record<Difficulty, Word[]>>;

const promptCache: PromptCache = {};

export async function fetchRandomWord(difficulty: Difficulty): Promise<Word> {
  if (!isSupabaseConfigured()) {
    return getRandomWord(difficulty);
  }

  const prompts = await loadPrompts(difficulty);
  if (!prompts || prompts.length === 0) {
    return getRandomWord(difficulty);
  }

  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex]!;
}

async function loadPrompts(difficulty: Difficulty): Promise<Word[] | null> {
  if (promptCache[difficulty]) {
    return promptCache[difficulty] ?? null;
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('typing_prompts')
      .select('id,text,reading,romaji,difficulty,char_count,category,created_at')
      .eq('difficulty', difficulty);

    if (error) {
      console.warn('[wordService] Failed to load prompts from Supabase', error.message);
      return null;
    }

    if (!data) {
      return null;
    }

    const words = data.map(mapPromptRowToWord);
    promptCache[difficulty] = words;
    return words;
  } catch (error) {
    console.error('[wordService] Unexpected error loading prompts', error);
    return null;
  }
}

function mapPromptRowToWord(row: TypingPromptRow): Word {
  return {
    id: row.id,
    text: row.text,
    reading: row.reading,
    romaji: row.romaji,
    difficulty: row.difficulty,
    charCount: row.char_count,
    category: row.category ?? undefined,
  };
}
