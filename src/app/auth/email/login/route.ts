import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

/**
 * POST /auth/email/login
 * メールアドレス+パスワードでログイン（未登録の場合は自動サインアップ）
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードは必須です' },
        { status: 400 }
      );
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase configuration is missing');
      return NextResponse.json(
        { error: 'サーバー設定エラーが発生しました' },
        { status: 500 }
      );
    }

    const res = NextResponse.json({ ok: true }, { status: 200 });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set({ name, value, ...options });
          });
        },
      },
    });

    // ログイン試行
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({ email, password });

    let session = loginData.session;

    // ログイン失敗 → 未登録ユーザーの場合はサインアップ試行
    if (loginError && loginError.message.includes('Invalid login credentials')) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        return NextResponse.json(
          { error: signUpError.message || '登録に失敗しました' },
          { status: 401 }
        );
      }

      session = signUpData.session;
    } else if (loginError) {
      return NextResponse.json(
        { error: loginError.message || 'ログインに失敗しました' },
        { status: 401 }
      );
    }

    if (!session?.access_token || !session?.refresh_token) {
      return NextResponse.json(
        { error: 'メール確認が必要です。受信トレイをご確認ください。' },
        { status: 401 }
      );
    }

    // Cookie設定
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookies.set('sb-access-token', session.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24時間
    });

    res.cookies.set('sb-refresh-token', session.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7日間
    });

    return res;
  } catch (error) {
    console.error('Email login error:', error);
    return NextResponse.json({ error: 'リクエストの処理に失敗しました' }, { status: 400 });
  }
}
