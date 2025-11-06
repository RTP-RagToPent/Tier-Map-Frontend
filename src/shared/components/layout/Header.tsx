import { cookies } from 'next/headers';

import { MobileHeader } from './MobileHeader';

export async function Header() {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get('sb-access-token'));

  return (
    <>
      {/* モバイル用ヘッダー（640px未満） */}
      <div className="md:hidden">
        <MobileHeader hasSession={hasSession} />
      </div>
      {/* デスクトップ用ヘッダー（768px以上） */}
      <DesktopHeader hasSession={hasSession} />
    </>
  );
}

function DesktopHeader({ hasSession }: { hasSession: boolean }) {
  return (
    <header className="hidden border-b border-gray-200 bg-white md:block">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="/" className="text-xl font-bold text-gray-900">
          Tier Map
        </a>
        <nav className="flex items-center gap-6">
          <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ホーム
          </a>
          <a href="/rallies" className="text-sm text-gray-600 hover:text-gray-900">
            ラリー一覧
          </a>
          {hasSession && (
            <form action="/auth/logout" method="POST">
              <button
                type="submit"
                className="min-h-[44px] min-w-[44px] rounded bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
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
