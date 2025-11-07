'use client';

import { useEffect, useState } from 'react';

import { functionsClient } from '@/lib/api/functionsClient';

export interface Rally {
  id: number;
  name: string;
  genre: string;
  // フロントエンド独自のプロパティ（後で拡張可能）
  status?: 'draft' | 'in_progress' | 'completed';
  createdAt?: string;
}

export function useRallies() {
  const [rallies, setRallies] = useState<Rally[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRallies();
  }, []);

  const fetchRallies = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await functionsClient.getRallies();
      // APIは { data: Rally[], message } 形式を想定
      setRallies(response.data ?? []);
    } catch (err) {
      console.error('Failed to fetch rallies:', err);
      const errorMessage = err instanceof Error ? err.message : 'ラリーの取得に失敗しました';

      // 401エラーの場合、functionsClientでログアウト処理が実行されるため、ここではエラーを設定しない
      if (!errorMessage.includes('401') && !errorMessage.includes('Unauthorized')) {
        setError(errorMessage);
      }

      setRallies([]);
    } finally {
      setLoading(false);
    }
  };

  return { rallies, loading, error, refetch: fetchRallies };
}
