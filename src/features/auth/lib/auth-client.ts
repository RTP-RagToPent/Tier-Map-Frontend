/**
 * 認証用APIクライアント
 */

export interface LoginResult {
  success: boolean;
  error?: string;
}

/**
 * メールアドレスとパスワードでログイン（新規登録も兼ねる）
 * Supabaseが自動的に新規ユーザーを作成します
 */
export async function loginWithEmail(email: string, password: string): Promise<LoginResult> {
  try {
    const response = await fetch('/api/auth/email/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'ログインに失敗しました',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'ネットワークエラーが発生しました',
    };
  }
}
