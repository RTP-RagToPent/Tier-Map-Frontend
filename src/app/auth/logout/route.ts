import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /auth/logout
 * ログアウト処理（Cookieを削除）
 */
export async function POST(req: NextRequest) {
  try {
    const loginUrl = new URL('/login', req.url);
    const res = NextResponse.redirect(loginUrl, 303);

    // Cookieを削除
    res.cookies.delete('sb-access-token');
    res.cookies.delete('sb-refresh-token');

    return res;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ ok: false, message: 'logout failed' }, { status: 500 });
  }
}
