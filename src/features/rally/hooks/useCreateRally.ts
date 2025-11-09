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
    const loadSelectedSpots = () => {
      setLoading(true);
      try {
        // セッションストレージから選択されたスポット情報を読み込む
        const savedSpotsStr = sessionStorage.getItem('selectedSpots');

        if (savedSpotsStr) {
          const savedSpots: Spot[] = JSON.parse(savedSpotsStr);

          // spotIdsの順序に従って並び替え
          const orderedSpots = spotIds
            .map((id) => savedSpots.find((spot) => spot.id === id))
            .filter((spot): spot is Spot => Boolean(spot));

          if (orderedSpots.length !== spotIds.length) {
            console.warn('⚠️  Some selected spots were not found in sessionStorage');
            // セッションストレージにない場合は、APIから取得を試みる
            fetchSelectedSpotsFromAPI();
            return;
          }

          setSpots(orderedSpots);
          setLoading(false);

          // セッションストレージをクリア（次の実行で再度読み込まないように）
          // ただし、itemsが設定された後にクリアする
          setTimeout(() => {
            sessionStorage.removeItem('selectedSpots');
          }, 100);
        } else {
          // セッションストレージにない場合は、APIから取得を試みる
          fetchSelectedSpotsFromAPI();
        }
      } catch (error) {
        console.error('Failed to load selected spots from sessionStorage:', error);
        // エラー時はAPIから取得を試みる
        fetchSelectedSpotsFromAPI();
      }
    };

    const fetchSelectedSpotsFromAPI = async () => {
      try {
        // フォールバック: 候補スポットを再度取得して、選択されたIDに一致するものを抽出
        const result = await searchSpots(region, genre);
        const selectedSpots = result.spots.filter((spot) => spotIds.includes(spot.id));

        if (selectedSpots.length !== spotIds.length) {
          console.warn('⚠️  Some selected spots were not found in API result');
        }

        if (result.error) {
          console.error('⚠️  Error fetching spots:', result.error);
        }

        setSpots(selectedSpots);
      } catch (error) {
        console.error('Failed to fetch selected spots from API:', error);
        setSpots([]);
      } finally {
        setLoading(false);
      }
    };

    if (region && genre && spotIds.length > 0) {
      loadSelectedSpots();
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

      if (!rallyResponse.data?.id) {
        throw new Error('ラリー作成レスポンスにidが含まれていません');
      }

      // 2. スポットを追加

      const spotsPayload = {
        spots: spots.map((spot, index) => {
          // spot.idを確実に文字列に変換
          let spotId: string;
          if (typeof spot.id === 'string') {
            spotId = spot.id;
          } else if (typeof spot.id === 'object' && spot.id !== null) {
            // オブジェクトの場合は、place_idプロパティを探すか、JSON.stringifyを使用
            const idObj = spot.id as { place_id?: string; id?: string };
            spotId = idObj.place_id || idObj.id || JSON.stringify(spot.id);
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
