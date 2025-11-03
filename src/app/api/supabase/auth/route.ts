import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { serverEnv } from '@/config/server-env';

/**
 * POST /api/supabase/auth
 * Supabase認証APIのプロキシ
 */
export async function POST(req: NextRequest) {
  try {
    const { action, provider } = await req.json();

    if (!serverEnv.supabase.url || !serverEnv.supabase.anonKey) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }

    const supabase = createClient(serverEnv.supabase.url, serverEnv.supabase.anonKey);

    if (action === 'signInWithOAuth' && provider) {
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
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Supabase auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
