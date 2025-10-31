"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// モックスポットデータ
const mockSpot = {
  id: "spot-3",
  name: "ラーメンC",
  address: "渋谷区 3-3-3",
  rating: 4.7,
};

export default function EvaluateSpotPage() {
  const params = useParams();
  const router = useRouter();
  const rallyId = params.id as string;
  const spotId = params.spotId as string;

  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [memo, setMemo] = useState("");

  // TODO: 実際のAPIからスポットデータを取得
  const spot = mockSpot;

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("評価を選択してください");
      return;
    }

    // TODO: 実際のAPIへ評価を送信
    const evaluation = {
      spotId,
      rating,
      memo,
      visitedAt: new Date().toISOString(),
    };

    console.log("Evaluation saved:", evaluation);

    // アナリティクスイベント送信
    const { analytics } = await import("@/lib/analytics");
    await analytics.spotEvaluated(rallyId, spotId, rating);

    alert("評価を保存しました！");
    router.push(`/rally/${rallyId}`);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{spot.name}</CardTitle>
          <CardDescription>{spot.address}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 星評価 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              評価（必須）
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="text-4xl transition-all hover:scale-110 focus:outline-none"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  {value <= (hoveredRating || rating) ? (
                    <span className="text-yellow-400">★</span>
                  ) : (
                    <span className="text-gray-300">☆</span>
                  )}
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                {rating === 5 && "最高です！"}
                {rating === 4 && "とても良い"}
                {rating === 3 && "良い"}
                {rating === 2 && "普通"}
                {rating === 1 && "イマイチ"}
              </p>
            )}
          </div>

          {/* メモ */}
          <div>
            <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-2">
              メモ（任意）
            </label>
            <textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="感想やメモを記入してください"
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* アクションボタン */}
          <div className="flex gap-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={rating === 0}
            >
              評価を保存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

