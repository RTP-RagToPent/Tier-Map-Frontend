import { cookies } from 'next/headers';
import Link from 'next/link';

export async function Header() {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get('sb-access-token'));

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Tier Map
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ホーム
          </Link>
          <Link href="/rallies" className="text-sm text-gray-600 hover:text-gray-900">
            ラリー一覧
          </Link>
          {hasSession && (
            <form action="/auth/logout" method="POST">
              <button
                type="submit"
                className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
              >
                ログアウト
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
