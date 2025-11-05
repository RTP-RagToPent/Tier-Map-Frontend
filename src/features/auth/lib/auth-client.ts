/**
 * 認証用APIクライアント（クライアント側でSupabase認証を実行）
 */

import { supabase } from '@shared/lib/supabase';

export interface LoginResult {
  success: boolean;
  error?: string;
}

/**
 * JWTをRoute Handlerに送信してCookieに保存
 */
async function saveSessionToCookie(accessToken: string, refreshToken: string, userId: string) {
  const response = await fetch('/auth/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accessToken,
      refreshToken,
      userId,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'セッションの保存に失敗しました');
  }
}

/**
 * メールアドレスとパスワードでログイン（新規登録も兼ねる）
 * クライアント側でSupabase認証を実行し、JWTをCookieに保存
 */
export async function loginWithEmail(email: string, password: string): Promise<LoginResult> {
  try {
    // まずログインを試行
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    let session = loginData.session;
    let error = loginError;

    // ログイン失敗の場合、新規登録を試行
    if (error && error.message.includes('Invalid login credentials')) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      session = signUpData.session;
      error = signUpError;
    }

    if (error) {
      return {
        success: false,
        error: error.message || '認証に失敗しました',
      };
    }

    if (!session?.access_token || !session?.refresh_token || !session?.user?.id) {
      return {
        success: false,
        error: 'セッションの作成に失敗しました',
      };
    }

    // JWTをCookieに保存
    await saveSessionToCookie(session.access_token, session.refresh_token, session.user.id);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ログインに失敗しました',
    };
  }
}

/**
 * Google OAuthでログイン
 * クライアント側でSupabase認証を実行し、JWTをCookieに保存
 */
export async function loginWithGoogle(): Promise<LoginResult> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Googleログインに失敗しました',
      };
    }

    // OAuthの場合はリダイレクトされるため、ここではURLを返す
    if (data.url) {
      window.location.href = data.url;
      return {
        success: true,
      };
    }

    return {
      success: false,
      error: '認証URLの取得に失敗しました',
    };
  } catch (error) {
    console.error('Google login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Googleログインに失敗しました',
    };
  }
}

/**
 * GitHub OAuthでログイン
 * クライアント側でSupabase認証を実行し、JWTをCookieに保存
 */
export async function loginWithGithub(): Promise<LoginResult> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'GitHubログインに失敗しました',
      };
    }

    // OAuthの場合はリダイレクトされるため、ここではURLを返す
    if (data.url) {
      window.location.href = data.url;
      return {
        success: true,
      };
    }

    return {
      success: false,
      error: '認証URLの取得に失敗しました',
    };
  } catch (error) {
    console.error('GitHub login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'GitHubログインに失敗しました',
    };
  }
}
