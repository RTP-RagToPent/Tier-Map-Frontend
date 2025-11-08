'use client';

import { useDroppable } from '@dnd-kit/core';
import { horizontalListSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { Tier, TierBoardState, UISpot } from '@shared/types/ui';

export interface TierBoardProps {
  tiers: TierBoardState;
}

// ティアごとの色設定（上に上がるほど暖色系、濃くニューモフィズム的）
const tierColors: Record<
  Tier,
  { bg: string; labelBg: string; itemBg: string; textColor: string; bgGradient?: string }
> = {
  S: {
    bg: '#FFB3C1', // 濃い暖色ピンク（暖色系）
    labelBg: '#FF9FAF', // より濃い暖色ピンク
    itemBg: '#FFD6E0', // 明るい暖色ピンク
    textColor: 'text-gray-900',
  },
  A: {
    bg: '#FFD4A3', // 濃い暖色オレンジ（暖色系）
    labelBg: '#FFC085', // より濃い暖色オレンジ
    itemBg: '#FFE8CC', // 明るい暖色オレンジ
    textColor: 'text-gray-900',
  },
  B: {
    bg: '#FFE8B3', // 濃い暖色金色（暖色系）
    labelBg: '#FFD99A', // より濃い暖色金色
    itemBg: '#FFF4E0', // 明るい暖色金色
    textColor: 'text-gray-900',
  },
};

interface TierRowProps {
  tier: Tier;
  spots: UISpot[];
  color: { bg: string; labelBg: string; itemBg: string; textColor: string; bgGradient?: string };
}

function TierRow({ tier, spots, color }: TierRowProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `tier-${tier}` });

  // 虹色グラデーションの場合はbackground、それ以外はbackgroundColorを使用
  const bgStyle = color.bgGradient ? { background: color.bg } : { backgroundColor: color.bg };
  const labelBgStyle = color.bgGradient
    ? { background: color.labelBg }
    : { backgroundColor: color.labelBg };

  return (
    <div
      ref={setNodeRef}
      className="flex items-center rounded-lg overflow-hidden transition-all"
      style={{
        ...bgStyle,
        boxShadow: isOver
          ? '8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.8)'
          : '6px 6px 12px rgba(0, 0, 0, 0.08), -6px -6px 12px rgba(255, 255, 255, 0.9)',
      }}
    >
      {/* 左側のティアラベル */}
      <div
        className="flex items-center justify-center min-w-[80px] w-[80px] h-20 font-bold text-5xl"
        style={{
          ...labelBgStyle,
          boxShadow:
            'inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -4px -4px 8px rgba(255, 255, 255, 0.5)',
        }}
      >
        <span className={color.textColor}>{tier}</span>
      </div>

      {/* 右側のアイテムエリア */}
      <div className="flex-1 p-3 min-h-[80px]">
        <SortableContext
          items={spots.map((spot) => `${tier}-${spot.id}`)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-wrap gap-2">
            {spots.length === 0 ? (
              <div
                className="flex-1 flex min-h-[60px] items-center justify-center rounded-lg text-sm"
                style={{
                  ...(color.itemBg.startsWith('rgba') || color.itemBg.startsWith('linear-gradient')
                    ? { background: color.itemBg }
                    : { backgroundColor: color.itemBg }),
                  color: color.textColor === 'text-white' ? '#fff' : '#1f2937',
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
                  textColor={color.textColor}
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
  textColor: string;
}

function TierItem({ spot, tier, itemBg, textColor }: TierItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${tier}-${spot.id}`,
    data: { spotId: spot.id, fromTier: tier },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const itemBgStyle =
    itemBg.startsWith('rgba') || itemBg.startsWith('linear-gradient')
      ? { background: itemBg }
      : { backgroundColor: itemBg };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing rounded-lg px-4 py-2 text-sm font-medium transition-all min-w-[100px] text-center"
      style={{
        ...style,
        ...itemBgStyle,
        color: textColor === 'text-white' ? '#fff' : '#1f2937',
        boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.8)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {spot.name}
    </div>
  );
}

export function TierBoard({ tiers }: TierBoardProps) {
  return (
    <div className="space-y-3">
      <TierRow tier="S" spots={tiers.S} color={tierColors.S} />
      <TierRow tier="A" spots={tiers.A} color={tierColors.A} />
      <TierRow tier="B" spots={tiers.B} color={tierColors.B} />
    </div>
  );
}
