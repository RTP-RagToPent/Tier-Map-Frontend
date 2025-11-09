import 'server-only';

import { NextRequest, NextResponse } from 'next/server';

import type { Rating, Spot } from '@shared/types/functions';

import { serverEnv } from '@/config/server-env';

// Supabase Edge FunctionsのベースURL（サーバーサイド専用）
// API_BASE_URLには /functions/v1 が含まれている前提
const BASE_URL = (serverEnv.backend.apiBaseUrl || '').replace(/\/$/, '');

/**
 * GET /api/rallies/[id]/share
 * 共有用のラリー情報を取得（認証不要）
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Cookieヘッダーをそのまま転送（バックエンド側でsb-access-tokenを取得）
    const cookieHeader = req.headers.get('Cookie');
    // Authorizationヘッダーも追加（バックエンド側の両方の方法に対応）
    const accessToken = req.cookies.get('sb-access-token')?.value;

    // 共有ページは認証不要だが、バックエンドAPIがAuthorizationヘッダーを要求する場合があるため
    // anonKeyをBearerトークンとして送信（認証トークンがある場合はそれを使用）
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      apikey: serverEnv.supabase.anonKey,
    };

    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
      // 認証トークンがない場合はanonKeyを使用
      headers['Authorization'] = `Bearer ${serverEnv.supabase.anonKey}`;
    }

    const numericRallyId = parseInt(id, 10);
    if (isNaN(numericRallyId)) {
      return NextResponse.json({ error: 'Invalid rally ID' }, { status: 400 });
    }

    // 1. ラリー基本情報を取得（認証不要）
    const rallyUrl = `${BASE_URL}/rallies/${numericRallyId}`;
    const rallyRes = await fetch(rallyUrl, {
      method: 'GET',
      headers,
    });

    if (!rallyRes.ok) {
      const text = await rallyRes.text().catch(() => '');
      return NextResponse.json(
        {
          error: `Failed to fetch rally: ${rallyRes.status} ${rallyRes.statusText}${text ? ` - ${text}` : ''}`,
        },
        { status: rallyRes.status }
      );
    }

    const rallyData = await rallyRes.json();

    // 2. 評価データを取得（認証不要）
    const ratingsUrl = `${BASE_URL}/rallies/${numericRallyId}/ratings`;
    const ratingsRes = await fetch(ratingsUrl, {
      method: 'GET',
      headers,
    });

    if (!ratingsRes.ok) {
      const text = await ratingsRes.text().catch(() => '');
      return NextResponse.json(
        {
          error: `Failed to fetch ratings: ${ratingsRes.status} ${ratingsRes.statusText}${text ? ` - ${text}` : ''}`,
        },
        { status: ratingsRes.status }
      );
    }

    const ratingsData = await ratingsRes.json();

    // 3. スポット一覧を取得（認証不要）
    const spotsUrl = `${BASE_URL}/rallies/${numericRallyId}/spots`;
    const spotsRes = await fetch(spotsUrl, {
      method: 'GET',
      headers,
    });

    if (!spotsRes.ok) {
      const text = await spotsRes.text().catch(() => '');
      return NextResponse.json(
        {
          error: `Failed to fetch spots: ${spotsRes.status} ${spotsRes.statusText}${text ? ` - ${text}` : ''}`,
        },
        { status: spotsRes.status }
      );
    }

    const spotsData = await spotsRes.json();

    // 4. スポットIDのマッピングを作成
    const spotsArray = Array.isArray(spotsData.data) ? spotsData.data : [];
    const spotMap = new Map<string, Spot>(spotsArray.map((spot: Spot) => [spot.id, spot]));

    // 5. 評価データとスポット情報をマージ
    interface SpotWithDetails {
      id: string;
      name: string;
      rating: number;
      memo: string;
      order_no: number;
    }

    const ratingsArray = Array.isArray(ratingsData.data) ? ratingsData.data : [];
    const spotsWithDetails: SpotWithDetails[] = ratingsArray.map((rating: Rating) => {
      const spot = spotMap.get(rating.spot_id);
      return {
        id: rating.spot_id,
        name: rating.name || spot?.name || '不明なスポット',
        rating: rating.stars,
        memo: rating.memo || '',
        order_no: spot?.order_no || 0,
      };
    });

    // 6. 平均評価を計算
    const averageRating =
      spotsWithDetails.length > 0
        ? spotsWithDetails.reduce((sum: number, s: SpotWithDetails) => sum + s.rating, 0) /
          spotsWithDetails.length
        : 0;

    return NextResponse.json({
      rally: {
        id: rallyData.data.id,
        name: rallyData.data.name,
        genre: rallyData.data.genre,
      },
      spots: spotsWithDetails,
      averageRating,
    });
  } catch (error) {
    console.error('Failed to fetch share data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
