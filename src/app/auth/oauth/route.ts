import { NextRequest, NextResponse } from 'next/server';

import { supabaseServer } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const provider = url.searchParams.get('provider');
  const next = url.searchParams.get('next') || '/search';

  if (!provider) {
    return NextResponse.json({ error: 'provider is required' }, { status: 400 });
  }

  const { data, error } = await supabaseServer.auth.signInWithOAuth({
    provider: provider as 'google' | 'github',
    options: {
      redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data?.url) {
    return NextResponse.json(
      { error: error?.message ?? 'Failed to initialize OAuth' },
      { status: 500 }
    );
  }

  return NextResponse.redirect(data.url);
}
