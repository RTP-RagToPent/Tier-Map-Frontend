'use client';

import { closestCenter, DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CompassIcon } from 'lucide-react';

import { DnDList } from '@shared/components/dnd/DnDList';
import { MapWithSheet } from '@shared/components/map/MapWithSheet';
import { ProgressRing } from '@shared/components/progress/ProgressRing';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { Skeleton } from '@shared/components/ui/skeleton';

import { CandidatesViewProvider, useCandidatesView } from '../hooks/useCandidatesView';

function CandidatesInner() {
  const {
    items,
    loading,
    error,
    completion,
    meta,
    activeSpotId,
    setActiveSpotId,
    maxSelection,
    sensors,
    handleDragEnd,
    handleCreateRally,
    handleMapAdd,
  } = useCandidatesView();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-4 h-60" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start">
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-3">
          <ProgressRing value={completion} max={maxSelection} />
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">{meta.header}</h1>
            <p className="text-sm text-muted-foreground">{meta.description}</p>
          </div>
        </div>

        <Card className="p-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((spot) => spot.id)}
              strategy={verticalListSortingStrategy}
            >
              <DnDList items={items} />
            </SortableContext>
          </DndContext>
        </Card>

        <Button onClick={handleCreateRally} size="lg" className="w-full">
          ラリーを作成 ({items.length}件)
        </Button>
      </div>

      <div className="w-full max-w-md space-y-4 lg:sticky lg:top-20">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <CompassIcon className="size-4" />
          マップからスポットを確認
        </div>
        <MapWithSheet
          spots={items}
          selectedSpotId={activeSpotId}
          onSelectSpot={(spotId) => setActiveSpotId(spotId)}
          onAddSpot={handleMapAdd}
        />
      </div>
    </div>
  );
}

export function CandidatesView() {
  return (
    <CandidatesViewProvider>
      <CandidatesInner />
    </CandidatesViewProvider>
  );
}
