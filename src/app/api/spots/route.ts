import 'server-only';

import { NextRequest, NextResponse } from 'next/server';

import { GENRE_TYPE_MAPPING, PlacesSearchResult, PlacesStatus } from '@shared/types/google-places';
import { Spot } from '@shared/types/spot';

import { serverEnv } from '@/config/server-env';

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

  const googleMapsApiKey = serverEnv.google.mapsApiKey;

  if (!googleMapsApiKey) {
    console.warn('⚠️  Google Maps API key not configured (GOOGLE_MAPS_API_KEY_SERVER)');
    return NextResponse.json(
      { error: 'Google Maps API key not configured', spots: [] },
      { status: 500 }
    );
  }

  try {
    // 1. Geocoding APIで地域の緯度経度を取得
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      region + ',日本'
    )}&key=${googleMapsApiKey}`;

    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    if (geocodeData.status !== PlacesStatus.OK || !geocodeData.results.length) {
      console.warn(`Geocoding failed: ${geocodeData.status}`, geocodeData.error_message);
      return NextResponse.json(
        {
          error: `Geocoding failed: ${geocodeData.status}`,
          spots: [],
          source: 'geocode_failed',
        },
        { status: 400 }
      );
    }

    const location = geocodeData.results[0].geometry.location;

    // 2. Places Text Search APIでスポットを検索
    const placeType = GENRE_TYPE_MAPPING[genre as keyof typeof GENRE_TYPE_MAPPING] || 'restaurant';
    const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      genre
    )}&location=${location.lat},${location.lng}&radius=2000&type=${placeType}&language=ja&key=${googleMapsApiKey}`;

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
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${googleMapsApiKey}`
            : undefined,
      }));

      return NextResponse.json({ spots, source: 'api' });
    } else {
      console.warn(`Places search failed: ${placesData.status}`, placesData.error_message);
      return NextResponse.json(
        {
          error: `Places search failed: ${placesData.status}`,
          spots: [],
          source: 'no_results',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Spots search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
