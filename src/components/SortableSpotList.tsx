"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spot } from "@/types/spot";

interface SortableSpotItemProps {
  spot: Spot;
  index: number;
}

export function SortableSpotItem({ spot, index }: SortableSpotItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: spot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="cursor-move hover:border-blue-400">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">
                {index + 1}. {spot.name}
              </CardTitle>
              <CardDescription>{spot.address}</CardDescription>
            </div>
            <div className="ml-2 text-2xl text-gray-400">⋮⋮</div>
          </div>
        </CardHeader>
        <CardContent>
          {spot.rating && (
            <span className="text-sm text-gray-600">⭐ {spot.rating}</span>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

