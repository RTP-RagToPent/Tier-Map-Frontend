'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVerticalIcon } from 'lucide-react';

import { Badge } from '@shared/components/ui/badge';
import { Card, CardContent } from '@shared/components/ui/card';
import type { UISpot } from '@shared/types/ui';

export interface DnDListProps {
  items: UISpot[];
}

interface SortableItemProps {
  item: UISpot;
  index: number;
}

function SortableItem({ item, index }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="select-none shadow-sm">
      <CardContent className="flex items-center gap-4 px-4 py-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab rounded-md p-2 text-muted-foreground transition hover:bg-muted active:cursor-grabbing"
          aria-label={`${item.name}をドラッグして並び替え`}
        >
          <GripVerticalIcon className="size-4" aria-hidden="true" />
        </button>
        <Badge variant="outline" className="w-10 justify-center text-sm">
          {index + 1}
        </Badge>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
          {item.address && <p className="truncate text-xs text-muted-foreground">{item.address}</p>}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {item.distanceKm !== undefined && <span>{item.distanceKm.toFixed(1)}km</span>}
            {item.rating !== undefined && <span>★ {item.rating.toFixed(1)}</span>}
            {item.isOpen !== undefined && (
              <Badge
                variant={item.isOpen ? 'default' : 'secondary'}
                className={item.isOpen ? '!bg-black !text-white' : ''}
              >
                {item.isOpen ? '営業中' : '閉店'}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DnDList({ items }: DnDListProps) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <SortableItem key={item.id} item={item} index={index} />
      ))}
    </div>
  );
}
