import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import setCookie from '@/services/cookie/setCookie';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase is not configured');
      return NextResponse.redirect(new URL('/login?error=auth_failed', req.url));
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL('/login?error=auth_failed', req.url));
    }

    if (data.session) {
      // アクセストークンとリフレッシュトークンをCookieに保存
      await setCookie({
        name: 'sb-access-token',
        value: data.session.access_token,
        maxAge: 60 * 60 * 24, // 24時間
        path: '/',
      });

      await setCookie({
        name: 'sb-refresh-token',
        value: data.session.refresh_token,
        maxAge: 60 * 60 * 24 * 7, // 7日間
        path: '/',
      });

      // ユーザーIDも保存（オプション）
      await setCookie({
        name: 'sb-user-id',
        value: data.session.user.id,
        maxAge: 60 * 60 * 24, // 24時間
        path: '/',
      });
    }
  }

  // ホームページにリダイレクト
  return NextResponse.redirect(new URL('/search', req.url));
}
