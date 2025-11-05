/**
 * 認証用APIクライアント（サーバー側Routeを呼び出し）
 */

// クライアントでSupabaseキーは保持しない方針

export interface LoginResult {
  success: boolean;
  error?: string;
}

/**
 * メールアドレスとパスワードでログイン（新規登録も兼ねる）
 * クライアント側でSupabase認証を実行し、JWTをCookieに保存
 */
export async function loginWithEmail(email: string, password: string): Promise<LoginResult> {
  try {
    const res = await fetch('/auth/email/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.error || 'ログインに失敗しました' };
    }
    return { success: true };
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
    const next = '/';
    window.location.href = `/auth/oauth?provider=google&next=${encodeURIComponent(next)}`;
    return { success: true };
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
    const next = '/';
    window.location.href = `/auth/oauth?provider=github&next=${encodeURIComponent(next)}`;
    return { success: true };
  } catch (error) {
    console.error('GitHub login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'GitHubログインに失敗しました',
    };
  }
}
