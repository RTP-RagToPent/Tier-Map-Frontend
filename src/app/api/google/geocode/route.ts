import { NextRequest, NextResponse } from 'next/server';

import { serverEnv } from '@/config/server-env';

/**
 * GET /api/google/geocode?address={address}
 * Google Geocoding APIのプロキシ
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    if (!serverEnv.google.mapsApiKey) {
      return NextResponse.json({ error: 'Google Maps API key is not configured' }, { status: 500 });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${serverEnv.google.mapsApiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Geocode API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
