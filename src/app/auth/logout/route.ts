import { NextResponse } from 'next/server';

import { deleteCookie } from '@/services/cookie/getCookie';

/**
 * POST /auth/logout
 * ログアウト処理（Cookieを削除）
 */
export async function POST() {
  try {
    // Cookieを削除
    await deleteCookie('sb-access-token');
    await deleteCookie('sb-refresh-token');
    await deleteCookie('sb-user-id');

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ ok: false, message: 'logout failed' }, { status: 500 });
  }
}

