/**
 * サーバーサイド専用のGoogle Places API ユーティリティ
 * server-only パッケージでクライアントからのアクセスを防止
 */
import 'server-only';

import { GeocodeResult, PlacesSearchResult, PlacesStatus } from '@shared/types/google-places';
import { Spot } from '@shared/types/spot';

import { serverEnv } from '@/config/server-env';
import { createSupabaseServerClient, isSupabaseConfigured, SpotCache } from '@/lib/supabase-server';

const MAX_RESULTS = 5; // PoC向けに最大5件まで
const CACHE_TTL_DAYS = 7; // キャッシュ有効期限（日）

/**
 * Google Geocoding APIで地域名から緯度経度を取得
 */
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  if (!serverEnv.google.mapsApiKey) {
    console.warn('⚠️  Google Maps API key not configured for Geocoding.');
    return null;
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${serverEnv.google.mapsApiKey}`;

  try {
    const response = await fetch(url);
    const data: GeocodeResult = await response.json();

    if (data.status === PlacesStatus.OK && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }

    console.error('Geocoding failed:', data.status);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Google Places Text Search APIでスポットを検索
 */
export async function searchPlacesNearby(
  query: string,
  location: string,
  radius: string,
  type: string
): Promise<PlacesSearchResult> {
  if (!serverEnv.google.mapsApiKey) {
    return {
      results: [],
      status: PlacesStatus.REQUEST_DENIED,
      error_message: 'Google Maps API key not configured',
    };
  }

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    query
  )}&location=${location}&radius=${radius}&type=${type}&language=ja&key=${serverEnv.google.mapsApiKey}`;

  try {
    const response = await fetch(url);
    const data: PlacesSearchResult = await response.json();
    return data;
  } catch (error) {
    console.error('Places search error:', error);
    return {
      results: [],
      status: PlacesStatus.UNKNOWN_ERROR,
      error_message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Google Places Photo APIで写真URLを取得
 */
export function getPhotoUrl(photoReference: string, maxWidth = 400): string {
  if (!serverEnv.google.mapsApiKey || !photoReference) return '';
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${serverEnv.google.mapsApiKey}`;
}

/**
 * Supabaseキャッシュからスポットデータを取得
 */
export async function getSpotsFromCache(region: string, genre: string): Promise<Spot[] | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured, skipping cache.');
    return null;
  }

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('spots_cache')
    .select('*')
    .eq('region', region)
    .eq('genre', genre)
    .gte('expires_at', new Date().toISOString()) // 有効期限内のもの
    .order('created_at', { ascending: false })
    .limit(MAX_RESULTS);

  if (error) {
    console.error('Error fetching from cache:', error);
    return null;
  }

  if (data && data.length > 0) {
    console.log('Cache hit for:', region, genre);
    // キャッシュ利用回数をインクリメント
    await supabase
      .from('spots_cache')
      .update({ fetch_count: data[0].fetch_count + 1, updated_at: new Date().toISOString() })
      .eq('place_id', data[0].place_id);

    return data.map((item) => ({
      id: item.place_id,
      name: item.name,
      address: item.formatted_address,
      lat: item.lat,
      lng: item.lng,
      rating: item.rating,
      photoUrl: item.photo_reference ? getPhotoUrl(item.photo_reference) : undefined,
    }));
  }

  return null;
}

/**
 * Supabaseキャッシュにスポットデータを保存
 */
export async function saveSpotsToCache(
  region: string,
  genre: string,
  spots: Spot[]
): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured, skipping cache save.');
    return;
  }

  const supabase = createSupabaseServerClient();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const cacheData: SpotCache[] = spots.map((spot) => ({
    place_id: spot.id,
    name: spot.name,
    formatted_address: spot.address,
    lat: spot.lat,
    lng: spot.lng,
    rating: spot.rating,
    photo_reference: spot.photoUrl
      ? spot.photoUrl.split('photo_reference=')[1]?.split('&')[0]
      : undefined,
    region,
    genre,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    expires_at: expiresAt,
    fetch_count: 1,
  }));

  const { error } = await supabase
    .from('spots_cache')
    .upsert(cacheData, { onConflict: 'place_id' });

  if (error) {
    console.error('Error saving to cache:', error);
  } else {
    console.log('Saved to cache:', region, genre);
  }
}
