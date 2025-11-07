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

  const { selectedSpotIds, add, toggle, maxSelection } = useSelectionStore();

  const [items, setItems] = useState<UISpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSpotId, setActiveSpotId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const selectedIds = spotsParam.split(',').filter(Boolean);
    if (selectedIds.length === 0 || !region || !genre) {
      setLoading(false);
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    searchSpots(region, genre)
      .then((result) => {
        if (result.error) {
          setError(result.error);
        }
        const map: Record<string, UISpot> = {};
        result.spots.forEach((spot, index) => {
          map[spot.id] = {
            ...spot,
            distanceKm: 0.4 + index * 0.2,
            priceRange: ['¥', '¥¥', '¥¥¥'][index % 3] as UISpot['priceRange'],
            thumbnailUrl: spot.photoUrl,
            isOpen: index % 2 === 0,
          };
        });
        const ordered = selectedIds
          .map((id) => map[id])
          .filter((spot): spot is UISpot => Boolean(spot));
        setItems(ordered);
        ordered.forEach((spot) => add(spot.id));
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : '候補の取得に失敗しました');
        setLoading(false);
      });
  }, [add, genre, region, spotsParam]);

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
    if (items.length < 3) {
      alert('ラリーを作成するには3件以上のスポットが必要です');
      return;
    }
    const query = new URLSearchParams({
      region,
      genre,
      spots: items.map((spot) => spot.id).join(','),
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

  const completion = Math.min(items.length, maxSelection);

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
