"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SpotMap } from "@/components/SpotMap";
import { searchSpots } from "@/lib/google-places";
import { Spot } from "@/types/spot";

function CandidatesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const region = searchParams.get("region") || "";
  const genre = searchParams.get("genre") || "";

  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSpotId, setHoveredSpotId] = useState<string | null>(null);
  const [selectedSpots, setSelectedSpots] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (region && genre) {
      searchSpots(region, genre)
        .then((data) => {
          setSpots(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [region, genre]);

  const toggleSpot = (spotId: string) => {
    const newSelected = new Set(selectedSpots);
    if (newSelected.has(spotId)) {
      newSelected.delete(spotId);
    } else {
      if (newSelected.size >= 5) {
        alert("最大5件まで選択できます");
        return;
      }
      newSelected.add(spotId);
    }
    setSelectedSpots(newSelected);
  };

  const handleCreateRally = () => {
    if (selectedSpots.size < 3) {
      alert("3件以上選択してください");
      return;
    }
    
    const selectedSpotIds = Array.from(selectedSpots).join(",");
    router.push(`/rally/create?region=${encodeURIComponent(region)}&genre=${encodeURIComponent(genre)}&spots=${selectedSpotIds}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {region} - {genre}
        </h1>
        <p className="mt-2 text-gray-600">
          候補から3〜5件選択してラリーを作成します
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* スポット一覧 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              候補スポット ({spots.length}件)
            </h2>
            <span className="text-sm text-gray-600">
              選択中: {selectedSpots.size}/5
            </span>
          </div>

          {spots.map((spot) => (
            <Card
              key={spot.id}
              className={`cursor-pointer transition-all ${
                selectedSpots.has(spot.id)
                  ? "border-blue-500 bg-blue-50"
                  : "hover:border-gray-400"
              }`}
              onMouseEnter={() => setHoveredSpotId(spot.id)}
              onMouseLeave={() => setHoveredSpotId(null)}
              onClick={() => toggleSpot(spot.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{spot.name}</CardTitle>
                <CardDescription>{spot.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {spot.rating && (
                      <span className="text-sm text-gray-600">
                        ⭐ {spot.rating}
                      </span>
                    )}
                  </div>
                  {selectedSpots.has(spot.id) && (
                    <span className="text-sm font-semibold text-blue-600">
                      選択中
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            onClick={handleCreateRally}
            disabled={selectedSpots.size < 3 || selectedSpots.size > 5}
            className="w-full"
          >
            選択したスポットでラリーを作成 ({selectedSpots.size}件)
          </Button>
        </div>

        {/* 地図 */}
        <div className="lg:sticky lg:top-4 lg:h-[600px]">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>地図</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-5rem)]">
              <SpotMap spots={spots} hoveredSpotId={hoveredSpotId} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-gray-600">読み込み中...</p>
      </div>
    }>
      <CandidatesContent />
    </Suspense>
  );
}

