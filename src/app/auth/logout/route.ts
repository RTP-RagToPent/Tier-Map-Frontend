import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /auth/logout
 * ログアウト処理（Cookieを削除）
 */
export async function POST(req: NextRequest) {
  try {
    const loginUrl = new URL('/login', req.url);
    const res = NextResponse.redirect(loginUrl, 303);

    // Cookieを削除（設定時と同じ属性を指定）
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0,
    };
    res.cookies.set('sb-access-token', '', cookieOptions);
    res.cookies.set('sb-refresh-token', '', cookieOptions);

    return res;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ ok: false, message: 'logout failed' }, { status: 500 });
  }
}
