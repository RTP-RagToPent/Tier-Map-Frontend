'use client';

import { useEffect, useMemo, useState } from 'react';

import type { Tier, TierBoardState, UISpot } from '@shared/types/ui';

import { calculateTier, type TierRank } from '@features/tier/lib/tier-calculator';

export interface ShareSpot {
  id: string;
  name: string;
  rating: number;
  tier: TierRank;
  memo?: string;
  order_no: number;
  address?: string;
  photoUrl?: string;
}

export interface ShareData {
  rally: {
    id: number;
    name: string;
    genre: string;
  };
  spots: ShareSpot[];
  averageRating: number;
}

export function useRallyShareView(rallyId: string) {
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShareData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/rallies/${rallyId}/share`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch: ${response.status}`);
        }

        const data = await response.json();

        // spotsが配列であることを確認
        if (!Array.isArray(data.spots)) {
          throw new Error('Invalid response: spots is not an array');
        }

        // 各スポットの詳細情報を取得
        const spotsWithDetails = await Promise.all(
          data.spots.map(async (spot: Omit<ShareSpot, 'tier'> & { rating: number }) => {
            try {
              const detailsResponse = await fetch(
                `/api/spots?place_id=${encodeURIComponent(spot.id)}`
              );
              if (detailsResponse.ok) {
                const details = await detailsResponse.json();
                return {
                  ...spot,
                  tier: calculateTier(spot.rating),
                  address: details.address,
                  photoUrl: details.photoUrl,
                };
              }
            } catch (err) {
              console.warn(`Failed to fetch details for spot ${spot.id}:`, err);
            }
            return {
              ...spot,
              tier: calculateTier(spot.rating),
            };
          })
        );

        setShareData({
          ...data,
          spots: spotsWithDetails,
        });
      } catch (err) {
        console.error('Failed to fetch share data:', err);
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
        setShareData(null);
      } finally {
        setLoading(false);
      }
    };

    if (rallyId) {
      fetchShareData();
    }
  }, [rallyId]);

  // ティア別にスポットを分類
  const tiers = useMemo<TierBoardState | null>(() => {
    if (!shareData || !Array.isArray(shareData.spots)) return null;

    const base: TierBoardState = { S: [], A: [], B: [] };
    shareData.spots.forEach((spot) => {
      const tier = spot.tier as Tier;
      const uiSpot: UISpot = {
        id: spot.id,
        name: spot.name,
        rating: spot.rating,
        memo: spot.memo,
        address: spot.address || '',
        lat: 0,
        lng: 0,
        thumbnailUrl: spot.photoUrl,
      };
      base[tier] = [...base[tier], uiSpot];
    });
    return base;
  }, [shareData]);

  return {
    shareData,
    tiers,
    loading,
    error,
  };
}
