import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=auth_failed', url.origin));
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL('/login?error=config_missing', url.origin));
  }

  // 返却レスポンス（最終リダイレクト）を先に生成し、Cookieアダプタは常にこれに書き込む
  const res = new NextResponse(null, { status: 302 });

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

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (
    error ||
    !data.session?.access_token ||
    !data.session?.refresh_token ||
    !data.session?.user?.id
  ) {
    return NextResponse.redirect(new URL('/login?error=auth_failed', url.origin));
  }

  // アプリ用 HttpOnly Cookie（sb-*）もここで設定
  res.cookies.set('sb-access-token', data.session.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
  res.cookies.set('sb-refresh-token', data.session.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  // リダイレクト先を設定して返却
  res.headers.set('Location', new URL(next, url.origin).toString());
  return res;
}
