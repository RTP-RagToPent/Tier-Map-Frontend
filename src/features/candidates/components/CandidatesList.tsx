'use client';

import { Button } from '@shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';

import { SpotMap } from './SpotMap';
import { useCandidates } from '../hooks/useCandidates';

export function CandidatesList() {
  const {
    region,
    genre,
    spots,
    loading,
    hoveredSpotId,
    setHoveredSpotId,
    selectedSpots,
    toggleSpot,
    handleCreateRally,
    isValid,
  } = useCandidates();

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
        <p className="mt-2 text-gray-600">候補から3〜5件選択してラリーを作成します</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* スポット一覧 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              候補スポット ({spots.length}件)
            </h2>
            <span className="text-sm text-gray-600">選択中: {selectedSpots.size}/5</span>
          </div>

          {spots.map((spot) => (
            <Card
              key={spot.id}
              className={`cursor-pointer transition-all ${
                selectedSpots.has(spot.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'hover:border-gray-400'
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
                      <span className="text-sm text-gray-600">⭐ {spot.rating}</span>
                    )}
                  </div>
                  {selectedSpots.has(spot.id) && (
                    <span className="text-sm font-semibold text-blue-600">選択中</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <Button onClick={handleCreateRally} disabled={!isValid} className="w-full">
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

