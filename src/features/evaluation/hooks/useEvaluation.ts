'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { analytics } from '@shared/lib/analytics';
import { ROUTES } from '@shared/constants/routes';

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
      // TODO: 実際のAPIへ評価を送信
      const evaluation = {
        spotId,
        rating,
        memo,
        visitedAt: new Date().toISOString(),
      };

      console.log('Evaluation saved:', evaluation);

      // アナリティクスイベント送信
      await analytics.spotEvaluated(rallyId, spotId, rating);

      alert('評価を保存しました！');
      router.push(ROUTES.RALLY_DETAIL(rallyId));
    } catch (error) {
      console.error('Failed to save evaluation:', error);
      alert('評価の保存に失敗しました');
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

