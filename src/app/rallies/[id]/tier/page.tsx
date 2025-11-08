'use client';

import { DndContext, DragOverlay } from '@dnd-kit/core';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { TierBoard } from '@shared/components/tier/TierBoard';
import { Button } from '@shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';

import { useTierPage } from '@features/tier/hooks/useTierPage';

export default function TierPage() {
  const params = useParams();
  const router = useRouter();
  const rallyId = params.id as string;

  const {
    rally,
    loading,
    error,
    tiers,
    sensors,
    activeId,
    activeSpot,
    average,
    handleDragStart,
    handleDragEnd,
  } = useTierPage(rallyId);

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

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="p-6">
          <TierBoard tiers={tiers} />
        </div>
        <DragOverlay>
          {activeSpot && activeId ? (
            <div
              className="rounded-lg px-4 py-2 text-sm font-medium min-w-[100px] text-center opacity-90"
              style={{
                backgroundColor: '#C9A882',
                color: '#1f2937',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
                transform: 'rotate(5deg)',
              }}
            >
              {activeSpot.name}
            </div>
          ) : null}
        </DragOverlay>
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
