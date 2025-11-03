'use client';

import { analytics } from '@shared/lib/analytics';
import { apiClient, isApiConfigured } from '@shared/lib/api-client';
import { Spot } from '@shared/types/spot';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useCreateRally() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const region = searchParams.get('region') || '';
  const genre = searchParams.get('genre') || '';
  const spotIds = searchParams.get('spots')?.split(',') || [];

  const [rallyName, setRallyName] = useState(`${region} ${genre}ラリー`);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 選択されたスポットのデータを復元
    // TODO: 実際にはlocalStorageまたはstateから取得
    // 現在は簡易的にモックデータで復元
    const mockSpots: Spot[] = spotIds.map((id, idx) => ({
      id,
      name: `スポット ${String.fromCharCode(65 + idx)}`,
      address: `${region} ${idx + 1}-${idx + 1}-${idx + 1}`,
      rating: 4.0 + idx * 0.1,
      lat: 35.6812 + idx * 0.01,
      lng: 139.7671 + idx * 0.01,
    }));
    setSpots(mockSpots);
    setLoading(false);
  }, [spotIds, region]);

  const handleSave = async () => {
    if (spots.length < 3 || spots.length > 5) {
      alert('スポットは3〜5件必要です');
      return;
    }

    setSaving(true);

    try {
      if (!isApiConfigured()) {
        // APIが設定されていない場合はモックモード
        console.warn('⚠️  API not configured, using mock mode');
        const mockRallyId = Date.now();
        await analytics.rallyStarted(`rally-${mockRallyId}`);
        alert('ラリーを作成しました（モックモード）');
        router.push(`/rally/${mockRallyId}`);
        return;
      }

      // 1. ラリーを作成
      const rallyResponse = await apiClient.createRally(rallyName, genre);
      const rallyId = rallyResponse.id;

      // 2. スポットを追加
      const spotsData = spots.map((spot) => ({
        spot_id: spot.id,
        name: spot.name,
      }));
      await apiClient.addRallySpots(rallyId, spotsData);

      // 3. アナリティクスイベント送信
      await analytics.rallyStarted(`rally-${rallyId}`);

      // 4. ラリー詳細ページへ遷移
      router.push(`/rally/${rallyId}`);
    } catch (error) {
      console.error('Failed to create rally:', error);
      alert(error instanceof Error ? error.message : 'ラリーの作成に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return {
    region,
    genre,
    rallyName,
    setRallyName,
    spots,
    setSpots,
    loading,
    saving,
    handleSave,
  };
}
