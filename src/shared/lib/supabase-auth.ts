import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseAuthConfigured = (): boolean => Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase auth configuration is missing: set SUPABASE_URL and SUPABASE_ANON_KEY');
}

export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
