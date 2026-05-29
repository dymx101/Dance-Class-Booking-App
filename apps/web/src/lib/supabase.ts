import { getSupabase } from '@dance-app/shared';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = getSupabase({
  url: supabaseUrl,
  anonKey: supabaseAnonKey
});
