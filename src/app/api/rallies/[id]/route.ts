import 'server-only';

import { NextRequest, NextResponse } from 'next/server';

import { RallyResponse } from '@shared/types/functions';

import { serverEnv } from '@/config/server-env';

// Supabase Edge FunctionsのベースURL（サーバーサイド専用）
// API_BASE_URLには /functions/v1 が含まれている前提
const BASE_URL = (serverEnv.backend.apiBaseUrl || '').replace(/\/$/, '');

/**
 * GET /api/rallies/[id]
 * ラリー詳細を取得
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

    const url = `${BASE_URL}/rallies/${id}/`;
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

    const data: RallyResponse = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch rally:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/rallies/[id]
 * ラリーを更新
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // sb-access-tokenを直接読み取る（/auth/callbackで設定される）
    const accessToken = req.cookies.get('sb-access-token')?.value;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      apikey: serverEnv.supabase.anonKey,
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const url = `${BASE_URL}/rallies/${id}/`;
    const res = await fetch(url, {
      method: 'PATCH',
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

    const data: RallyResponse = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to update rally:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rallies/[id]
 * ラリーを削除
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const url = `${BASE_URL}/rallies/${id}/`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json(
        { error: `Request failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}` },
        { status: res.status }
      );
    }

    // レスポンスが空の場合は空のJSONオブジェクトを返す
    const contentType = res.headers.get('content-type');
    const contentLength = res.headers.get('content-length');

    if (contentLength === '0' || !contentType?.includes('application/json')) {
      return NextResponse.json({ message: 'Rally deleted successfully' });
    }

    try {
      const data = await res.json();
      return NextResponse.json(data);
    } catch {
      // JSONパースエラーの場合（空のレスポンスなど）、成功レスポンスを返す
      return NextResponse.json({ message: 'Rally deleted successfully' });
    }
  } catch (error) {
    console.error('Failed to delete rally:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
