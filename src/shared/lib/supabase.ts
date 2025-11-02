import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabaseが設定されているかチェック
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Supabaseクライアントのシングルトン
// 環境変数が未設定の場合はダミーURLで初期化（実際には使用しない）
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

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
