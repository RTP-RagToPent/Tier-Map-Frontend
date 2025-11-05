'use client';

import { useEffect } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { supabaseAuth } from '@shared/lib/supabase-auth';

export default function RedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handle = async () => {
      const code = searchParams.get('code');
      const next = searchParams.get('next') || '/search';

      if (!code) {
        router.replace('/login?error=auth_failed');
        return;
      }

      const { data, error } = await supabaseAuth.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('Auth redirect error:', error);
        router.replace('/login?error=auth_failed');
        return;
      }

      if (data.session?.refresh_token && data.session?.user?.id) {
        const res = await fetch('/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            userId: data.session.user.id,
          }),
        });
        if (res.ok) {
          router.replace(next);
        } else {
          router.replace('/login?error=auth_failed');
        }
      } else {
        router.replace('/login?error=auth_failed');
      }
    };
    handle();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">認証中...</p>
    </div>
  );
}
