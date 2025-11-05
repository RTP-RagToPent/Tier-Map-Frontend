import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * POST /auth/logout
 * ログアウト処理（Cookieを削除）
 */
export async function POST() {
  try {
    const cookieStore = cookies();

    // Cookieを削除
    cookieStore.delete('sb-access-token');
    cookieStore.delete('sb-refresh-token');
    cookieStore.delete('sb-user-id');

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ ok: false, message: 'logout failed' }, { status: 500 });
  }
}

