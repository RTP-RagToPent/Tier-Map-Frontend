'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';
import { Spot } from '@shared/types/spot';

interface SortableSpotItemProps {
  spot: Spot;
  index: number;
}

export function SortableSpotItem({ spot, index }: SortableSpotItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: spot.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="cursor-move touch-none hover:border-blue-400 active:border-blue-500 active:shadow-md">
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-base sm:text-lg">
                {index + 1}. {spot.name}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{spot.address}</CardDescription>
            </div>
            <div className="ml-2 text-xl text-gray-400 sm:text-2xl">⋮⋮</div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {spot.rating && (
            <span className="text-xs text-gray-600 sm:text-sm">⭐ {spot.rating}</span>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
