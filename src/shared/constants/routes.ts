/**
 * アプリケーション全体のルート定義
 */

export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  CANDIDATES: '/candidates',
  RALLIES: '/rallies',
  RALLY_CREATE: '/rallies/create',
  RALLY_DETAIL: (id: string) => `/rallies/${id}`,
  RALLY_EVALUATE: (rallyId: string, spotId: string) => `/rallies/${rallyId}/evaluate/${spotId}`,
  RALLY_TIER: (id: string) => `/rallies/${id}/tier`,
  RALLY_SHARE: (id: string) => `/rallies/${id}/share`,
  API_HEALTH: '/api/health',
} as const;
