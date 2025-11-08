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

        // デバッグログ: spot.idの型と値を確認
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Fetched spots debug (count):', selectedSpots.length);
          selectedSpots.forEach((spot, index) => {
            console.log(`🔍 Spot ${index + 1}:`, {
              id: spot.id,
              idType: typeof spot.id,
              idIsString: typeof spot.id === 'string',
              idIsObject: typeof spot.id === 'object',
              idStringified: JSON.stringify(spot.id),
              idValue: spot.id,
              name: spot.name,
            });
          });
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

      // デバッグログ（開発環境のみ）
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Rally created:', {
          rallyResponse,
          hasId: !!rallyResponse.data?.id,
          id: rallyResponse.data?.id,
          idType: typeof rallyResponse.data?.id,
        });
      }

      if (!rallyResponse.data?.id) {
        throw new Error('ラリー作成レスポンスにidが含まれていません');
      }

      // 2. スポットを追加
      // デバッグ: spot.idの型と値を確認
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Before creating spots payload (count):', spots.length);
        spots.forEach((spot, index) => {
          console.log(`🔍 Spot ${index + 1} before conversion:`, {
            id: spot.id,
            idType: typeof spot.id,
            idIsString: typeof spot.id === 'string',
            idIsObject: typeof spot.id === 'object',
            idStringified: JSON.stringify(spot.id),
            idValue: spot.id,
            name: spot.name,
          });
        });
      }

      const spotsPayload = {
        spots: spots.map((spot, index) => {
          // spot.idを確実に文字列に変換
          let spotId: string;
          if (typeof spot.id === 'string') {
            spotId = spot.id;
          } else if (typeof spot.id === 'object' && spot.id !== null) {
            // オブジェクトの場合は、place_idプロパティを探すか、JSON.stringifyを使用
            spotId = (spot.id as any).place_id || (spot.id as any).id || JSON.stringify(spot.id);
            console.warn(`⚠️  Spot ${index + 1} id is object, converted to string:`, {
              original: spot.id,
              originalType: typeof spot.id,
              converted: spotId,
              convertedType: typeof spotId,
            });
          } else {
            spotId = String(spot.id);
          }

          return {
            spot_id: spotId,
            name: spot.name,
            order_no: index + 1, // ドラッグ&ドロップで並べ替えた順序（1始まり）
          };
        }),
      };

      // デバッグログ（開発環境のみ）
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Final spots payload (count):', spotsPayload.spots.length);
        console.log('🔍 Rally ID:', rallyResponse.data.id);
        spotsPayload.spots.forEach((s, index) => {
          console.log(`🔍 Spot ${index + 1} in payload:`, {
            spot_id: s.spot_id,
            spot_id_type: typeof s.spot_id,
            spot_id_is_string: typeof s.spot_id === 'string',
            spot_id_stringified: JSON.stringify(s.spot_id),
            name: s.name,
            order_no: s.order_no,
            order_no_type: typeof s.order_no,
          });
        });
      }

      await functionsClient.addRallySpots(rallyResponse.data.id, spotsPayload);

      // 3. 完了UI
      alert(`ラリー「${rallyName}」を作成しました！`);
      router.push(`/rallies/${rallyResponse.data.id}`);
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
