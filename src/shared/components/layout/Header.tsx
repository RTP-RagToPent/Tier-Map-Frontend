import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Tier Map
        </Link>
        <nav className="flex gap-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ホーム
          </Link>
          <Link href="/rallies" className="text-sm text-gray-600 hover:text-gray-900">
            ラリー一覧
          </Link>
        </nav>
      </div>
    </header>
  );
}
