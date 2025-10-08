import type { Difficulty, TypingPromptRow, Word } from 'shared';
import { getRandomWord } from 'shared';

interface SupabaseEnv {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_ANON_KEY?: string;
}

export async function fetchRandomWord(
  env: SupabaseEnv,
  difficulty: Difficulty
): Promise<Word> {
  const supabaseWord = await fetchSupabaseWord(env, difficulty);
  if (supabaseWord) {
    return supabaseWord;
  }

  return getRandomWord(difficulty);
}

async function fetchSupabaseWord(
  env: SupabaseEnv,
  difficulty: Difficulty
): Promise<Word | null> {
  const supabaseUrl = env.SUPABASE_URL;
  const apiKey = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !apiKey) {
    return null;
  }

  const url = new URL(`${supabaseUrl}/rest/v1/typing_prompts`);
  url.searchParams.set('select', 'id,text,reading,romaji,difficulty,char_count,category,created_at');
  url.searchParams.set('difficulty', `eq.${difficulty}`);
  url.searchParams.set('limit', '1');
  url.searchParams.append('order', 'random');

  try {
    const response = await fetch(url.toString(), {
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.warn('[wordService] Failed to fetch prompt from Supabase', response.status);
      return null;
    }

    const data = (await response.json()) as TypingPromptRow[];
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const [row] = data;
    if (!row) {
      return null;
    }

    return mapPromptRowToWord(row);
  } catch (error) {
    console.error('[wordService] Error fetching prompt from Supabase', error);
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
