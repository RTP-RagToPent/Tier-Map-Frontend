import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { serverEnv } from '@/config/server-env';

/**
 * POST /api/supabase/session
 * Supabaseセッション管理APIのプロキシ
 */
export async function POST(req: NextRequest) {
  try {
    const { action, accessToken, refreshToken } = await req.json();

    if (!serverEnv.supabase.url || !serverEnv.supabase.anonKey) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }

    const supabase = createClient(serverEnv.supabase.url, serverEnv.supabase.anonKey);

    if (action === 'setSession' && accessToken && refreshToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        session: data.session,
        user: data.user,
      });
    }

    if (action === 'getSession') {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        session: data.session,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Supabase session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
