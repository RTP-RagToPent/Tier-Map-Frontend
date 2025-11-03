'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@shared/components/ui/button';

export function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/search" className="text-xl font-bold text-gray-900">
          Tier Map
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/search" className="text-sm text-gray-600 hover:text-gray-900">
            検索
          </Link>
          <Link href="/rallies" className="text-sm text-gray-600 hover:text-gray-900">
            ラリー一覧
          </Link>
          <Button onClick={handleLogout} variant="outline" size="sm">
            ログアウト
          </Button>
        </nav>
      </div>
    </header>
  );
}
