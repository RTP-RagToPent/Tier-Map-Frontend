'use client';

import { useCallback, useState } from 'react';

import { loginWithGithub, loginWithGoogle } from '@/features/auth/lib/auth-client';

export function useOAuth() {
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    const result = await loginWithGoogle();
    if (!result.success) setLoading(false);
  }, []);

  const signInWithGithub = useCallback(async () => {
    setLoading(true);
    const result = await loginWithGithub();
    if (!result.success) setLoading(false);
  }, []);

  return { loading, signInWithGoogle, signInWithGithub };
}
