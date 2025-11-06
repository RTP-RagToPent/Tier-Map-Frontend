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
      // APIは { rallies, message } 形式を想定
      setRallies(response.rallies ?? []);
    } catch (err) {
      console.error('Failed to fetch rallies:', err);
      setError(err instanceof Error ? err.message : 'ラリーの取得に失敗しました');
      setRallies([]);
    } finally {
      setLoading(false);
    }
  };

  return { rallies, loading, error, refetch: fetchRallies };
}
