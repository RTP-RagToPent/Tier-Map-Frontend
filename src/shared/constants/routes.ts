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
