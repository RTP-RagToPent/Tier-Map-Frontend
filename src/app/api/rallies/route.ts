import 'server-only';

import { NextRequest, NextResponse } from 'next/server';

import { Rally, RallyListResponse } from '@shared/types/functions';

import { serverEnv } from '@/config/server-env';

// Supabase Edge FunctionsのベースURL（サーバーサイド専用）
// API_BASE_URLには /functions/v1 が含まれている前提
const BASE_URL = (serverEnv.backend.apiBaseUrl || '').replace(/\/$/, '');

/**
 * GET /api/rallies
 * ラリー一覧を取得
 */
export async function GET(req: NextRequest) {
  try {
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

    const url = `${BASE_URL}/rallies/`;
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

    const data: RallyListResponse = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch rallies:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rallies
 * ラリーを作成
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Cookieヘッダーをそのまま転送（バックエンド側でsb-access-tokenを取得）
    const cookieHeader = req.headers.get('Cookie');
    // Authorizationヘッダーも追加（バックエンド側の両方の方法に対応）
    const accessToken = req.cookies.get('sb-access-token')?.value;

    // デバッグログ（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      const allCookies = req.cookies.getAll();
      console.log('🔍 POST /api/rallies:', {
        body,
        hasCookieHeader: !!cookieHeader,
        cookieHeaderLength: cookieHeader?.length || 0,
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length || 0,
        allCookieNames: allCookies.map((c) => c.name),
        cookiesWithSb: allCookies.filter((c) => c.name.includes('sb')).map((c) => c.name),
        baseUrl: BASE_URL,
        hasAnonKey: !!serverEnv.supabase.anonKey,
      });
    }

    // 環境変数の検証
    if (!serverEnv.supabase.anonKey) {
      console.error('❌ SUPABASE_ANON_KEY is not set');
      return NextResponse.json(
        { error: 'Server configuration error: SUPABASE_ANON_KEY is not set' },
        { status: 500 }
      );
    }

    if (!BASE_URL) {
      console.error('❌ API_BASE_URL is not set');
      return NextResponse.json(
        { error: 'Server configuration error: API_BASE_URL is not set' },
        { status: 500 }
      );
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

    const url = `${BASE_URL}/rallies/`;

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Fetching:', {
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
      console.error('❌ Supabase Edge Function error:', {
        status: res.status,
        statusText: res.statusText,
        response: text,
      });
      return NextResponse.json(
        { error: `Request failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}` },
        { status: res.status }
      );
    }

    const response = await res.json();

    // デバッグログ（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Rally creation response:', {
        response,
        hasData: !!response.data,
        data: response.data,
      });
    }

    // バックエンドのレスポンス構造: { message: string, data: Rally }
    // data.dataを返す（Rally型）
    const data: Rally = response.data || response;

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Failed to create rally:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
