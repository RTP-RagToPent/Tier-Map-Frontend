/**
 * アプリケーション全体のルート定義
 */

export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  CANDIDATES: '/candidates',
  RALLIES: '/rallies',
  RALLY_CREATE: '/rally/create',
  RALLY_DETAIL: (id: string) => `/rally/${id}`,
  RALLY_EVALUATE: (rallyId: string, spotId: string) => `/rally/${rallyId}/evaluate/${spotId}`,
  RALLY_TIER: (id: string) => `/rally/${id}/tier`,
  RALLY_SHARE: (id: string) => `/rally/${id}/share`,
  API_HEALTH: '/api/health',
} as const;

export const API_ENDPOINTS = {
  // 認証
  LOGIN: '/login',

  // プロフィール
  PROFILES: '/profiles',

  // ラリー
  RALLIES: '/rallies',
  RALLY_DETAIL: (rallyId: number) => `/rallies/${rallyId}`,

  // スポット
  RALLY_SPOTS: (rallyId: number) => `/rallies/${rallyId}/spots`,
  RALLY_SPOT_DETAIL: (rallyId: number, spotId: string) => `/rallies/${rallyId}/spots/${spotId}`,

  // 評価
  RALLY_RATINGS: (rallyId: number) => `/rallies/${rallyId}/ratings`,
  RALLY_RATING_DETAIL: (rallyId: number, spotId: string) => `/rallies/${rallyId}/ratings/${spotId}`,
} as const;
