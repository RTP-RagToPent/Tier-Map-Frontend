'use client';

import { useDroppable } from '@dnd-kit/core';
import { horizontalListSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MapPinIcon } from 'lucide-react';

import type { Tier, TierBoardState, UISpot } from '@shared/types/ui';

export interface TierBoardProps {
  tiers: TierBoardState;
}

// 画像のデザインに合わせた色設定（コーラルレッド、薄い黄色、クリーム色）
const coralRed = '#FF6B6B'; // コーラルレッド
const paleYellow = '#FFF9C4'; // 薄い黄色
const cream = '#FFFEF7'; // クリーム色

const tierColors: Record<Tier, { bg: string; labelColor: string; itemBg: string }> = {
  S: {
    bg: paleYellow,
    labelColor: coralRed,
    itemBg: '#FFFACD', // より薄い黄色
  },
  A: {
    bg: paleYellow,
    labelColor: coralRed,
    itemBg: '#FFFACD',
  },
  B: {
    bg: paleYellow,
    labelColor: coralRed,
    itemBg: '#FFFACD',
  },
};

interface TierBlockProps {
  tier: Tier;
  spots: UISpot[];
  color: { bg: string; labelColor: string; itemBg: string };
  width: string; // 階段状にするための幅
}

function TierBlock({ tier, spots, color, width }: TierBlockProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `tier-${tier}` });

  return (
    <div
      ref={setNodeRef}
      className="rounded-xl transition-all"
      style={{
        width,
        backgroundColor: color.bg,
        boxShadow: isOver ? '0 4px 12px rgba(0, 0, 0, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginLeft: tier === 'A' ? '20px' : tier === 'S' ? '40px' : '0',
      }}
    >
      <div className="p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="text-4xl font-bold" style={{ color: color.labelColor }}>
            {tier}
          </span>
        </div>
        <SortableContext
          items={spots.map((spot) => `${tier}-${spot.id}`)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-wrap gap-2">
            {spots.length === 0 ? (
              <div
                className="flex min-h-[60px] w-full items-center justify-center rounded-lg text-sm text-gray-500"
                style={{
                  backgroundColor: color.itemBg,
                }}
              >
                ここにドラッグ
              </div>
            ) : (
              spots.map((spot) => (
                <TierItem
                  key={`${tier}-${spot.id}`}
                  spot={spot}
                  tier={tier}
                  itemBg={color.itemBg}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

interface TierItemProps {
  spot: UISpot;
  tier: Tier;
  itemBg: string;
}

function TierItem({ spot, tier, itemBg }: TierItemProps) {
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
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing rounded-lg px-3 py-2 text-sm font-medium transition-all min-w-[80px] text-center"
      style={{
        ...style,
        backgroundColor: itemBg,
        color: '#1f2937',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {spot.name}
    </div>
  );
}

export function TierBoard({ tiers }: TierBoardProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <div
        className="relative rounded-full"
        style={{
          width: '600px',
          height: '600px',
          backgroundColor: cream,
          border: '8px solid',
          borderColor: coralRed,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* 左側のピンアイコン（画像と同様の位置 - 左上の象限、より大きく中央寄り） */}
        <div className="absolute" style={{ left: '50px', top: '50px' }}>
          <MapPinIcon
            className="pin-bounce"
            style={{
              width: '150px',
              height: '150px',
              color: coralRed,
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
            }}
          />
        </div>

        {/* 右側のティアブロック（階段状） */}
        <div className="absolute right-8 top-1/2 flex -translate-y-1/2 flex-col items-end gap-4">
          <TierBlock tier="S" spots={tiers.S} color={tierColors.S} width="180px" />
          <TierBlock tier="A" spots={tiers.A} color={tierColors.A} width="220px" />
          <TierBlock tier="B" spots={tiers.B} color={tierColors.B} width="260px" />
        </div>
      </div>
    </div>
  );
}
