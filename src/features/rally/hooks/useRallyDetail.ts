'use client';

import { useEffect, useState } from 'react';

import { apiClient, isApiConfigured } from '@shared/lib/api-client';
import { Rally, RallySpot } from '@shared/types/api';

/**
 * ラリー詳細（評価情報を含む）
 */
export interface RallyDetail extends Rally {
  spots: Array<
    RallySpot & {
      visited?: boolean;
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

      if (!isApiConfigured()) {
        // APIが設定されていない場合はモックデータ
        console.warn('⚠️  API not configured, using mock data');
        setRally(getMockRallyDetail(numericRallyId));
        setLoading(false);
        return;
      }

      // 1. ラリー基本情報を取得
      const rallyResponse = await apiClient.getRally(numericRallyId);

      // 2. スポット一覧を取得
      const spotsResponse = await apiClient.getRallySpots(numericRallyId);

      // 3. 評価データを取得
      const ratingsResponse = await apiClient.getRallyRatings(numericRallyId);

      // 4. スポットに評価情報をマージ
      const spotsWithRatings = spotsResponse.spots.map((spot) => {
        const rating = ratingsResponse.ratings.find((r) => r.spot_id === spot.id);
        return {
          ...spot,
          visited: !!rating,
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
      // エラー時はモックデータで表示
      setRally(getMockRallyDetail(parseInt(rallyId, 10)));
    } finally {
      setLoading(false);
    }
  };

  return { rally, loading, error, refetch: fetchRallyDetail };
}

/**
 * モックデータ（APIが設定されていない場合のフォールバック）
 */
function getMockRallyDetail(rallyId: number): RallyDetail {
  return {
    id: rallyId,
    name: '渋谷区 ラーメンラリー',
    genre: 'ラーメン',
    spots: [
      { id: 'spot-1', name: 'ラーメンA', order_no: 1, visited: true, rating: 5 },
      { id: 'spot-2', name: 'ラーメンB', order_no: 2, visited: true, rating: 4 },
      { id: 'spot-3', name: 'ラーメンC', order_no: 3, visited: false },
      { id: 'spot-4', name: 'ラーメンD', order_no: 4, visited: false },
      { id: 'spot-5', name: 'ラーメンE', order_no: 5, visited: false },
    ],
  };
}
