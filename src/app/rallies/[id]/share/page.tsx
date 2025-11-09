'use client';

import { useParams } from 'next/navigation';

import { SpotCard } from '@shared/components/spot/SpotCard';
import { TierBoard } from '@shared/components/tier/TierBoard';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import type { UISpot } from '@shared/types/ui';

import { useRallyShareView } from '@features/rally/hooks/useRallyShareView';

export default function SharePage() {
  const params = useParams();
  const rallyId = params.id as string;

  const { shareData, tiers, loading, error } = useRallyShareView(rallyId);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (error || !shareData || !tiers) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="mx-auto max-w-md text-center">
          <CardHeader>
            <CardTitle>共有データを表示できませんでした</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error || 'データの取得に失敗しました'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { rally, averageRating } = shareData;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{rally.name}</h1>
          <p className="text-sm text-muted-foreground">ティア表</p>
        </div>
        <div className="rounded-xl bg-primary/10 px-4 py-2 text-sm text-primary">
          平均評価: <span className="text-xl font-semibold">{averageRating.toFixed(1)}</span>
        </div>
      </div>

      <div className="p-6">
        <TierBoard tiers={tiers} />
      </div>

      {/* スポット一覧 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>評価済みスポット</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shareData.spots
              .sort((a, b) => a.order_no - b.order_no)
              .map((spot) => {
                const uiSpot: UISpot = {
                  id: spot.id,
                  name: spot.name,
                  address: spot.address || '',
                  rating: spot.rating,
                  lat: 0,
                  lng: 0,
                  thumbnailUrl: spot.photoUrl,
                  memo: spot.memo,
                };
                return (
                  <div key={spot.id} className="relative">
                    <div className="absolute -left-2 -top-2 z-10 rounded-full bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
                      {spot.tier}
                    </div>
                    <SpotCard spot={uiSpot} showMeta />
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
