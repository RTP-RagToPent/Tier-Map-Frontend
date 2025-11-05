'use client';

import { useEffect } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { supabase } from '@shared/lib/supabase';

/**
 * OAuth callback処理
 * クライアント側でSupabase認証を完了し、JWTをCookieに保存
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');

      if (code) {
        try {
          // コードをセッションに交換
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error('Auth callback error:', error);
            router.replace('/login?error=auth_failed');
            return;
          }

          // refresh_tokenとuser_idが存在するかチェック
          if (data.session?.refresh_token && data.session?.user?.id) {
            // JWTをCookieに保存
            const response = await fetch('/auth/session', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                userId: data.session.user.id,
              }),
            });

            if (response.ok) {
              router.replace('/search');
            } else {
              console.error('Failed to save session to cookie');
              router.replace('/login?error=auth_failed');
            }
          } else {
            console.error('Session data is incomplete');
            router.replace('/login?error=auth_failed');
          }
        } catch (error) {
          console.error('Callback error:', error);
          router.replace('/login?error=auth_failed');
        }
      } else {
        router.replace('/login?error=auth_failed');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">認証中...</p>
    </div>
  );
}

