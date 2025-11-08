'use client';

import { useState } from 'react';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { ROUTES } from '@shared/constants/routes';

export function useEvaluation() {
  const params = useParams();
  const router = useRouter();
  const rallyId = params.id as string;
  const spotId = params.spotId as string;

  const [rating, setRating] = useState<number>(0);
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
      toast.error('評価を選択してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const { functionsClient } = await import('@/lib/api/functionsClient');

      // APIに評価を送信
      await functionsClient.createRating(parseInt(rallyId, 10), {
        spot_id: spotId,
        stars: rating,
        memo: memo || undefined,
      });

      toast.success('評価を保存しました！');
      router.push(ROUTES.RALLY_DETAIL(rallyId));
    } catch (error) {
      console.error('Failed to save evaluation:', error);
      toast.error(error instanceof Error ? error.message : '評価の保存に失敗しました');
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
    memo,
    setMemo,
    isSubmitting,
    isValid: rating > 0,
    getRatingLabel,
    handleSubmit,
    handleCancel,
  };
}
