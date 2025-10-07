import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let cachedClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
} else {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL または VITE_SUPABASE_ANON_KEY が設定されていません。認証機能は利用できません。'
  );
}

export function getSupabaseClient(): SupabaseClient {
  if (!cachedClient) {
    throw new Error('Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }
  return cachedClient;
}

export function isSupabaseConfigured(): boolean {
  return cachedClient !== null;
}

