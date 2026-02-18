'use client';

import { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { loginWithEmail } from '@/features/auth/lib/auth-client';

export function useLogin() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        auth_failed: '認証に失敗しました。もう一度お試しください。',
        provider_required: 'ログイン方法を選択してください。',
        config_missing: 'サーバー設定に問題があります。管理者にお問い合わせください。',
        oauth_init_failed: 'OAuth認証の開始に失敗しました。もう一度お試しください。',
        unsupported_provider: 'サポートされていないログイン方法です。',
        internal_error: 'サーバーエラーが発生しました。しばらくしてからお試しください。',
      };
      setError(errorMessages[errorParam] || '予期しないエラーが発生しました。');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await loginWithEmail(email, password);

    if (result.success) {
      router.replace('/search');
    } else {
      setError(result.error || 'ログインに失敗しました');
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  };
}
