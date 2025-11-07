import type {
  ProfileResponse,
  RallyListResponse,
  RallyResponse,
  RatingListResponse,
  RatingResponse,
  SpotListResponse,
  SpotResponse,
} from '@shared/types/functions';

/**
 * Route Handler経由でAPIを呼び出す（サーバーサイドでSUPABASE_ANON_KEYを使用）
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `/api${path}`;

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      credentials: 'include', // Cookieを送信（Route Handlerでアクセストークンを取得するため）
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const errorMessage = `Request failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`;

      // 401エラーの場合、ログアウト処理を実行
      if (res.status === 401 && typeof window !== 'undefined') {
        try {
          await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include',
          });
          window.location.href = '/login';
        } catch (logoutError) {
          console.error('Failed to logout:', logoutError);
          window.location.href = '/login';
        }
      }

      throw new Error(errorMessage);
    }
    return res.json();
  } catch (error) {
    console.error('❌ API Request Error:', {
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

export const functionsClient = {
  // profiles
  getProfile: () => request<ProfileResponse>(`/profiles`),
  createProfile: (body: { name: string }) =>
    request<ProfileResponse>(`/profiles`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateProfile: (body: { name: string }) =>
    request<ProfileResponse>(`/profiles`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  // rallies
  getRallies: () => request<RallyListResponse>(`/rallies`),
  createRally: (body: { name: string; genre: string }) =>
    request<RallyResponse>(`/rallies`, { method: 'POST', body: JSON.stringify(body) }),
  getRally: (rallyId: number) => request<RallyResponse>(`/rallies/${rallyId}`),
  updateRally: (rallyId: number, body: { name?: string; genre?: string }) =>
    request<RallyResponse>(`/rallies/${rallyId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  // spots
  getRallySpots: (rallyId: number) => request<SpotListResponse>(`/rallies/${rallyId}/spots`),
  addRallySpots: (rallyId: number, body: { spots: Array<{ spot_id: string; name: string }> }) =>
    request<SpotListResponse>(`/rallies/${rallyId}/spots`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getRallySpot: (rallyId: number, spotId: string) =>
    request<SpotResponse>(`/rallies/${rallyId}/spots/${spotId}`),

  // ratings
  getRallyRatings: (rallyId: number) => request<RatingListResponse>(`/rallies/${rallyId}/ratings`),
  createRating: (rallyId: number, body: { spot_id: string; stars: number; memo?: string }) =>
    request<RatingResponse>(`/rallies/${rallyId}/ratings`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getRatingDetail: (rallyId: number, spotId: string) =>
    request<RatingResponse>(`/rallies/${rallyId}/ratings/${spotId}`),
};
