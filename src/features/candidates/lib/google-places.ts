import { isSupabaseConfigured, SpotCache, supabase } from '@shared/lib/supabase';
import {
  GENRE_TYPE_MAPPING,
  GeocodeResult,
  PlacesSearchResult,
  PlacesStatus,
} from '@shared/types/google-places';
import { Spot } from '@shared/types/spot';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const MAX_RESULTS = 5; // PoC向けに最大5件まで
const CACHE_TTL_DAYS = 7; // キャッシュ有効期限（日）

/**
 * Google Geocoding APIで地域名から緯度経度を取得
 */
async function geocodeRegion(region: string): Promise<{ lat: number; lng: number } | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key is not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        region + ',日本'
      )}&key=${GOOGLE_MAPS_API_KEY}`
    );

    const data: GeocodeResult = await response.json();

    if (data.status === PlacesStatus.OK && data.results.length > 0) {
      return data.results[0].geometry.location;
    }

    console.warn(`Geocoding failed for region: ${region}, status: ${data.status}`);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Google Places APIでスポットを検索
 */
async function searchPlaces(
  location: { lat: number; lng: number },
  genre: string
): Promise<PlacesSearchResult['results']> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key is not configured');
    return [];
  }

  const placeType = GENRE_TYPE_MAPPING[genre] || 'restaurant';

  try {
    // Text Search API を使用
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        genre
      )}&location=${location.lat},${
        location.lng
      }&radius=2000&type=${placeType}&language=ja&key=${GOOGLE_MAPS_API_KEY}`
    );

    const data: PlacesSearchResult = await response.json();

    if (data.status === PlacesStatus.OK) {
      return data.results.slice(0, MAX_RESULTS); // 最大5件に制限
    }

    if (data.status === PlacesStatus.ZERO_RESULTS) {
      console.warn(`No results found for genre: ${genre}`);
      return [];
    }

    console.warn(`Places search failed: ${data.status}`, data.error_message);
    return [];
  } catch (error) {
    console.error('Places search error:', error);
    return [];
  }
}

/**
 * Google Photo APIで写真URLを生成
 */
function getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
  if (!GOOGLE_MAPS_API_KEY || !photoReference) return '';
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
}

/**
 * Supabaseキャッシュからスポットを取得
 */
async function getCachedSpots(region: string, genre: string): Promise<Spot[]> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured, skipping cache');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('spots_cache')
      .select('*')
      .eq('region', region)
      .eq('genre', genre)
      .gt('expires_at', new Date().toISOString()) // 有効期限内のみ
      .order('updated_at', { ascending: false })
      .limit(MAX_RESULTS);

    if (error) {
      console.error('Supabase cache fetch error:', error);
      return [];
    }

    if (data && data.length > 0) {
      console.log(`✅ Cache hit: ${data.length} spots from Supabase`);
      return data.map((cache: SpotCache) => ({
        id: cache.place_id,
        name: cache.name,
        address: cache.formatted_address,
        lat: cache.lat,
        lng: cache.lng,
        rating: cache.rating,
        photoUrl: cache.photo_reference ? getPhotoUrl(cache.photo_reference) : undefined,
      }));
    }

    return [];
  } catch (error) {
    console.error('Cache fetch error:', error);
    return [];
  }
}

/**
 * Supabaseキャッシュにスポットを保存
 */
async function cacheSpots(
  spots: PlacesSearchResult['results'],
  region: string,
  genre: string
): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured, skipping cache');
    return;
  }

  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CACHE_TTL_DAYS);

    const cacheData = spots.map((spot) => ({
      place_id: spot.place_id,
      name: spot.name,
      formatted_address: spot.formatted_address,
      lat: spot.geometry.location.lat,
      lng: spot.geometry.location.lng,
      rating: spot.rating,
      photo_reference: spot.photos?.[0]?.photo_reference,
      region,
      genre,
      business_status: spot.business_status,
      types: spot.types,
      expires_at: expiresAt.toISOString(),
    }));

    // Upsert: 既存データがあれば更新、なければ挿入
    const { error } = await supabase.from('spots_cache').upsert(cacheData, {
      onConflict: 'place_id',
    });

    if (error) {
      console.error('Supabase cache save error:', error);
    } else {
      console.log(`✅ Cached ${cacheData.length} spots to Supabase`);
    }
  } catch (error) {
    console.error('Cache save error:', error);
  }
}

/**
 * スポット検索のメイン関数
 * 1. キャッシュをチェック
 * 2. キャッシュがなければGoogle APIを呼び出し
 * 3. 結果をキャッシュに保存
 */
export async function searchSpots(region: string, genre: string): Promise<Spot[]> {
  console.log(`🔍 Searching spots: ${region} - ${genre}`);

  // 1. キャッシュをチェック
  const cachedSpots = await getCachedSpots(region, genre);
  if (cachedSpots.length > 0) {
    return cachedSpots;
  }

  // 2. Google APIが設定されていなければモックデータを返す
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('⚠️  Google Maps API key not configured, returning mock data');
    return getMockSpots(region, genre);
  }

  // 3. Geocoding APIで地域の緯度経度を取得
  const location = await geocodeRegion(region);
  if (!location) {
    console.warn('Geocoding failed, returning mock data');
    return getMockSpots(region, genre);
  }

  // 4. Places APIでスポットを検索
  const places = await searchPlaces(location, genre);
  if (places.length === 0) {
    console.warn('No places found, returning mock data');
    return getMockSpots(region, genre);
  }

  // 5. Spotオブジェクトに変換
  const spots: Spot[] = places.map((place) => ({
    id: place.place_id,
    name: place.name,
    address: place.formatted_address,
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
    rating: place.rating,
    photoUrl: place.photos?.[0]?.photo_reference
      ? getPhotoUrl(place.photos[0].photo_reference)
      : undefined,
  }));

  // 6. キャッシュに保存
  await cacheSpots(places, region, genre);

  console.log(`✅ Found ${spots.length} spots from Google Places API`);
  return spots;
}

/**
 * フォールバック用のモックデータ
 */
function getMockSpots(region: string, genre: string): Spot[] {
  console.log('📦 Using mock data');

  const mockSpots: Spot[] = [
    {
      id: 'mock-spot-1',
      name: `${region}の${genre}スポット A`,
      address: `${region} 1-1-1`,
      rating: 4.5,
      lat: 35.6812 + Math.random() * 0.01,
      lng: 139.7671 + Math.random() * 0.01,
      photoUrl: 'https://via.placeholder.com/300x200?text=Spot+A',
    },
    {
      id: 'mock-spot-2',
      name: `${region}の${genre}スポット B`,
      address: `${region} 2-2-2`,
      rating: 4.2,
      lat: 35.6812 + Math.random() * 0.01,
      lng: 139.7671 + Math.random() * 0.01,
      photoUrl: 'https://via.placeholder.com/300x200?text=Spot+B',
    },
    {
      id: 'mock-spot-3',
      name: `${region}の${genre}スポット C`,
      address: `${region} 3-3-3`,
      rating: 4.7,
      lat: 35.6812 + Math.random() * 0.01,
      lng: 139.7671 + Math.random() * 0.01,
      photoUrl: 'https://via.placeholder.com/300x200?text=Spot+C',
    },
    {
      id: 'mock-spot-4',
      name: `${region}の${genre}スポット D`,
      address: `${region} 4-4-4`,
      rating: 4.0,
      lat: 35.6812 + Math.random() * 0.01,
      lng: 139.7671 + Math.random() * 0.01,
      photoUrl: 'https://via.placeholder.com/300x200?text=Spot+D',
    },
    {
      id: 'mock-spot-5',
      name: `${region}の${genre}スポット E`,
      address: `${region} 5-5-5`,
      rating: 4.3,
      lat: 35.6812 + Math.random() * 0.01,
      lng: 139.7671 + Math.random() * 0.01,
      photoUrl: 'https://via.placeholder.com/300x200?text=Spot+E',
    },
  ];

  return mockSpots;
}
