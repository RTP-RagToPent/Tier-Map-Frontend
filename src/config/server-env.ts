/**
 * サーバーサイド専用の環境変数設定
 * クライアントからはアクセスできません
 */

export const serverEnv = {
  // Supabase設定
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
  },

  // Google Maps API設定
  google: {
    mapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  },

  // バックエンドAPI設定
  backend: {
    apiBaseUrl: process.env.API_BASE_URL || '',
  },
} as const;

/**
 * 環境変数が設定されているかチェック
 */
export const isSupabaseConfigured = () => {
  return Boolean(serverEnv.supabase.url && serverEnv.supabase.anonKey);
};

export const isGoogleMapsConfigured = () => {
  return Boolean(serverEnv.google.mapsApiKey);
};

export const isBackendApiConfigured = () => {
  return Boolean(serverEnv.backend.apiBaseUrl);
};
