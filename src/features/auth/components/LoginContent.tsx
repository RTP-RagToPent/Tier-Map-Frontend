'use client';

import GithubButton from '@/features/auth/components/GithubButton';
import GoogleButton from '@/features/auth/components/GoogleButton';
import { useLogin } from '@/features/auth/hooks/useLogin';

export function LoginContent() {
  const { email, setEmail, password, setPassword, error, loading, handleSubmit } = useLogin();

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      {/* タイトル */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">ログイン</h2>
      </div>

      {/* カード本体 */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-lg bg-white px-6 py-8 shadow sm:px-10">
          {/* エラーメッセージ */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Email/Password フォーム */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            {/* Sign In ボタン */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'ログイン中...' : 'Sign in'}
              </button>
            </div>

            {/* 新規登録の説明 */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                初めての方は、メールアドレスとパスワードを入力して
                <br />
                Sign in ボタンを押すと自動的にアカウントが作成されます
              </p>
            </div>
          </form>

          {/* 区切り線 + テキスト */}
          <div className="mt-6 flex items-center">
            <div className="flex-grow border-t border-gray-300" />
            <span className="mx-4 text-sm text-gray-500">Or continue with</span>
            <div className="flex-grow border-t border-gray-300" />
          </div>

          {/* SNS ログインボタン */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <GoogleButton className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50" />
            <GithubButton className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50" />
          </div>
        </div>
      </div>
    </div>
  );
}
