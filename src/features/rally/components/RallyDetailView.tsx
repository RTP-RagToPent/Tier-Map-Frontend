'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { ProgressRing } from '@shared/components/progress/ProgressRing';
import { RatingStars } from '@shared/components/rating/RatingStars';
import { Badge } from '@shared/components/ui/badge';
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
        <p className="text-center text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  const orderedSpots = rally.spots.slice().sort((a, b) => a.order_no - b.order_no);
  const evaluatedCount = orderedSpots.filter(
    (spot) => spot.rating !== undefined && spot.rating !== null
  ).length;
  const totalCount = orderedSpots.length;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card className="overflow-hidden">
        <CardHeader className="gap-3 bg-gradient-to-r from-blue-50 to-blue-100/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge variant="outline" className="mb-2">
                {rally.genre}
              </Badge>
              <CardTitle className="text-3xl font-bold text-foreground">{rally.name}</CardTitle>
              <CardDescription className="mt-2 text-sm text-muted-foreground">
                選択したスポットを巡ってティア表を作成しましょう
              </CardDescription>
            </div>
            <ProgressRing value={evaluatedCount} max={totalCount} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-3">
            {orderedSpots.map((spot, index) => {
              const isEvaluated = spot.rating !== undefined && spot.rating !== null;
              return (
                <div
                  key={spot.id}
                  className="flex flex-col gap-4 rounded-2xl border border-muted bg-background p-4 shadow-sm transition hover:border-primary/60 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-1 items-start gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${isEvaluated ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}
                    >
                      {isEvaluated ? '済' : index + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-base font-semibold text-foreground">{spot.name}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant={isEvaluated ? 'default' : 'outline'}>
                          {isEvaluated ? '評価済み' : '未評価'}
                        </Badge>
                        <span>ID: {spot.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
                    {isEvaluated && spot.rating !== undefined ? (
                      <RatingStars value={spot.rating} readonly size="sm" />
                    ) : (
                      <Link href={`/rallies/${rallyId}/evaluate/${spot.id}`} className="sm:w-40">
                        <Button className="w-full">評価へ</Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1"
              onClick={() => router.push(`/rallies/${rallyId}/tier`)}
              disabled={evaluatedCount === 0}
            >
              ティア表を確認
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push(`/rallies/${rallyId}/share`)}
            >
              共有ページへ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
