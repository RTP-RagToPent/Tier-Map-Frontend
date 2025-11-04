'use client';

import { useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { ROUTES } from '@shared/constants/routes';
import { analytics } from '@shared/lib/analytics';

export function useEvaluation() {
  const params = useParams();
  const router = useRouter();
  const rallyId = params.id as string;
  const spotId = params.spotId as string;

  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRatingLabel = (value: number): string => {
    const labels: Record<number, string> = {
      5: '最高です！',
      4: 'とても良い',
      3: '良い',
      2: '普通',
      1: 'イマイチ',
    };
    return labels[value] || '';
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('評価を選択してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const { apiClient, isApiConfigured } = await import('@shared/lib/api-client');

      if (!isApiConfigured()) {
        // APIが設定されていない場合はモックモード
        console.warn('⚠️  API not configured, using mock mode');
        console.log('Evaluation saved (mock):', {
          spotId,
          rating,
          memo,
          visitedAt: new Date().toISOString(),
        });
      } else {
        // APIに評価を送信
        await apiClient.createRating(parseInt(rallyId, 10), spotId, rating, memo || undefined);
      }

      // アナリティクスイベント送信
      await analytics.spotEvaluated(rallyId, spotId, rating);

      alert('評価を保存しました！');
      router.push(ROUTES.RALLY_DETAIL(rallyId));
    } catch (error) {
      console.error('Failed to save evaluation:', error);
      alert(error instanceof Error ? error.message : '評価の保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return {
    rallyId,
    spotId,
    rating,
    setRating,
    hoveredRating,
    setHoveredRating,
    memo,
    setMemo,
    isSubmitting,
    isValid: rating > 0,
    getRatingLabel,
    handleSubmit,
    handleCancel,
  };
}
