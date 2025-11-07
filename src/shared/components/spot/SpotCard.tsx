'use client';

import { MapPinIcon, StarIcon } from 'lucide-react';
import Image from 'next/image';

import { Badge } from '@shared/components/ui/badge';
import { Button } from '@shared/components/ui/button';
import { Card, CardContent } from '@shared/components/ui/card';
import type { UISpot } from '@shared/types/ui';

export interface SpotCardProps {
  spot: UISpot;
  selected?: boolean;
  onToggle?: (spot: UISpot) => void;
  showMeta?: boolean;
  actionLabel?: string;
}

export function SpotCard({
  spot,
  selected = false,
  onToggle,
  showMeta = true,
  actionLabel = '追加',
}: SpotCardProps) {
  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-md ${
        selected ? 'ring-2 ring-primary' : 'ring-0'
      }`}
      aria-pressed={selected}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {spot.thumbnailUrl ? (
          <Image
            src={spot.thumbnailUrl}
            alt={spot.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <MapPinIcon className="size-10 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
      </div>
      <CardContent className="space-y-3 p-4">
        <div>
          <h3 className="text-base font-semibold leading-tight text-foreground">{spot.name}</h3>
          {spot.address && <p className="text-sm text-muted-foreground">{spot.address}</p>}
        </div>

        {showMeta && (
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {spot.rating ? (
              <span className="flex items-center gap-1 text-foreground">
                <StarIcon className="size-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                {spot.rating.toFixed(1)}
              </span>
            ) : null}
            {spot.distanceKm !== undefined && <span>{spot.distanceKm.toFixed(1)}km</span>}
            {spot.priceRange && <Badge variant="outline">{spot.priceRange}</Badge>}
            {spot.isOpen !== undefined && (
              <Badge variant={spot.isOpen ? 'default' : 'secondary'}>
                {spot.isOpen ? '営業中' : '閉店'}
              </Badge>
            )}
          </div>
        )}

        {onToggle && (
          <Button
            onClick={() => onToggle(spot)}
            variant={selected ? 'secondary' : 'default'}
            className="w-full"
          >
            {selected ? '選択済み' : actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
