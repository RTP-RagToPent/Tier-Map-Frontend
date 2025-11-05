import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/search';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=auth_failed', url.origin));
  }

  const { data, error } = await supabaseServer.auth.exchangeCodeForSession(code);
  if (error || !data.session?.access_token || !data.session?.refresh_token || !data.session?.user?.id) {
    return NextResponse.redirect(new URL('/login?error=auth_failed', url.origin));
  }

  const cookieStore = cookies();
  cookieStore.set('sb-access-token', data.session.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
  cookieStore.set('sb-refresh-token', data.session.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  cookieStore.set('sb-user-id', data.session.user.id, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.redirect(new URL(next, url.origin));
}


