import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { ScoreAttackHighScore } from 'shared';

const SCORE_TABLE = 'score_attack_high_scores';
const SCORE_VIEW = 'v_score_attack_high_scores';

type ScoreAttackRow = {
  user_id: string;
  display_name: string | null;
  best_score: number;
  updated_at: string;
};

const DEFAULT_DISPLAY_NAME = 'Anonymous';

function mapRowToHighScore(row: ScoreAttackRow): ScoreAttackHighScore {
  return {
    userId: row.user_id,
    displayName: row.display_name ?? DEFAULT_DISPLAY_NAME,
    bestScore: row.best_score,
    updatedAt: row.updated_at,
  };
}

export async function fetchScoreAttackHighScores(limit = 10): Promise<ScoreAttackHighScore[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(SCORE_VIEW)
      .select('*')
      .order('best_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('[ScoreAttack] Failed to fetch high scores', error.message);
      return [];
    }

    if (!data) {
      return [];
    }

    return (data as ScoreAttackRow[]).map(mapRowToHighScore);
  } catch (error) {
    console.error('[ScoreAttack] Unexpected error fetching high scores', error);
    return [];
  }
}

type UpsertResult = 'inserted' | 'updated' | 'skipped' | 'no-op' | 'error';

export async function upsertScoreAttackHighScore(params: {
  userId: string;
  displayName: string;
  score: number;
}): Promise<UpsertResult> {
  if (!isSupabaseConfigured()) {
    return 'no-op';
  }

  const { userId, displayName, score } = params;

  try {
    const supabase = getSupabaseClient();

    const { data: existing, error: fetchError } = await supabase
      .from(SCORE_TABLE)
      .select('best_score')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('[ScoreAttack] Failed to fetch existing high score', fetchError.message);
      return 'error';
    }

    if (!existing) {
      const { error: insertError } = await supabase.from(SCORE_TABLE).insert({
        user_id: userId,
        display_name: displayName,
        best_score: score,
      });

      if (insertError) {
        console.error('[ScoreAttack] Failed to insert high score', insertError.message);
        return 'error';
      }

      return 'inserted';
    }

    if (score <= existing.best_score) {
      return 'skipped';
    }

    const { error: updateError } = await supabase
      .from(SCORE_TABLE)
      .update({
        best_score: score,
        display_name: displayName,
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('[ScoreAttack] Failed to update high score', updateError.message);
      return 'error';
    }

    return 'updated';
  } catch (error) {
    console.error('[ScoreAttack] Unexpected error upserting high score', error);
    return 'error';
  }
}
