import { NextRequest, NextResponse } from 'next/server';

import { GENRE_TYPE_MAPPING, PlacesSearchResult, PlacesStatus } from '@shared/types/google-places';
import { Spot } from '@shared/types/spot';

import { geocodeAddress, getSpotsFromCache, saveSpotsToCache } from '@/lib/google-places-server';

/**
 * GET /api/google/spots?region={region}&genre={genre}
 * Google Places APIとSupabaseキャッシュを使用したスポット検索
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const region = searchParams.get('region');
    const genre = searchParams.get('genre');

    if (!region || !genre) {
      return NextResponse.json({ error: 'Region and genre are required' }, { status: 400 });
    }

    console.log('🔍 Searching spots:', region, '-', genre);

    // 1. キャッシュから取得を試みる
    const cachedSpots = await getSpotsFromCache(region, genre);
    if (cachedSpots && cachedSpots.length > 0) {
      console.log('📦 Using cached data:', cachedSpots.length, 'spots');
      return NextResponse.json({ spots: cachedSpots, source: 'cache' });
    }

    // 2. Geocoding APIで地域を緯度経度に変換
    const location = await geocodeAddress(region);
    if (!location) {
      console.error('Failed to geocode region:', region);
      return NextResponse.json({ spots: [], source: 'error' });
    }

    // 3. Places Text Search APIでスポットを検索
    const placeType = GENRE_TYPE_MAPPING[genre] || 'point_of_interest';
    const textSearchUrl = `/api/google/places/search?query=${encodeURIComponent(
      genre
    )}&location=${location.lat},${location.lng}&radius=2000&type=${placeType}`;

    const response = await fetch(`${req.nextUrl.origin}${textSearchUrl}`, {
      headers: req.headers,
    });
    const data = await response.json();

    if (data.status === PlacesStatus.OK && data.results.length > 0) {
      const spots: Spot[] = data.results
        .slice(0, 5)
        .map((place: PlacesSearchResult['results'][0]) => ({
          id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          rating: place.rating,
          photoUrl:
            place.photos && place.photos.length > 0
              ? `/api/google/places/photo?reference=${place.photos[0].photo_reference}`
              : undefined,
        }));

      // 4. キャッシュに保存
      await saveSpotsToCache(region, genre, spots);

      return NextResponse.json({ spots, source: 'api' });
    } else {
      console.error('Places Text Search failed:', data.status, data.error_message);
      return NextResponse.json({ spots: [], source: 'error' });
    }
  } catch (error) {
    console.error('Spots search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
