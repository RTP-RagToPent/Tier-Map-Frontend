import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// SSR 完全版: サーバー専用環境変数を使用
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const provider = url.searchParams.get('provider');
  const next = url.searchParams.get('next') || '/';

  if (!provider) {
    return NextResponse.redirect(new URL('/login?error=provider_required', url.origin));
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL('/login?error=config_missing', url.origin));
  }

  try {
    // 返却するレスポンスを最初に1つだけ生成（302）。以降はこの res のみに書き込む
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

    const allowed = new Set(['google', 'github']);
    if (!allowed.has(provider)) {
      return NextResponse.redirect(
        new URL(
          `/login?error=unsupported_provider&provider=${encodeURIComponent(String(provider))}`,
          url.origin
        )
      );
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'google' | 'github',
      options: {
        redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error || !data?.url) {
      console.error('OAuth init error:', error?.message);
      return NextResponse.redirect(new URL(`/login?error=oauth_init_failed`, url.origin));
    }

    // Cookie は既に res に書き込まれている。Location を設定して返却
    res.headers.set('Location', data.url);
    return res;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal Server Error';
    console.error('OAuth route fatal error:', message);
    return NextResponse.redirect(new URL('/login?error=internal_error', url.origin));
  }
}
