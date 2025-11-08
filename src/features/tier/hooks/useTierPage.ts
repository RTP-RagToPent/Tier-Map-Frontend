'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

import type { Tier, TierBoardState, UISpot } from '@shared/types/ui';

import { useRallyDetail } from '@features/rally/hooks/useRallyDetail';
import { calculateTier } from '@features/tier/lib/tier-calculator';

const TIERS: Tier[] = ['S', 'A', 'B'];

export function useTierPage(rallyId: string) {
  const { rally, loading, error } = useRallyDetail(rallyId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const initialState = useMemo<TierBoardState | null>(() => {
    if (!rally) return null;
    const evaluated = rally.spots.filter(
      (spot) => spot.rating !== undefined && spot.rating !== null
    );
    const base: TierBoardState = { S: [], A: [], B: [] };
    evaluated.forEach((spot) => {
      const tier = calculateTier(spot.rating ?? 0) as Tier;
      const uiSpot: UISpot = {
        id: spot.id,
        name: spot.name,
        rating: spot.rating ?? 0,
        memo: undefined,
        address: '',
        lat: 0,
        lng: 0,
      };
      base[tier] = [...base[tier], uiSpot];
    });
    return base;
  }, [rally]);

  const [tiers, setTiers] = useState<TierBoardState | null>(initialState);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeSpot, setActiveSpot] = useState<UISpot | null>(null);

  useEffect(() => {
    if (initialState) {
      setTiers(initialState);
    }
  }, [initialState]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeIdStr = active.id as string;
      setActiveId(activeIdStr);

      // アクティブなスポットを検索
      const tierPrefix = activeIdStr.split('-')[0] as Tier;
      const spotId = activeIdStr.split('-').slice(1).join('-');
      if (tiers && TIERS.includes(tierPrefix)) {
        const spot = tiers[tierPrefix]?.find((s) => s.id === spotId);
        if (spot) {
          setActiveSpot(spot);
        }
      }
    },
    [tiers]
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    setActiveSpot(null);
    const { active, over } = event;
    if (!over) return;

    const fromTier = active.data.current?.fromTier as Tier | undefined;
    if (!fromTier) return;

    const activeId = (active.id as string).split('-').pop() as string;
    const overId = over.id as string;

    let toTier: Tier | null = null;
    if (overId.startsWith('tier-')) {
      toTier = overId.replace('tier-', '') as Tier;
    } else {
      const tierPrefix = overId.split('-')[0];
      if (TIERS.includes(tierPrefix as Tier)) {
        toTier = tierPrefix as Tier;
      }
    }

    if (!toTier || !TIERS.includes(toTier)) return;

    setTiers((prev) => {
      if (!prev) return prev;

      // 同じティア内での移動の場合
      if (fromTier === toTier) {
        const list = [...prev[fromTier]];
        const movingIndex = list.findIndex((spot) => spot.id === activeId);
        if (movingIndex === -1) return prev;

        let insertIndex = list.length;
        if (overId.startsWith('tier-')) {
          insertIndex = list.length;
        } else {
          const overSpotId = overId.split('-').slice(1).join('-');
          const targetIndex = list.findIndex((spot) => spot.id === overSpotId);
          if (targetIndex >= 0) {
            if (movingIndex < targetIndex) {
              insertIndex = targetIndex;
            } else {
              insertIndex = targetIndex + 1;
            }
          }
        }

        if (
          movingIndex === insertIndex ||
          (movingIndex < insertIndex && insertIndex === movingIndex + 1)
        ) {
          return prev;
        }

        const newList = [...list];
        const [movingSpot] = newList.splice(movingIndex, 1);
        const adjustedInsertIndex = movingIndex < insertIndex ? insertIndex - 1 : insertIndex;
        newList.splice(adjustedInsertIndex, 0, movingSpot);

        return {
          ...prev,
          [fromTier]: newList,
        };
      }

      // 異なるティア間での移動の場合
      const fromList = [...prev[fromTier]];
      const movingIndex = fromList.findIndex((spot) => spot.id === activeId);
      if (movingIndex === -1) return prev;
      const [movingSpot] = fromList.splice(movingIndex, 1);

      const toList = [...prev[toTier]];

      let insertIndex = toList.length;
      if (overId.startsWith('tier-')) {
        insertIndex = toList.length;
      } else {
        const overSpotId = overId.split('-').slice(1).join('-');
        const targetIndex = toList.findIndex((spot) => spot.id === overSpotId);
        if (targetIndex >= 0) {
          insertIndex = targetIndex;
        }
      }
      if (insertIndex < 0) insertIndex = 0;
      toList.splice(insertIndex, 0, movingSpot);

      return {
        ...prev,
        [fromTier]: fromList,
        [toTier]: toList,
      };
    });
  }, []);

  const evaluateCount = TIERS.reduce((acc, tier) => acc + (tiers?.[tier]?.length ?? 0), 0);
  const averageRating = TIERS.reduce(
    (sum, tier) =>
      sum + (tiers?.[tier]?.reduce((tierSum, spot) => tierSum + (spot.rating ?? 0), 0) ?? 0),
    0
  );
  const average = evaluateCount > 0 ? (averageRating / evaluateCount).toFixed(1) : '0.0';

  return {
    rally,
    loading,
    error,
    tiers,
    sensors,
    activeId,
    activeSpot,
    average,
    handleDragStart,
    handleDragEnd,
  };
}
