import 'server-only';

import { NextRequest, NextResponse } from 'next/server';

import { GENRE_TYPE_MAPPING, PlacesSearchResult, PlacesStatus } from '@shared/types/google-places';
import { Spot } from '@shared/types/spot';

import { serverEnv } from '@/config/server-env';

// サーバーサイド用APIキー（Geocoding API、Places API用）
// 制限なしまたはIPアドレス制限を設定
const GOOGLE_MAPS_API_KEY = serverEnv.google.mapsApiKey;
const MAX_RESULTS = 5; // PoC向けに最大5件まで

/**
 * GET /api/spots?region={region}&genre={genre}
 * Google Places APIを使用したスポット検索
 * キャッシュはバックエンド側（Supabase Edge Functions）で実装予定
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get('region');
  const genre = searchParams.get('genre');

  if (!region || !genre) {
    return NextResponse.json(
      { error: 'Region and genre parameters are required' },
      { status: 400 }
    );
  }

  if (!GOOGLE_MAPS_API_KEY) {
    console.error('⚠️  Google Maps API key (server-side) not configured');
    return NextResponse.json(
      {
        spots: [],
        source: 'error',
        error:
          'Google Maps API key (server-side) is not configured. Please set GOOGLE_MAPS_API_KEY_SERVER in .env.local',
      },
      { status: 500 }
    );
  }

  try {
    // 1. Geocoding APIで地域の緯度経度を取得
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      region + ',日本'
    )}&key=${GOOGLE_MAPS_API_KEY}`;

    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    if (geocodeData.status !== PlacesStatus.OK || !geocodeData.results.length) {
      console.error(`Geocoding failed: ${geocodeData.status}`, geocodeData.error_message);
      return NextResponse.json({
        spots: [],
        source: 'geocode_failed',
        error: `Geocoding failed: ${geocodeData.status}${
          geocodeData.error_message ? ` - ${geocodeData.error_message}` : ''
        }`,
      });
    }

    const location = geocodeData.results[0].geometry.location;

    // 2. Places Text Search APIでスポットを検索
    const placeType = GENRE_TYPE_MAPPING[genre as keyof typeof GENRE_TYPE_MAPPING] || 'restaurant';
    const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      genre
    )}&location=${location.lat},${location.lng}&radius=2000&type=${placeType}&language=ja&key=${GOOGLE_MAPS_API_KEY}`;

    const placesResponse = await fetch(placesUrl);
    const placesData: PlacesSearchResult = await placesResponse.json();

    if (placesData.status === PlacesStatus.OK && placesData.results.length > 0) {
      const spots: Spot[] = placesData.results.slice(0, MAX_RESULTS).map((place) => ({
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        rating: place.rating,
        photoUrl:
          place.photos && place.photos.length > 0
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
            : undefined,
      }));

      return NextResponse.json({ spots, source: 'api' });
    } else {
      console.error(`Places search failed: ${placesData.status}`, placesData.error_message);
      return NextResponse.json({
        spots: [],
        source: 'no_results',
        error: `Places search failed: ${placesData.status}${
          placesData.error_message ? ` - ${placesData.error_message}` : ''
        }`,
      });
    }
  } catch (error) {
    console.error('Spots search error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
