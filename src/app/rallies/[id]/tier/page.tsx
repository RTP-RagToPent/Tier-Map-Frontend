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
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.badge} text-xl font-bold shadow-md sm:h-12 sm:w-12 sm:text-2xl`}
          >
            {tier}
          </div>
          <h2 className={`text-lg font-bold ${colors.text} sm:text-2xl`}>
            {tier === 'S' && 'Sランク - 最高！'}
            {tier === 'A' && 'Aランク - とても良い'}
            {tier === 'B' && 'Bランク - 普通'}
          </h2>
        </div>

        <div className="space-y-2">
          {spotsInTier.map((spot) => (
            <Card key={spot.id} className={`${colors.bg} ${colors.border} border-2`}>
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className={`text-base ${colors.text} sm:text-lg`}>
                    {spot.name}
                  </CardTitle>
                  <span className="text-base font-bold text-yellow-600 sm:text-lg">
                    {'★'.repeat(Math.round(spot.rating))}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  <p className="text-xs font-semibold sm:text-sm">
                    評価: {spot.rating.toFixed(1)} / 5.0
                  </p>
                  {spot.memo && (
                    <p className="text-xs text-gray-700 sm:text-sm">メモ: {spot.memo}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <div className="mb-6 text-center sm:mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-4xl">{rally.name}</h1>
        <p className="mt-2 text-base text-gray-600 sm:text-lg">ティア表</p>
        <div className="mt-4 inline-block rounded-lg bg-blue-100 px-4 py-2 sm:px-6 sm:py-3">
          <p className="text-xs text-gray-700 sm:text-sm">平均評価</p>
          <p className="text-2xl font-bold text-blue-900 sm:text-3xl">{averageRating}</p>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {(['S', 'A', 'B'] as TierRank[]).map((tier) => renderTierSection(tier))}
      </div>

      <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
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
