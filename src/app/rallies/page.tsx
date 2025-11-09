'use client';

import Link from 'next/link';

import { Button } from '@shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';

import { useRallies } from '@features/rally/hooks/useRallies';

const statusLabel = {
  draft: '下書き',
  in_progress: '進行中',
  completed: '完了',
};

export default function RalliesPage() {
  const { rallies, loading } = useRallies();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">ラリー一覧</h1>
        <Link href="/search" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">新しいラリーを作成</Button>
        </Link>
      </div>

      <div>
        {rallies.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600">まだラリーがありません</p>
            <p className="mt-2 text-sm text-gray-500">
              新しいラリーを作成してスポット巡りを始めましょう！
            </p>
            <Link href="/search" className="mt-4 inline-block">
              <Button>ラリーを作成</Button>
            </Link>
          </div>
        ) : (
          rallies.map((rally) => (
            <Link key={rally.id} href={`/rallies/${rally.id}`} className="block mb-8 last:mb-0">
              <Card className="transition-all hover:border-gray-400 hover:shadow-md active:shadow-sm">
                <CardHeader className="p-3 sm:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg sm:text-xl">{rally.name}</CardTitle>
                      <CardDescription className="mt-1 text-xs sm:text-sm">
                        {rally.genre}
                      </CardDescription>
                    </div>
                    {rally.status && (
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium sm:px-3 ${
                          rally.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : rally.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {statusLabel[rally.status]}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                  <div className="flex flex-col items-start justify-between gap-1 text-xs text-gray-600 sm:flex-row sm:items-center sm:text-sm">
                    <span>{rally.createdAt && `作成日: ${rally.createdAt}`}</span>
                    <span className="font-medium text-blue-600">詳細を見る →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
