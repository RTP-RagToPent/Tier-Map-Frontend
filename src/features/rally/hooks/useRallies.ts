'use client';

import { useEffect, useState } from 'react';

import { apiClient, isApiConfigured } from '@shared/lib/api-client';

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
      if (!isApiConfigured()) {
        // APIが設定されていない場合はモックデータ
        console.warn('⚠️  API not configured, using mock data');
        setRallies(getMockRallies());
        setLoading(false);
        return;
      }

      const response = await apiClient.getRallies();
      setRallies(response.rallies);
    } catch (err) {
      console.error('Failed to fetch rallies:', err);
      setError(err instanceof Error ? err.message : 'ラリーの取得に失敗しました');
      // エラー時はモックデータで表示
      setRallies(getMockRallies());
    } finally {
      setLoading(false);
    }
  };

  return { rallies, loading, error, refetch: fetchRallies };
}

/**
 * モックデータ（APIが設定されていない場合のフォールバック）
 */
function getMockRallies(): Rally[] {
  return [
    {
      id: 1,
      name: '渋谷区 ラーメンラリー',
      genre: 'ラーメン',
      status: 'in_progress',
      createdAt: '2025-10-30',
    },
    {
      id: 2,
      name: '新宿区 カフェラリー',
      genre: 'カフェ',
      status: 'draft',
      createdAt: '2025-10-29',
    },
  ];
}
