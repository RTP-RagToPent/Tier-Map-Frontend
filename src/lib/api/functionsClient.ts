import type {
  Rally,
  RallyListResponse,
  Rating,
  RatingListResponse,
  Spot,
  SpotListResponse,
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
  getProfile: () => request<{ id: number; name: string; message: string }>(`/profiles`),
  createProfile: (body: { name: string }) =>
    request<{ id: number; name: string; message: string }>(`/profiles`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateProfile: (body: { name: string }) =>
    request<{ id: number; name: string; message: string }>(`/profiles`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  // rallies
  getRallies: () => request<RallyListResponse>(`/rallies`),
  createRally: (body: { name: string; genre: string }) =>
    request<Rally>(`/rallies`, { method: 'POST', body: JSON.stringify(body) }),
  getRally: (rallyId: number) => request<Rally>(`/rallies/${rallyId}`),
  updateRally: (rallyId: number, body: { name?: string; genre?: string }) =>
    request<Rally>(`/rallies/${rallyId}`, {
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
    request<Spot>(`/rallies/${rallyId}/spots/${spotId}`),

  // ratings
  getRallyRatings: (rallyId: number) => request<RatingListResponse>(`/rallies/${rallyId}/ratings`),
  createRating: (rallyId: number, body: { spot_id: string; stars: number; memo?: string }) =>
    request<Rating>(`/rallies/${rallyId}/ratings`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getRatingDetail: (rallyId: number, spotId: string) =>
    request<Rating>(`/rallies/${rallyId}/ratings/${spotId}`),
};
