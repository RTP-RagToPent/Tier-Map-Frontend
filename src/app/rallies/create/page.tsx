'use client';

import { Suspense } from 'react';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSearchParams } from 'next/navigation';

import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';

import { SortableSpotItem } from '@features/rally/components/SortableSpotList';
import { useCreateRally } from '@features/rally/hooks/useCreateRally';

function CreateRallyContent() {
  const searchParams = useSearchParams();
  const region = searchParams.get('region') || '';
  const genre = searchParams.get('genre') || '';
  const spotIds = searchParams.get('spots')?.split(',') || [];

  const {
    rallyName,
    setRallyName,
    spots,
    loading,
    saving,
    handleDragEnd,
    handleSave,
    handleCancel,
  } = useCreateRally({ region, genre, spotIds });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px以上移動したらドラッグ開始（誤タップ防止）
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (spots.length < 3 || spots.length > 5) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-md text-center">
          <p className="text-red-600">スポットは3〜5件選択してください</p>
          <Button onClick={handleCancel} className="mt-4">
            戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">ラリーを作成</h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          スポットを長押ししてドラッグ、または上下にスワイプして順番を入れ替えられます
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="rallyName" className="block text-sm font-medium text-gray-700">
            ラリー名
          </label>
          <Input
            id="rallyName"
            type="text"
            value={rallyName}
            onChange={(e) => setRallyName(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">訪問順（{spots.length}件）</h2>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={spots.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {spots.map((spot, index) => (
                  <SortableSpotItem key={spot.id} spot={spot} index={index} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button onClick={handleCancel} variant="outline" className="flex-1" disabled={saving}>
            キャンセル
          </Button>
          <Button onClick={handleSave} className="flex-1" disabled={saving}>
            {saving ? '保存中...' : 'ラリーを保存'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CreateRallyPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-gray-600">読み込み中...</p>
        </div>
      }
    >
      <CreateRallyContent />
    </Suspense>
  );
}
