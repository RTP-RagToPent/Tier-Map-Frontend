"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateTier, groupByTier, tierColors, TierSpot, TierRank } from "@/lib/tier";
import { analytics } from "@/lib/analytics";

// モックデータ
const mockEvaluatedSpots: TierSpot[] = [
  { id: "spot-1", name: "ラーメンA", rating: 5.0, tier: "S", memo: "最高に美味しい！" },
  { id: "spot-2", name: "ラーメンB", rating: 4.0, tier: "A" },
  { id: "spot-3", name: "ラーメンC", rating: 4.8, tier: "S" },
  { id: "spot-4", name: "ラーメンD", rating: 3.2, tier: "B" },
  { id: "spot-5", name: "ラーメンE", rating: 4.5, tier: "S" },
];

const mockRally = {
  id: "rally-1",
  name: "渋谷区 ラーメンラリー",
  region: "渋谷区",
  genre: "ラーメン",
};

export default function TierPage() {
  const params = useParams();
  const router = useRouter();
  const rallyId = params.id as string;

  // TODO: 実際のAPIからラリーと評価データを取得
  const rally = mockRally;
  const spots = mockEvaluatedSpots.map((spot) => ({
    ...spot,
    tier: calculateTier(spot.rating),
  }));

  const tierGroups = groupByTier(spots);
  const averageRating = (
    spots.reduce((sum, s) => sum + s.rating, 0) / spots.length
  ).toFixed(1);

  useEffect(() => {
    // ティア表示イベントを送信
    analytics.tierViewed(rallyId);
  }, [rallyId]);

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
            {tier === "S" && "Sランク - 最高！"}
            {tier === "A" && "Aランク - とても良い"}
            {tier === "B" && "Bランク - 普通"}
          </h2>
        </div>

        <div className="space-y-2">
          {spotsInTier.map((spot) => (
            <Card
              key={spot.id}
              className={`${colors.bg} ${colors.border} border-2`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className={`text-lg ${colors.text}`}>
                    {spot.name}
                  </CardTitle>
                  <span className="text-lg font-bold text-yellow-600">
                    {"★".repeat(Math.round(spot.rating))}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">
                    評価: {spot.rating.toFixed(1)} / 5.0
                  </p>
                  {spot.memo && (
                    <p className="text-sm text-gray-700">
                      メモ: {spot.memo}
                    </p>
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
        {(["S", "A", "B"] as TierRank[]).map((tier) => renderTierSection(tier))}
      </div>

      <div className="mt-8 space-y-4">
        <Button
          className="w-full"
          onClick={() => router.push(`/rally/${rallyId}/share`)}
        >
          共有カードを作成
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(`/rally/${rallyId}`)}
        >
          ラリー詳細に戻る
        </Button>
      </div>
    </div>
  );
}

