import { NextRequest, NextResponse } from 'next/server';

import { serverEnv } from '@/config/server-env';

/**
 * GET /api/google/places/photo?reference={photo_reference}&maxwidth={maxwidth}
 * Google Places Photo APIのプロキシ
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const photoReference = searchParams.get('reference');
    const maxWidth = searchParams.get('maxwidth') || '400';

    if (!photoReference) {
      return NextResponse.json({ error: 'Photo reference is required' }, { status: 400 });
    }

    if (!serverEnv.google.mapsApiKey) {
      return NextResponse.json({ error: 'Google Maps API key is not configured' }, { status: 500 });
    }

    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${serverEnv.google.mapsApiKey}`;

    // 画像を直接プロキシ
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch photo' }, { status: response.status });
    }

    // 画像をそのまま返す
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 24時間キャッシュ
      },
    });
  } catch (error) {
    console.error('Places photo API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
