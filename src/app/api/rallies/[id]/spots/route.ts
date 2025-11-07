import 'server-only';

import { NextRequest, NextResponse } from 'next/server';

import { SpotListResponse } from '@shared/types/functions';

import { serverEnv } from '@/config/server-env';

// Supabase Edge FunctionsのベースURL（サーバーサイド専用）
// API_BASE_URLには /functions/v1 が含まれている前提
const BASE_URL = (serverEnv.backend.apiBaseUrl || '').replace(/\/$/, '');

/**
 * GET /api/rallies/[id]/spots
 * ラリーのスポット一覧を取得
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Cookieヘッダーをそのまま転送（バックエンド側でsb-access-tokenを取得）
    const cookieHeader = req.headers.get('Cookie');
    // Authorizationヘッダーも追加（バックエンド側の両方の方法に対応）
    const accessToken = req.cookies.get('sb-access-token')?.value;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      apikey: serverEnv.supabase.anonKey,
    };

    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const url = `${BASE_URL}/rallies/${id}/spots`;
    const res = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json(
        { error: `Request failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}` },
        { status: res.status }
      );
    }

    const data: SpotListResponse = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch rally spots:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rallies/[id]/spots
 * ラリーにスポットを追加
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Cookieヘッダーをそのまま転送（バックエンド側でsb-access-tokenを取得）
    const cookieHeader = req.headers.get('Cookie');
    // Authorizationヘッダーも追加（バックエンド側の両方の方法に対応）
    const accessToken = req.cookies.get('sb-access-token')?.value;

    // デバッグログ（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 POST /api/rallies/[id]/spots:', {
        id,
        body,
        hasCookieHeader: !!cookieHeader,
        cookieHeaderLength: cookieHeader?.length || 0,
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length || 0,
        baseUrl: BASE_URL,
        hasAnonKey: !!serverEnv.supabase.anonKey,
      });
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      apikey: serverEnv.supabase.anonKey,
    };

    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const url = `${BASE_URL}/rallies/${id}/spots`;

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Fetching spots:', {
        url,
        method: 'POST',
        headers: Object.keys(headers),
        hasCookie: !!headers['Cookie'],
        cookieHeaderLength: headers['Cookie']?.length || 0,
        hasAuthorization: !!headers['Authorization'],
        authorizationPrefix: headers['Authorization']?.substring(0, 20) || 'none',
        apikeyLength: headers['apikey']?.length || 0,
      });
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json(
        { error: `Request failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}` },
        { status: res.status }
      );
    }

    const data: SpotListResponse = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to add rally spots:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
