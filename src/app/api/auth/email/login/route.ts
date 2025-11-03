import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { serverEnv } from '@/config/server-env';
import setCookie from '@/services/cookie/setCookie';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'メールアドレスとパスワードは必須です' }, { status: 400 });
    }

    if (!serverEnv.supabase.url || !serverEnv.supabase.anonKey) {
      console.error('Supabase is not configured');
      return NextResponse.json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    const supabase = createClient(serverEnv.supabase.url, serverEnv.supabase.anonKey);

    // まずログインを試行
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // ログイン失敗の場合、新規登録を試行
    if (error && error.message.includes('Invalid login credentials')) {
      const signUpResult = await supabase.auth.signUp({
        email,
        password,
      });
      data = signUpResult.data;
      error = signUpResult.error;
    }

    if (error) {
      console.error('Email auth error:', error);
      return NextResponse.json({ error: error.message || '認証に失敗しました' }, { status: 401 });
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

      await setCookie({
        name: 'sb-user-id',
        value: data.session.user.id,
        maxAge: 60 * 60 * 24, // 24時間
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'セッションの作成に失敗しました' }, { status: 500 });
  } catch (error) {
    console.error('Email login route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
