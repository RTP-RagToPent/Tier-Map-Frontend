import type { Rally, RallyListResponse, SpotListResponse, RatingListResponse, Spot, Rating } from '@shared/types/functions';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed: ${res.status} ${text}`);
  }
  return res.json();
}

export const functionsClient = {
  // profiles
  getProfile: () => request<{ id: number; name: string; message: string }>(`/functions/v1/profiles/`),
  createProfile: (body: { name: string }) =>
    request<{ id: number; name: string; message: string }>(`/functions/v1/profiles/`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateProfile: (body: { name: string }) =>
    request<{ id: number; name: string; message: string }>(`/functions/v1/profiles/`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  // rallies
  getRallies: () => request<RallyListResponse>(`/functions/v1/rallies/`),
  createRally: (body: { name: string; genre: string }) =>
    request<Rally>(`/functions/v1/rallies/`, { method: 'POST', body: JSON.stringify(body) }),
  getRally: (rallyId: number) => request<Rally>(`/functions/v1/rallies/${rallyId}/`),
  updateRally: (rallyId: number, body: { name?: string; genre?: string }) =>
    request<Rally>(`/functions/v1/rallies/${rallyId}/`, { method: 'PATCH', body: JSON.stringify(body) }),

  // spots
  getRallySpots: (rallyId: number) => request<SpotListResponse>(`/functions/v1/rallies/${rallyId}/spots`),
  addRallySpots: (
    rallyId: number,
    body: { spots: Array<{ spot_id: string; name: string }> }
  ) => request<SpotListResponse>(`/functions/v1/rallies/${rallyId}/spots`, { method: 'POST', body: JSON.stringify(body) }),
  getRallySpot: (rallyId: number, spotId: string) =>
    request<Spot>(`/functions/v1/rallies/${rallyId}/spots/${spotId}`),

  // ratings
  getRallyRatings: (rallyId: number) => request<RatingListResponse>(`/functions/v1/rallies/${rallyId}/ratings`),
  createRating: (
    rallyId: number,
    body: { spot_id: string; stars: number; memo?: string }
  ) => request<Rating>(`/functions/v1/rallies/${rallyId}/ratings/`, { method: 'POST', body: JSON.stringify(body) }),
  getRatingDetail: (rallyId: number, spotId: string) =>
    request<Rating>(`/functions/v1/rallies/${rallyId}/ratings/${spotId}`),
};
