'use client';

import { useEffect, useState } from 'react';

import type { Rally as FnRally, Rating as FnRating, Spot as FnSpot } from '@shared/types/functions';

import { functionsClient } from '@/lib/api/functionsClient';

/**
 * ラリー詳細（評価情報を含む）
 */
export interface RallyDetail extends FnRally {
  spots: Array<
    FnSpot & {
      rating?: number;
    }
  >;
}

export function useRallyDetail(rallyId: string) {
  const [rally, setRally] = useState<RallyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRallyDetail();
  }, [rallyId]);

  const fetchRallyDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      const numericRallyId = parseInt(rallyId, 10);

      // 1. ラリー基本情報を取得
      const rallyResponse: FnRally = await functionsClient.getRally(numericRallyId);

      // 2. スポット一覧を取得
      const spotsResponse = await functionsClient.getRallySpots(numericRallyId);

      // 3. 評価データを取得
      const ratingsResponse = await functionsClient.getRallyRatings(numericRallyId);

      // 4. スポットに評価情報をマージ
      const spotsWithRatings = spotsResponse.data.map((spot: FnSpot) => {
        const rating = ratingsResponse.ratings.find((r: FnRating) => r.spot_id === spot.id);
        return {
          ...spot,
          rating: rating?.stars,
        };
      });

      setRally({
        id: rallyResponse.id,
        name: rallyResponse.name,
        genre: rallyResponse.genre,
        spots: spotsWithRatings,
      });
    } catch (err) {
      console.error('Failed to fetch rally detail:', err);
      setError(err instanceof Error ? err.message : 'ラリーの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return { rally, loading, error, refetch: fetchRallyDetail };
}
