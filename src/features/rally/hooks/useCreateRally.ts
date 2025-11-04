'use client';

import { useEffect, useState } from 'react';

import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useRouter } from 'next/navigation';

import { analytics } from '@shared/lib/analytics';
import { apiClient, isApiConfigured } from '@shared/lib/api-client';
import { Spot } from '@shared/types/spot';

interface UseCreateRallyParams {
  region: string;
  genre: string;
  spotIds: string[];
}

export function useCreateRally({ region, genre, spotIds }: UseCreateRallyParams) {
  const router = useRouter();
  const [rallyName, setRallyName] = useState(`${region} ${genre}ラリー`);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 選択されたスポットのデータを取得（モック）
    // 実際にはAPIから取得またはstateから受け渡し
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSpots((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      if (!isApiConfigured()) {
        // APIが設定されていない場合はモック処理
        console.warn('⚠️  API not configured, using mock data');
        const rallyId = `rally-${Date.now()}`;
        await analytics.rallyStarted(rallyId);
        alert(`ラリー「${rallyName}」を作成しました！`);
        router.push(`/rallies/${rallyId}`);
        return;
      }

      // 1. ラリーを作成
      const rallyResponse = await apiClient.createRally(rallyName, genre);

      // 2. スポットを追加
      await apiClient.addRallySpots(
        rallyResponse.id,
        spots.map((spot) => ({
          spot_id: spot.id,
          name: spot.name,
        }))
      );

      // 3. アナリティクスイベント送信
      await analytics.rallyStarted(String(rallyResponse.id));

      alert(`ラリー「${rallyName}」を作成しました！`);
      router.push(`/rallies/${rallyResponse.id}`);
    } catch (error) {
      console.error('Failed to create rally:', error);
      alert('ラリーの作成に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return {
    rallyName,
    setRallyName,
    spots,
    loading,
    saving,
    handleDragEnd,
    handleSave,
    handleCancel,
  };
}
