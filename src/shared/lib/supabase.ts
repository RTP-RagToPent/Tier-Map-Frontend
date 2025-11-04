/**
 * Supabase クライアント設定（認証専用）
 * データベース操作はバックエンドAPI経由で行う
 *
 * 注意: このファイルはクライアントサイドで使用されるため、
 * NEXT_PUBLIC_プレフィックスは必須です。
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabaseが設定されているかチェック
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

/**
 * Supabaseクライアント（認証専用）
 * データベース操作は行わないこと
 *
 * @deprecated データベース操作にはバックエンドAPIを使用してください
 */
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');
