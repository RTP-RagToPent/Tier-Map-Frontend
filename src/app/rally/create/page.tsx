"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SortableSpotItem } from "@/components/SortableSpotList";
import { Spot } from "@/types/spot";

function CreateRallyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const region = searchParams.get("region") || "";
  const genre = searchParams.get("genre") || "";
  const spotIds = searchParams.get("spots")?.split(",") || [];

  const [rallyName, setRallyName] = useState(`${region} ${genre}ラリー`);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // 選択されたスポットのデータを取得（モック）
    // 実際にはAPIから取得またはstateから受け渡し
    const mockSpots: Spot[] = spotIds.map((id, idx) => ({
      id,
      name: `スポット ${String.fromCharCode(65 + idx)}`,
      address: `${region} ${idx + 1}-${idx + 1}-${idx + 1}`,
      rating: 4.0 + idx * 0.1,
      lat: 35.6812 + idx * 0.01,
      lng: 139.7671 + idx * 0.01,
    }));
    setSpots(mockSpots);
    setLoading(false);
  }, [spotIds, region]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSpots((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    // ラリーを保存（モック）
    const rallyId = `rally-${Date.now()}`;
    const rally = {
      id: rallyId,
      name: rallyName,
      region,
      genre,
      spots,
      createdAt: new Date().toISOString(),
      status: "draft" as const,
    };

    // TODO: 実際のAPI呼び出しでラリーを保存
    console.log("Rally saved:", rally);

    // アナリティクスイベント送信
    const { analytics } = await import("@/lib/analytics");
    await analytics.rallyStarted(rallyId);

    // ラリー詳細ページまたは一覧ページへ遷移
    alert(`ラリー「${rallyName}」を作成しました！`);
    router.push(`/rally/${rallyId}`);
  };

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
          <Button onClick={() => router.back()} className="mt-4">
            戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">ラリーを作成</h1>
        <p className="mt-2 text-gray-600">
          スポットをドラッグして順番を入れ替えられます
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
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            訪問順（{spots.length}件）
          </h2>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={spots.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {spots.map((spot, index) => (
                  <SortableSpotItem key={spot.id} spot={spot} index={index} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="flex gap-4">
          <Button onClick={() => router.back()} variant="outline" className="flex-1">
            キャンセル
          </Button>
          <Button onClick={handleSave} className="flex-1">
            ラリーを保存
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CreateRallyPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-gray-600">読み込み中...</p>
      </div>
    }>
      <CreateRallyContent />
    </Suspense>
  );
}

