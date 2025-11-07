import { NextRequest, NextResponse } from 'next/server';

import setCookie from '@/services/cookie/setCookie';

/**
 * POST /auth/session
 * クライアント側で認証したJWTをCookieに保存
 */
export async function POST(req: NextRequest) {
  try {
    const { accessToken, refreshToken, userId } = await req.json();

    if (!accessToken || !refreshToken || !userId) {
      return NextResponse.json(
        { error: 'accessToken, refreshToken, userId は必須です' },
        { status: 400 }
      );
    }

    // アクセストークンをCookieに保存
    await setCookie({
      name: 'sb-access-token',
      value: accessToken,
      maxAge: 60 * 60 * 24, // 24時間
      path: '/',
    });

    // リフレッシュトークンをCookieに保存
    await setCookie({
      name: 'sb-refresh-token',
      value: refreshToken,
      maxAge: 60 * 60 * 24 * 7, // 7日間
      path: '/',
    });

    // ユーザーIDをCookieに保存
    await setCookie({
      name: 'sb-user-id',
      value: userId,
      maxAge: 60 * 60 * 24, // 24時間
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session save error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
