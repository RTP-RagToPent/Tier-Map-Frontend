/**
 * サーバーサイド専用のSupabaseユーティリティ
 * server-only パッケージでクライアントからのアクセスを防止
 */
import 'server-only';

import { createClient } from '@supabase/supabase-js';

import { serverEnv } from '@/config/server-env';

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
  if (!serverEnv.supabase.url || !serverEnv.supabase.anonKey) {
    throw new Error('Supabase configuration is missing');
  }

  return createClient(serverEnv.supabase.url, serverEnv.supabase.anonKey);
}

/**
 * Supabaseが設定されているかチェック
 */
export function isSupabaseConfigured() {
  return Boolean(serverEnv.supabase.url && serverEnv.supabase.anonKey);
}
