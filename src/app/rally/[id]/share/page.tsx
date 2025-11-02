"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card";
import { calculateTier, TierRank, tierColors } from "@features/tier/lib/tier-calculator";

// モックデータ
const mockRally = {
  id: "rally-1",
  name: "渋谷区 ラーメンラリー",
  region: "渋谷区",
  genre: "ラーメン",
};

const mockEvaluatedSpots = [
  { id: "spot-1", name: "ラーメンA", rating: 5.0 },
  { id: "spot-2", name: "ラーメンB", rating: 4.0 },
  { id: "spot-3", name: "ラーメンC", rating: 4.8 },
  { id: "spot-4", name: "ラーメンD", rating: 3.2 },
  { id: "spot-5", name: "ラーメンE", rating: 4.5 },
];

export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const rallyId = params.id as string;

  const [copied, setCopied] = useState(false);

  // TODO: 実際のAPIからラリーと評価データを取得
  const rally = mockRally;
  const spots = mockEvaluatedSpots.map((spot) => ({
    ...spot,
    tier: calculateTier(spot.rating),
  }));

  const averageRating = (
    spots.reduce((sum, s) => sum + s.rating, 0) / spots.length
  ).toFixed(1);

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/rally/${rallyId}/tier`;
  const shareText = `${rally.name}を完走しました！\n平均評価: ${averageRating}/5.0\n\n#TierMap`;

  const handleCopyLink = async () => {
    const { analytics } = await import("@shared/lib/analytics");
    await analytics.shareClicked(rallyId, "link");
    
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLine = async () => {
    const { analytics } = await import("@shared/lib/analytics");
    await analytics.shareClicked(rallyId, "line");
    
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(
      `${shareText}\n${shareUrl}`
    )}`;
    window.open(lineUrl, "_blank");
  };

  const handleShareTwitter = async () => {
    const { analytics } = await import("@shared/lib/analytics");
    await analytics.shareClicked(rallyId, "twitter");
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank");
  };

  const handleDownloadImage = () => {
    // TODO: 実際のOGP画像生成APIを呼び出してダウンロード
    alert("画像生成機能は実装予定です（バックエンドAPI連携が必要）");
  };

  // ティア別にグループ化
  const tierGroups: Record<TierRank, typeof spots> = {
    S: spots.filter((s) => s.tier === "S"),
    A: spots.filter((s) => s.tier === "A"),
    B: spots.filter((s) => s.tier === "B"),
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">共有カード</h1>
        <p className="mt-2 text-gray-600">
          ラリーの結果を共有しましょう
        </p>
      </div>

      {/* プレビューカード */}
      <Card className="mb-8 overflow-hidden border-4 border-blue-500">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-6 py-8 text-white">
          <h2 className="text-2xl font-bold">{rally.name}</h2>
          <p className="mt-1 text-blue-100">
            {rally.region} - {rally.genre}
          </p>
          <div className="mt-4 inline-block rounded-lg bg-white/20 px-4 py-2 backdrop-blur-sm">
            <p className="text-sm">平均評価</p>
            <p className="text-3xl font-bold">{averageRating} ⭐</p>
          </div>
        </div>

        <CardContent className="space-y-4 py-6">
          {(["S", "A", "B"] as TierRank[]).map((tier) => {
            const spotsInTier = tierGroups[tier];
            if (spotsInTier.length === 0) return null;

            const colors = tierColors[tier];

            return (
              <div key={tier} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded ${colors.badge} text-sm font-bold`}
                  >
                    {tier}
                  </div>
                  <span className="font-semibold text-gray-700">
                    {spotsInTier.length}件
                  </span>
                </div>
                <div className="ml-10 space-y-1">
                  {spotsInTier.map((spot) => (
                    <p key={spot.id} className="text-sm text-gray-600">
                      • {spot.name} ({spot.rating.toFixed(1)})
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* OGP画像ダウンロード */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>画像をダウンロード</CardTitle>
          <CardDescription>
            SNSでシェアしやすい画像をダウンロードできます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDownloadImage} variant="outline" className="w-full">
            📥 画像をダウンロード
          </Button>
        </CardContent>
      </Card>

      {/* 共有オプション */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>SNSで共有</CardTitle>
          <CardDescription>
            友達に結果をシェアしましょう
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleShareLine}
            className="w-full bg-[#00B900] hover:bg-[#00A000]"
          >
            <span className="mr-2">📱</span>
            LINEで共有
          </Button>
          <Button
            onClick={handleShareTwitter}
            className="w-full bg-[#1DA1F2] hover:bg-[#1A8CD8]"
          >
            <span className="mr-2">🐦</span>
            Xで共有
          </Button>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full"
          >
            {copied ? "✅ コピーしました" : "🔗 リンクをコピー"}
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push(`/rally/${rallyId}/tier`)}
        >
          ティア表に戻る
        </Button>
        <Button
          className="flex-1"
          onClick={() => router.push("/rallies")}
        >
          ラリー一覧へ
        </Button>
      </div>
    </div>
  );
}

