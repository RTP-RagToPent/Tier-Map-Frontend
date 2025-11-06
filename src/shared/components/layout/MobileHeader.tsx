'use client';

import { useState } from 'react';

import Link from 'next/link';

interface MobileHeaderProps {
  hasSession: boolean;
}

export function MobileHeader({ hasSession }: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Tier Map
        </Link>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          aria-label="メニューを開く"
          aria-expanded={isOpen}
          disabled={isOpen}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* モバイルメニュー */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <nav
            className="fixed right-0 top-0 z-50 h-screen w-64 bg-white shadow-lg"
            aria-label="メインナビゲーション"
          >
            {/* ヘッダー部分 */}
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="メニューを閉じる"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* メニュー項目 */}
            <div
              className="flex flex-col overflow-y-auto p-4"
              style={{ height: 'calc(100vh - 4rem)' }}
            >
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="rounded-md px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200"
              >
                ホーム
              </Link>
              <Link
                href="/rallies"
                onClick={() => setIsOpen(false)}
                className="rounded-md px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200"
              >
                ラリー一覧
              </Link>
              {hasSession && (
                <form action="/auth/logout" method="POST" className="mt-4">
                  <button
                    type="submit"
                    className="w-full rounded-md bg-gray-100 px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                  >
                    ログアウト
                  </button>
                </form>
              )}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
