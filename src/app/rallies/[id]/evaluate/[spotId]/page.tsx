'use client';

import { useParams, useRouter } from 'next/navigation';

import { EvaluationForm } from '@features/evaluation/components/EvaluationForm';
import { useRallyDetail } from '@features/rally/hooks/useRallyDetail';

export default function EvaluateSpotPage() {
  const params = useParams();
  const router = useRouter();
  const rallyId = params.id as string;
  const spotId = params.spotId as string;

  const { rally, loading, error } = useRallyDetail(rallyId);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error || !rally) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-md text-center">
          <p className="text-red-600">ラリー情報の取得に失敗しました</p>
          <button
            onClick={() => router.push('/rallies')}
            className="mt-4 text-blue-600 hover:underline"
          >
            ラリー一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  const spot = rally.spots.find((s) => s.id === spotId);

  if (!spot) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-md text-center">
          <p className="text-red-600">スポットが見つかりません</p>
          <button
            onClick={() => router.push(`/rallies/${rallyId}`)}
            className="mt-4 text-blue-600 hover:underline"
          >
            ラリー詳細に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <EvaluationForm
      spot={{
        id: spot.id,
        name: spot.name,
        address: '', // APIにaddressがない場合は空文字
        rating: spot.rating,
      }}
    />
  );
}
