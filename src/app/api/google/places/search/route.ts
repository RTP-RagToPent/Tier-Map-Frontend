import { NextRequest, NextResponse } from 'next/server';

import { serverEnv } from '@/config/server-env';

/**
 * GET /api/google/places/search?query={query}&location={lat,lng}&radius={radius}&type={type}
 * Google Places Text Search APIのプロキシ
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const query = searchParams.get('query');
    const location = searchParams.get('location');
    const radius = searchParams.get('radius') || '2000';
    const type = searchParams.get('type') || 'point_of_interest';

    if (!query || !location) {
      return NextResponse.json({ error: 'Query and location are required' }, { status: 400 });
    }

    if (!serverEnv.google.mapsApiKey) {
      return NextResponse.json({ error: 'Google Maps API key is not configured' }, { status: 500 });
    }

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&location=${location}&radius=${radius}&type=${type}&language=ja&key=${serverEnv.google.mapsApiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Places search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
