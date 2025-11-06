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
        console.error('⚠️  API not configured');
        setError('APIが設定されていません');
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
      setShareData(null);
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
    // Web Share APIが利用可能な場合はそれを使用
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareData?.rally.name || 'Tier Map',
          text: getShareText(),
          url: getShareUrl(),
        });
        return;
      } catch (err) {
        // ユーザーがキャンセルした場合は通常のコピー処理にフォールバック
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
    // Web Share APIが利用できない場合はクリップボードにコピー
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
