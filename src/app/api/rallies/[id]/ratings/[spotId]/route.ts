import 'server-only';

import { NextRequest, NextResponse } from 'next/server';

import { Rating } from '@shared/types/functions';

import { serverEnv } from '@/config/server-env';

// Supabase Edge FunctionsのベースURL（サーバーサイド専用）
// API_BASE_URLには /functions/v1 が含まれている前提
const BASE_URL = (serverEnv.backend.apiBaseUrl || '').replace(/\/$/, '');

/**
 * GET /api/rallies/[id]/ratings/[spotId]
 * ラリーの特定スポットの評価を取得
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; spotId: string }> }
) {
  try {
    const { id, spotId } = await params;

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

    const url = `${BASE_URL}/rallies/${id}/ratings/${spotId}`;
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

    const data: Rating = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch rating detail:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
