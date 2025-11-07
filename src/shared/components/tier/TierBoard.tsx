'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StarIcon } from 'lucide-react';

import { Badge } from '@shared/components/ui/badge';
import { Card, CardContent } from '@shared/components/ui/card';
import type { Tier, TierBoardState, UISpot } from '@shared/types/ui';

export interface TierBoardProps {
  tiers: TierBoardState;
}

const tierMeta: Record<Tier, { label: string; className: string }> = {
  S: { label: 'S Tier', className: 'border-yellow-300 bg-yellow-50' },
  A: { label: 'A Tier', className: 'border-blue-300 bg-blue-50' },
  B: { label: 'B Tier', className: 'border-slate-300 bg-slate-50' },
};

interface TierLaneProps {
  tier: Tier;
  spots: UISpot[];
}

function TierLane({ tier, spots }: TierLaneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `tier-${tier}` });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border-2 p-4 transition ${tierMeta[tier].className}`}
      data-active={isOver}
    >
      <h3 className="mb-4 text-lg font-bold text-foreground">{tierMeta[tier].label}</h3>
      <SortableContext
        items={spots.map((spot) => `${tier}-${spot.id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex min-h-[120px] flex-col gap-3">
          {spots.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              ここにドラッグ
            </div>
          ) : (
            spots.map((spot) => <TierTile key={`${tier}-${spot.id}`} spot={spot} tier={tier} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
}

interface TierTileProps {
  spot: UISpot;
  tier: Tier;
}

function TierTile({ spot, tier }: TierTileProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${tier}-${spot.id}`,
    data: { spotId: spot.id, fromTier: tier },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="cursor-grab active:cursor-grabbing">
      <CardContent className="flex flex-col gap-2 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{spot.name}</p>
            {spot.address && (
              <p className="truncate text-xs text-muted-foreground">{spot.address}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {spot.rating !== undefined && (
              <span className="flex items-center gap-1 text-xs">
                <StarIcon className="size-3 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                {spot.rating.toFixed(1)}
              </span>
            )}
            {spot.memo && (
              <Badge variant="outline" className="max-w-[120px] truncate text-xs">
                {spot.memo}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {spot.distanceKm !== undefined && <span>{spot.distanceKm.toFixed(1)}km</span>}
          {spot.priceRange && <Badge variant="outline">{spot.priceRange}</Badge>}
        </div>
      </CardContent>
      <div {...attributes} {...listeners} className="sr-only" />
    </Card>
  );
}

export function TierBoard({ tiers }: TierBoardProps) {
  return (
    <div className="space-y-6">
      {(Object.keys(tiers) as Tier[]).map((tier) => (
        <TierLane key={tier} tier={tier} spots={tiers[tier]} />
      ))}
    </div>
  );
}
