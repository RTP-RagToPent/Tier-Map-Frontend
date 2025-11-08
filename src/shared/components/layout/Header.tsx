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
    <header className="hidden md:block border-0">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="/" className="text-xl font-bold text-foreground">
          Tier Map
        </a>
        <nav className="flex items-center gap-6">
          <a href="/" className="text-sm text-foreground hover:text-primary transition-colors">
            ホーム
          </a>
          <a href="/rallies" className="text-sm text-foreground hover:text-primary transition-colors">
            ラリー一覧
          </a>
          {hasSession && (
            <form action="/auth/logout" method="POST">
              <button
                type="submit"
                className="neumorphism min-h-[44px] min-w-[44px] rounded-xl px-4 py-2 text-sm text-foreground hover:neumorphism-pressed transition-all"
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
