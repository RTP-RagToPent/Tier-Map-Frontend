"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card";

// モックデータ
const mockRally = {
  id: "rally-1",
  name: "渋谷区 ラーメンラリー",
  region: "渋谷区",
  genre: "ラーメン",
  status: "in_progress" as const,
  createdAt: "2025-10-30",
  spots: [
    { id: "spot-1", name: "ラーメンA", address: "渋谷区 1-1-1", rating: 4.5, visited: true, userRating: 5 },
    { id: "spot-2", name: "ラーメンB", address: "渋谷区 2-2-2", rating: 4.2, visited: true, userRating: 4 },
    { id: "spot-3", name: "ラーメンC", address: "渋谷区 3-3-3", rating: 4.7, visited: false },
    { id: "spot-4", name: "ラーメンD", address: "渋谷区 4-4-4", rating: 4.0, visited: false },
    { id: "spot-5", name: "ラーメンE", address: "渋谷区 5-5-5", rating: 4.3, visited: false },
  ],
};

export default function RallyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rallyId = params.id as string;

  // TODO: 実際のAPIからラリーデータを取得
  const rally = mockRally;

  const completedCount = rally.spots.filter((s) => s.visited).length;
  const totalCount = rally.spots.length;
  const isCompleted = completedCount === totalCount;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{rally.name}</h1>
        <p className="mt-2 text-gray-600">
          {rally.region} - {rally.genre}
        </p>
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {rally.spots.map((spot, index) => (
          <Card
            key={spot.id}
            className={spot.visited ? "border-green-500 bg-green-50" : ""}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {index + 1}. {spot.name}
                  </CardTitle>
                  <CardDescription>{spot.address}</CardDescription>
                </div>
                {spot.visited && (
                  <span className="text-2xl">✅</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">⭐ {spot.rating}</span>
                  {spot.visited && spot.userRating && (
                    <span className="text-sm font-semibold text-blue-600">
                      あなたの評価: {"★".repeat(spot.userRating)}
                    </span>
                  )}
                </div>
                {!spot.visited && (
                  <Button
                    size="sm"
                    onClick={() => router.push(`/rally/${rallyId}/evaluate/${spot.id}`)}
                  >
                    評価する
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isCompleted && (
        <div className="mt-8 space-y-4">
          <Button
            className="w-full"
            onClick={() => router.push(`/rally/${rallyId}/tier`)}
          >
            ティア表を見る
          </Button>
        </div>
      )}
    </div>
  );
}

