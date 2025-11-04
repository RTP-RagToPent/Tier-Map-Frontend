'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { Button } from '@shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';

import { useRallyDetail } from '../hooks/useRallyDetail';

export function RallyDetailView() {
  const params = useParams();
  const router = useRouter();
  const rallyId = params.id as string;

  const { rally, loading } = useRallyDetail(rallyId);

  if (loading || !rally) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-gray-600">読み込み中...</p>
      </div>
    );
  }

  const visitedCount = rally.spots.filter((s) => s.visited).length;
  const totalCount = rally.spots.length;
  const progress = (visitedCount / totalCount) * 100;
  const isCompleted = visitedCount === totalCount;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{rally.name}</CardTitle>
          <CardDescription>{rally.genre}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 進捗バー */}
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">
                進捗: {visitedCount}/{totalCount} 訪問済み
              </span>
              <span className="text-gray-600">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* スポット一覧 */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-700">スポット一覧</h3>
            <div className="space-y-3">
              {rally.spots
                .sort((a, b) => a.order_no - b.order_no)
                .map((spot, index) => (
                  <div
                    key={spot.id}
                    className={`flex items-center justify-between rounded-lg border p-4 ${
                      spot.visited ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          spot.visited ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {spot.visited ? '✓' : index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{spot.name}</p>
                        {spot.visited && spot.rating !== undefined && (
                          <div className="mt-1 flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={
                                  i < (spot.rating || 0) ? 'text-yellow-500' : 'text-gray-300'
                                }
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {!spot.visited && (
                      <Link href={`/rallies/${rallyId}/evaluate/${spot.id}`}>
                        <Button size="sm">評価する</Button>
                      </Link>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3">
            {isCompleted ? (
              <>
                <Button onClick={() => router.push(`/rallies/${rallyId}/tier`)} className="flex-1">
                  ティア表を見る
                </Button>
                <Button
                  onClick={() => router.push(`/rallies/${rallyId}/share`)}
                  variant="outline"
                  className="flex-1"
                >
                  シェアする
                </Button>
              </>
            ) : (
              <Button onClick={() => router.push('/rallies')} variant="outline" className="w-full">
                ラリー一覧に戻る
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
