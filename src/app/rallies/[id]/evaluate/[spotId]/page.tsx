'use client';

import { useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { EvaluationForm } from '@features/evaluation/components/EvaluationForm';
import { useRallyDetail, type RallyDetail } from '@features/rally/hooks/useRallyDetail';

interface PlaceDetails {
  address?: string;
  photoUrl?: string;
  rating?: number;
}

export default function EvaluateSpotPage() {
  const params = useParams();
  const router = useRouter();
  const rallyId = params.id as string;
  const spotId = params.spotId as string;

  const { rally, loading, error } = useRallyDetail(rallyId);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // スポット情報を計算（早期リターンの前に）
  const orderedSpots: RallyDetail['spots'] | null = rally
    ? rally.spots.slice().sort((a, b) => a.order_no - b.order_no)
    : null;
  const currentIndex = orderedSpots?.findIndex((spot) => spot.id === spotId) ?? -1;
  const spot = orderedSpots?.[currentIndex];

  // スポットの詳細情報を取得（早期リターンの前に）
  useEffect(() => {
    if (!spot?.id) return;

    const fetchPlaceDetails = async () => {
      setDetailsLoading(true);
      try {
        const response = await fetch(`/api/spots?place_id=${encodeURIComponent(spot.id)}`);
        if (response.ok) {
          const data = await response.json();
          setPlaceDetails(data);
        } else {
          console.warn('Failed to fetch place details:', response.status);
        }
      } catch (err) {
        console.error('Error fetching place details:', err);
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [spot?.id]);

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
          <button
            onClick={() => router.push('/rallies')}
            className="mt-4 text-blue-600 hover:underline"
          >
            ラリー一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  if (!spot) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-md text-center">
          <p className="text-red-600">スポットが見つかりません</p>
          <button
            onClick={() => router.push(`/rallies/${rallyId}`)}
            className="mt-4 text-blue-600 hover:underline"
          >
            ラリー詳細に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <EvaluationForm
      spot={{
        id: spot.id,
        name: spot.name,
        address: placeDetails?.address,
        thumbnailUrl: placeDetails?.photoUrl,
      }}
      onPrev={
        currentIndex > 0
          ? () => router.push(`/rallies/${rallyId}/evaluate/${orderedSpots[currentIndex - 1].id}`)
          : undefined
      }
      onNext={
        currentIndex < orderedSpots.length - 1
          ? () => router.push(`/rallies/${rallyId}/evaluate/${orderedSpots[currentIndex + 1].id}`)
          : undefined
      }
      onSkip={() => router.push(`/rallies/${rallyId}`)}
    />
  );
}
