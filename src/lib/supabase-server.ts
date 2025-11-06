/**
 * サーバーサイド専用のSupabaseユーティリティ
 * server-only パッケージでクライアントからのアクセスを防止
 */
import 'server-only';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const isServerSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase server configuration is missing: set SUPABASE_URL and SUPABASE_ANON_KEY'
  );
}

export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);

// キャッシュテーブルの型定義
export interface SpotCache {
  place_id: string;
  name: string;
  formatted_address: string;
  lat: number;
  lng: number;
  rating?: number;
  photo_reference?: string;
  region: string;
  genre: string;
  business_status?: string;
  types?: string[];
  created_at: string;
  updated_at: string;
  expires_at: string;
  fetch_count: number;
}

/**
 * サーバーサイドSupabaseクライアントを作成
 */
export function createSupabaseServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration is missing');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Supabaseが設定されているかチェック
 */
export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
