import { NextRequest, NextResponse } from 'next/server';

import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
    }

    // まずログイン試行
    const { data: loginData, error: loginError } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    });

    // 結果を統一的に扱うため、session と authError を独立変数に格納
    let session = loginData.session;
    let authError = loginError;

    // ログイン失敗時、特定エラーならサインアップ試行
    if (authError && authError.message.includes('Invalid login credentials')) {
      const { data: signUpData, error: signUpError } = await supabaseServer.auth.signUp({
        email,
        password,
      });
      session = signUpData.session;
      authError = signUpError;
    }

    if (authError) {
      return NextResponse.json(
        { error: authError.message || 'authentication failed' },
        { status: 401 }
      );
    }

    // 以降は session を使用
    if (!session?.access_token || !session?.refresh_token || !session?.user?.id) {
      return NextResponse.json({ error: 'session is incomplete' }, { status: 500 });
    }

    const res = NextResponse.json({ ok: true }, { status: 200 });
    res.cookies.set('sb-access-token', session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
    res.cookies.set('sb-refresh-token', session.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    res.cookies.set('sb-user-id', session.user.id, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
