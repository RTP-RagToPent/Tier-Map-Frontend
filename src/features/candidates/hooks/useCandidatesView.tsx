'use client';

import { useEffect, useMemo, useState } from 'react';

import { DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useRouter, useSearchParams } from 'next/navigation';

import { ROUTES } from '@shared/constants/routes';
import { SelectionStoreProvider, useSelectionStore } from '@shared/lib/stores/selection-store';
import type { UISpot } from '@shared/types/ui';

import { searchSpots } from '@features/candidates/lib/google-places';

interface UseCandidatesViewResult {
  region: string;
  genre: string;
  items: UISpot[];
  loading: boolean;
  error: string | null;
  completion: number;
  meta: { header: string; description: string };
  activeSpotId: string | undefined;
  setActiveSpotId: (value: string | undefined) => void;
  selectedSpotIds: string[];
  maxSelection: number;
  sensors: ReturnType<typeof useSensors>;
  handleDragEnd: (event: DragEndEvent) => void;
  handleCreateRally: () => void;
  handleMapAdd: (spot: UISpot) => void;
}

export function useCandidatesView(): UseCandidatesViewResult {
  const router = useRouter();
  const params = useSearchParams();

  const region = params.get('region') ?? '';
  const genre = params.get('genre') ?? '';
  const spotsParam = params.get('spots') ?? '';

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const { selectedSpotIds, toggle, maxSelection, setSelectedSpotIds } = useSelectionStore();

  const [items, setItems] = useState<UISpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSpotId, setActiveSpotId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchCandidates = async (selectedIds: string[]) => {
      if (selectedIds.length === 0 || !region || !genre) {
        setLoading(false);
        setItems([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // まずセッションストレージから選択されたスポット情報を読み込む
        const savedSpotsStr = sessionStorage.getItem('selectedSpots');
        let savedSpots: Array<{
          id: string;
          name: string;
          address: string;
          lat: number;
          lng: number;
          rating?: number;
          photoUrl?: string;
        }> | null = null;

        if (savedSpotsStr) {
          try {
            savedSpots = JSON.parse(savedSpotsStr);

            // selectedIdsの順序に従って並び替え
            const ordered = selectedIds
              .map((id) => {
                const savedSpot = savedSpots!.find((spot) => spot.id === id);
                if (savedSpot) {
                  return {
                    ...savedSpot,
                    priceRange: ['¥', '¥¥', '¥¥¥'][
                      selectedIds.indexOf(id) % 3
                    ] as UISpot['priceRange'],
                    thumbnailUrl: savedSpot.photoUrl,
                    isOpen: selectedIds.indexOf(id) % 2 === 0,
                  } as UISpot;
                }
                return null;
              })
              .filter((spot): spot is UISpot => Boolean(spot));

            // セッションストレージからすべてのスポットを取得できた場合
            if (ordered.length === selectedIds.length) {
              setItems(ordered);
              setSelectedSpotIds(selectedIds);
              setLoading(false);
              // セッションストレージはクリアしない（useCreateRally.tsで使用するため）
              // useCreateRally.tsでクリアされる
              return;
            }
            // 一部しか取得できなかった場合は、セッションストレージのデータを保持してAPIからも取得
          } catch (parseError) {
            console.error('Failed to parse saved spots from sessionStorage:', parseError);
            savedSpots = null;
          }
        }

        // セッションストレージにない場合、または一部しか取得できなかった場合はAPIから取得
        const result = await searchSpots(region, genre);
        if (result.error) {
          setError(result.error);
        }
        const map: Record<string, UISpot> = {};
        result.spots.forEach((spot, index) => {
          map[spot.id] = {
            ...spot,
            priceRange: ['¥', '¥¥', '¥¥¥'][index % 3] as UISpot['priceRange'],
            thumbnailUrl: spot.photoUrl,
            isOpen: index % 2 === 0,
          };
        });

        // セッションストレージから取得したスポットがある場合は、それらを優先して使用
        let ordered: UISpot[] = [];

        if (savedSpots) {
          // セッションストレージから取得したスポットを優先
          ordered = selectedIds
            .map((id) => {
              const savedSpot = savedSpots!.find((spot) => spot.id === id);
              if (savedSpot) {
                return {
                  ...savedSpot,
                  distanceKm: Math.min(
                    5.0,
                    1.0 + (selectedIds.indexOf(id) / Math.max(1, selectedIds.length - 1)) * 4.0
                  ),
                  priceRange: ['¥', '¥¥', '¥¥¥'][
                    selectedIds.indexOf(id) % 3
                  ] as UISpot['priceRange'],
                  thumbnailUrl: savedSpot.photoUrl,
                  isOpen: selectedIds.indexOf(id) % 2 === 0,
                } as UISpot;
              }
              // セッションストレージにない場合は、APIから取得した結果を使用
              return map[id] ? map[id] : null;
            })
            .filter((spot): spot is UISpot => Boolean(spot));
          // セッションストレージはクリアしない（useCreateRally.tsで使用するため）
          // useCreateRally.tsでクリアされる
        } else {
          // セッションストレージにない場合は、APIから取得した結果のみを使用
          ordered = selectedIds
            .map((id) => map[id])
            .filter((spot): spot is UISpot => Boolean(spot));
        }

        // デバッグログ
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 fetchCandidates result:', {
            selectedIds: selectedIds.length,
            ordered: ordered.length,
            items: ordered.map((item) => ({ id: item.id, name: item.name })),
          });
        }

        setItems(ordered);
        // orderedに含まれるIDのみをselectedSpotIdsに設定（同期を保つ）
        const validIds = ordered.map((item) => item.id);
        setSelectedSpotIds(validIds);
      } catch (err) {
        console.error('Failed to fetch candidates:', err);
        setError(err instanceof Error ? err.message : '候補の取得に失敗しました');
        setItems([]);
        setSelectedSpotIds([]);
      } finally {
        setLoading(false);
      }
    };

    const selectedIds = spotsParam.split(',').filter(Boolean);

    // 既にitemsが設定されている場合は再実行しない（無限ループを防ぐ）
    if (items.length > 0 && selectedIds.length === items.length) {
      const itemsIds = items
        .map((item) => item.id)
        .sort()
        .join(',');
      const selectedIdsSorted = [...selectedIds].sort().join(',');
      if (itemsIds === selectedIdsSorted) {
        return;
      }
    }

    fetchCandidates(selectedIds);
  }, [genre, region, spotsParam, setSelectedSpotIds, items.length]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === active.id);
      const newIndex = prev.findIndex((item) => item.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleCreateRally = () => {
    // selectedSpotIdsを基準にitemsから該当するスポットを取得
    const selectedItems = items.filter((item) => selectedSpotIds.includes(item.id));

    if (selectedItems.length < 3) {
      alert('ラリーを作成するには3件以上のスポットが必要です');
      return;
    }

    // 選択されたスポット情報をセッションストレージに保存
    // Spot型に変換（UISpotから不要なプロパティを削除）
    const spotsToSave = selectedItems.map((item) => ({
      id: item.id,
      name: item.name,
      address: item.address || '',
      lat: item.lat,
      lng: item.lng,
      rating: item.rating,
      photoUrl: item.thumbnailUrl || item.photoUrl,
    }));

    try {
      sessionStorage.setItem('selectedSpots', JSON.stringify(spotsToSave));
    } catch (error) {
      console.error('Failed to save selected spots to sessionStorage:', error);
    }

    const query = new URLSearchParams({
      region,
      genre,
      spots: selectedItems.map((spot) => spot.id).join(','),
    });
    router.push(`${ROUTES.RALLY_CREATE}?${query.toString()}`);
  };

  const handleMapAdd = (spot: UISpot) => {
    if (selectedSpotIds.includes(spot.id)) {
      toggle(spot.id);
      return;
    }
    if (selectedSpotIds.length >= maxSelection) return;
    toggle(spot.id);
    if (!items.some((item) => item.id === spot.id)) {
      setItems((prev) => [...prev, spot]);
    }
  };

  const completion = Math.min(selectedSpotIds.length, maxSelection);

  const meta = useMemo(
    () => ({
      header: `${region} × ${genre}`,
      description: 'ドラッグで並び替えられます',
    }),
    [genre, region]
  );

  return {
    region,
    genre,
    items,
    loading,
    error,
    completion,
    meta,
    activeSpotId,
    setActiveSpotId,
    selectedSpotIds,
    maxSelection,
    sensors,
    handleDragEnd,
    handleCreateRally,
    handleMapAdd,
  };
}

export function CandidatesViewProvider({ children }: { children: React.ReactNode }) {
  return <SelectionStoreProvider maxSelection={5}>{children}</SelectionStoreProvider>;
}
