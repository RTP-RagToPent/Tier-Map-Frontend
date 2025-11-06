'use client';

import { useEffect, useState } from 'react';

import { apiClient, isApiConfigured } from '@shared/lib/api-client';

import { calculateTier, TierRank } from '@features/tier/lib/tier-calculator';

export interface ShareSpot {
  id: string;
  name: string;
  rating: number;
  tier: TierRank;
  memo?: string;
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

export function useRallyShare(rallyId: string) {
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchShareData();
  }, [rallyId]);

  const fetchShareData = async () => {
    setLoading(true);
    setError(null);

    try {
      const numericRallyId = parseInt(rallyId, 10);

      if (!isApiConfigured()) {
        // APIが設定されていない場合はモックデータ
        console.warn('⚠️  API not configured, using mock data');
        setShareData(getMockShareData(numericRallyId));
        setLoading(false);
        return;
      }

      // 1. ラリー基本情報を取得
      const rallyResponse = await apiClient.getRally(numericRallyId);

      // 2. 評価データを取得
      const ratingsResponse = await apiClient.getRallyRatings(numericRallyId);

      // 3. スポットに評価とティアを追加
      const spotsWithTier: ShareSpot[] = ratingsResponse.ratings.map((rating) => ({
        id: rating.spot_id,
        name: rating.name,
        rating: rating.stars,
        tier: calculateTier(rating.stars),
        memo: rating.memo,
      }));

      // 4. 平均評価を計算
      const averageRating =
        spotsWithTier.reduce((sum, s) => sum + s.rating, 0) / spotsWithTier.length;

      setShareData({
        rally: {
          id: rallyResponse.id,
          name: rallyResponse.name,
          genre: rallyResponse.genre,
        },
        spots: spotsWithTier,
        averageRating,
      });
    } catch (err) {
      console.error('Failed to fetch share data:', err);
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      // エラー時はモックデータで表示
      setShareData(getMockShareData(parseInt(rallyId, 10)));
    } finally {
      setLoading(false);
    }
  };

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/rallies/${rallyId}/tier`;
  };

  const getShareText = () => {
    if (!shareData) return '';
    return `${shareData.rally.name}を完走しました！\n平均評価: ${shareData.averageRating.toFixed(1)}/5.0\n\n#TierMap`;
  };

  const handleCopyLink = async () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLine = async () => {
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(
      `${getShareText()}\n${getShareUrl()}`
    )}`;
    window.open(lineUrl, '_blank');
  };

  const handleShareTwitter = async () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      getShareText()
    )}&url=${encodeURIComponent(getShareUrl())}`;
    window.open(twitterUrl, '_blank');
  };

  const handleDownloadImage = () => {
    // TODO: 実際のOGP画像生成APIを呼び出してダウンロード
    alert('画像生成機能は実装予定です（バックエンドAPI連携が必要）');
  };

  return {
    shareData,
    loading,
    error,
    copied,
    shareUrl: getShareUrl(),
    shareText: getShareText(),
    handleCopyLink,
    handleShareLine,
    handleShareTwitter,
    handleDownloadImage,
  };
}

/**
 * モックデータ（APIが設定されていない場合のフォールバック）
 */
function getMockShareData(rallyId: number): ShareData {
  const mockSpots = [
    { id: 'spot-1', name: 'ラーメンA', rating: 5.0 },
    { id: 'spot-2', name: 'ラーメンB', rating: 4.0 },
    { id: 'spot-3', name: 'ラーメンC', rating: 4.8 },
    { id: 'spot-4', name: 'ラーメンD', rating: 3.2 },
    { id: 'spot-5', name: 'ラーメンE', rating: 4.5 },
  ];

  const spotsWithTier = mockSpots.map((spot) => ({
    ...spot,
    tier: calculateTier(spot.rating),
  }));

  const averageRating = mockSpots.reduce((sum, s) => sum + s.rating, 0) / mockSpots.length;

  return {
    rally: {
      id: rallyId,
      name: '渋谷区 ラーメンラリー',
      genre: 'ラーメン',
    },
    spots: spotsWithTier,
    averageRating,
  };
}
