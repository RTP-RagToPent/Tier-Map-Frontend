'use client';

import { useEffect, useMemo, useState } from 'react';

import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useRouter } from 'next/navigation';

import { Spot } from '@shared/types/spot';

import { searchSpots } from '@features/candidates/lib/google-places';

import { functionsClient } from '@/lib/api/functionsClient';

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

  // spotIdsを文字列に変換してメモ化（無限ループを防ぐ）
  const spotIdsKey = useMemo(() => {
    return [...spotIds].sort().join(',');
  }, [spotIds]);

  useEffect(() => {
    const fetchSelectedSpots = async () => {
      setLoading(true);
      try {
        // 候補スポットを再度取得して、選択されたIDに一致するものを抽出
        const result = await searchSpots(region, genre);
        const selectedSpots = result.spots.filter((spot) => spotIds.includes(spot.id));

        if (selectedSpots.length !== spotIds.length) {
          console.warn('⚠️  Some selected spots were not found');
        }

        if (result.error) {
          console.error('⚠️  Error fetching spots:', result.error);
        }

        setSpots(selectedSpots);
      } catch (error) {
        console.error('Failed to fetch selected spots:', error);
        setSpots([]);
      } finally {
        setLoading(false);
      }
    };

    if (region && genre && spotIds.length > 0) {
      fetchSelectedSpots();
    } else {
      setSpots([]);
      setLoading(false);
    }
    // spotIdsKeyを使用して無限ループを防ぐ（spotIdsKeyはspotIdsに依存しているため、spotIdsの変更を検知できる）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotIdsKey, region, genre]);

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
      // 1. ラリーを作成
      const rallyResponse = await functionsClient.createRally({ name: rallyName, genre });

      // 2. スポットを追加
      await functionsClient.addRallySpots(rallyResponse.id, {
        spots: spots.map((spot) => ({
          spot_id: spot.id,
          name: spot.name,
        })),
      });

      // 3. 完了UI
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
