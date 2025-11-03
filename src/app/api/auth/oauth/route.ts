import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { serverEnv } from '@/config/server-env';

/**
 * POST /api/auth/oauth
 * OAuth認証（Google、GitHub）の開始
 */
export async function POST(req: NextRequest) {
  try {
    const { provider } = await req.json();

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
    }

    if (!serverEnv.supabase.url || !serverEnv.supabase.anonKey) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }

    const supabase = createClient(serverEnv.supabase.url, serverEnv.supabase.anonKey);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${req.nextUrl.origin}/api/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
