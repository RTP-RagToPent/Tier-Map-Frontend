'use client';

import { useEffect, useMemo, useState } from 'react';

import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { TierBoard } from '@shared/components/tier/TierBoard';
import { Button } from '@shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import type { Tier, TierBoardState, UISpot } from '@shared/types/ui';

import { useRallyDetail } from '@features/rally/hooks/useRallyDetail';
import { calculateTier } from '@features/tier/lib/tier-calculator';

const TIERS: Tier[] = ['S', 'A', 'B'];

export default function TierPage() {
  const params = useParams();
  const router = useRouter();
  const rallyId = params.id as string;

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

  useEffect(() => {
    if (initialState) {
      setTiers(initialState);
    }
  }, [initialState]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (error || !rally || !tiers) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="mx-auto max-w-md text-center">
          <CardHeader>
            <CardTitle>ティア表を表示できませんでした</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              評価済みのスポットが必要です。まずは各スポットを評価してください。
            </p>
            <Button onClick={() => router.push(`/rallies/${rallyId}`)}>ラリー詳細に戻る</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
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

    if (!toTier) return;

    setTiers((prev) => {
      if (!prev) return prev;
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
          if (fromTier === toTier && movingIndex < targetIndex) {
            insertIndex -= 1;
          }
        }
      }

      if (toTier === fromTier && insertIndex > movingIndex) {
        insertIndex -= 1;
      }
      if (insertIndex < 0) insertIndex = 0;
      toList.splice(insertIndex, 0, movingSpot);

      return {
        ...prev,
        [fromTier]: fromList,
        [toTier]: toList,
      };
    });
  };

  const evaluateCount = TIERS.reduce((acc, tier) => acc + tiers[tier].length, 0);
  const averageRating = TIERS.reduce(
    (sum, tier) => sum + tiers[tier].reduce((tierSum, spot) => tierSum + (spot.rating ?? 0), 0),
    0
  );
  const average = evaluateCount > 0 ? (averageRating / evaluateCount).toFixed(1) : '0.0';

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            {rally.name} のティア表
          </h1>
          <p className="text-sm text-muted-foreground">
            星評価に基づいて自動分類しました。ドラッグ＆ドロップで調整できます。
          </p>
        </div>
        <div className="rounded-xl bg-primary/10 px-4 py-2 text-sm text-primary">
          平均評価: <span className="text-xl font-semibold">{average}</span>
        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <Card className="p-6">
          <TierBoard tiers={tiers} />
        </Card>
      </DndContext>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          className="flex-1"
          onClick={() => {
            toast.success('ティア表を保存しました（ダミー処理）');
          }}
        >
          保存して固定
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push(`/rallies/${rallyId}/share`)}
        >
          共有ページに進む
        </Button>
      </div>
    </div>
  );
}
