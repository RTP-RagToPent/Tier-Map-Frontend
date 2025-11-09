import 'server-only';

import { NextRequest, NextResponse } from 'next/server';

import {
  GENRE_TYPE_MAPPING,
  PlaceDetailsResult,
  PlacesSearchResult,
  PlacesStatus,
} from '@shared/types/google-places';
import { Spot } from '@shared/types/spot';

import { serverEnv } from '@/config/server-env';

const MAX_RESULTS = 5; // PoC向けに最大5件まで

/**
 * GET /api/spots?region={region}&genre={genre}
 * GET /api/spots?place_id={place_id}
 * Google Places APIを使用したスポット検索または詳細取得
 * キャッシュはバックエンド側（Supabase Edge Functions）で実装予定
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get('place_id');
  const region = searchParams.get('region');
  const genre = searchParams.get('genre');

  const googleMapsApiKey = serverEnv.google.mapsApiKey;

  if (!googleMapsApiKey) {
    console.warn('⚠️  Google Maps API key not configured (GOOGLE_MAPS_API_KEY_SERVER)');
    return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
  }

  // place_idが指定されている場合は詳細情報を取得
  if (placeId) {
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
        placeId
      )}&fields=name,formatted_address,geometry,rating,photos&language=ja&key=${googleMapsApiKey}`;

      const detailsResponse = await fetch(detailsUrl);
      const detailsData: PlaceDetailsResult = await detailsResponse.json();

      if (detailsData.status !== PlacesStatus.OK || !detailsData.result) {
        console.warn(`Places details failed: ${detailsData.status}`, detailsData.status);
        return NextResponse.json(
          {
            error: `Places details failed: ${detailsData.status}`,
          },
          { status: 400 }
        );
      }

      const result = detailsData.result;
      const photoUrl =
        result.photos && result.photos.length > 0
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${result.photos[0].photo_reference}&key=${googleMapsApiKey}`
          : undefined;

      return NextResponse.json({
        address: result.formatted_address,
        photoUrl,
        rating: result.rating,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      });
    } catch (error) {
      console.error('Places details error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Internal server error' },
        { status: 500 }
      );
    }
  }

  // 検索モード
  if (!region || !genre) {
    return NextResponse.json(
      { error: 'Region and genre parameters are required for search' },
      { status: 400 }
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
    // マッピングにないジャンル（カスタムジャンルなど）の場合はtypeパラメータを省略してテキストクエリのみで検索
    const placeType = GENRE_TYPE_MAPPING[genre as keyof typeof GENRE_TYPE_MAPPING];
    const queryParams = new URLSearchParams({
      query: genre, // ジャンル名で検索（ジム、ボルダリングなども検索可能）
      location: `${location.lat},${location.lng}`,
      radius: '5000',
      language: 'ja',
      key: googleMapsApiKey,
    });

    // マッピングに定義されているジャンルのみtypeパラメータを追加
    // カスタムジャンルなど、マッピングにない場合はtypeを指定しないため、すべてのタイプの施設が検索対象となる
    if (placeType) {
      queryParams.append('type', placeType);
    }

    const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?${queryParams.toString()}`;

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
