'use client';

import { useParams, useRouter } from 'next/navigation';

import { Button } from '@shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';

import { useRallyDetail } from '@features/rally/hooks/useRallyDetail';
import {
  TierRank,
  TierSpot,
  calculateTier,
  groupByTier,
  tierColors,
} from '@features/tier/lib/tier-calculator';

export default function TierPage() {
  const params = useParams();
  const router = useRouter();
  const rallyId = params.id as string;

  const { rally, loading, error } = useRallyDetail(rallyId);


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error || !rally) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-md text-center">
          <p className="text-red-600">ラリー情報の取得に失敗しました</p>
          <Button onClick={() => router.push('/rallies')} className="mt-4">
            ラリー一覧に戻る
          </Button>
        </div>
      </div>
    );
  }

  // 評価済みスポットのみを抽出してティア計算
  const evaluatedSpots = rally.spots.filter(
    (spot) => spot.rating !== undefined && spot.rating !== null
  );

  if (evaluatedSpots.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-md text-center">
          <p className="text-gray-600">まだ評価されたスポットがありません</p>
          <Button onClick={() => router.push(`/rallies/${rallyId}`)} className="mt-4">
            ラリー詳細に戻る
          </Button>
        </div>
      </div>
    );
  }

  const spots: TierSpot[] = evaluatedSpots.map((spot) => ({
    id: spot.id,
    name: spot.name,
    rating: spot.rating!,
    tier: calculateTier(spot.rating!),
    memo: undefined, // TODO: APIにmemoフィールドが追加されたら対応
  }));

  const tierGroups = groupByTier(spots);
  const averageRating = (spots.reduce((sum, s) => sum + s.rating, 0) / spots.length).toFixed(1);

  const renderTierSection = (tier: TierRank) => {
    const spotsInTier = tierGroups[tier];
    if (spotsInTier.length === 0) return null;

    const colors = tierColors[tier];

    return (
      <div key={tier} className="space-y-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${colors.badge} text-2xl font-bold shadow-md`}
          >
            {tier}
          </div>
          <h2 className={`text-2xl font-bold ${colors.text}`}>
            {tier === 'S' && 'Sランク - 最高！'}
            {tier === 'A' && 'Aランク - とても良い'}
            {tier === 'B' && 'Bランク - 普通'}
          </h2>
        </div>

        <div className="space-y-2">
          {spotsInTier.map((spot) => (
            <Card key={spot.id} className={`${colors.bg} ${colors.border} border-2`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className={`text-lg ${colors.text}`}>{spot.name}</CardTitle>
                  <span className="text-lg font-bold text-yellow-600">
                    {'★'.repeat(Math.round(spot.rating))}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">評価: {spot.rating.toFixed(1)} / 5.0</p>
                  {spot.memo && <p className="text-sm text-gray-700">メモ: {spot.memo}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">{rally.name}</h1>
        <p className="mt-2 text-lg text-gray-600">ティア表</p>
        <div className="mt-4 inline-block rounded-lg bg-blue-100 px-6 py-3">
          <p className="text-sm text-gray-700">平均評価</p>
          <p className="text-3xl font-bold text-blue-900">{averageRating}</p>
        </div>
      </div>

      <div className="space-y-8">
        {(['S', 'A', 'B'] as TierRank[]).map((tier) => renderTierSection(tier))}
      </div>

      <div className="mt-8 space-y-4">
        <Button className="w-full" onClick={() => router.push(`/rallies/${rallyId}/share`)}>
          共有カードを作成
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(`/rallies/${rallyId}`)}
        >
          ラリー詳細に戻る
        </Button>
      </div>
    </div>
  );
}
