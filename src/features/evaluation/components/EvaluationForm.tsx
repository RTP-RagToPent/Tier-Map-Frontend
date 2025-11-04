'use client';

import { Button } from '@shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';

import { useEvaluation } from '../hooks/useEvaluation';

interface EvaluationFormProps {
  spot: {
    id: string;
    name: string;
    address: string;
    rating?: number;
  };
}

export function EvaluationForm({ spot }: EvaluationFormProps) {
  const {
    rating,
    setRating,
    hoveredRating,
    setHoveredRating,
    memo,
    setMemo,
    isSubmitting,
    isValid,
    getRatingLabel,
    handleSubmit,
    handleCancel,
  } = useEvaluation();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{spot.name}</CardTitle>
          <CardDescription>{spot.address}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 星評価 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">評価（必須）</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="text-4xl transition-all hover:scale-110 focus:outline-none"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={isSubmitting}
                >
                  {value <= (hoveredRating || rating) ? (
                    <span className="text-yellow-400">★</span>
                  ) : (
                    <span className="text-gray-300">☆</span>
                  )}
                </button>
              ))}
            </div>
            {rating > 0 && <p className="mt-2 text-sm text-gray-600">{getRatingLabel(rating)}</p>}
          </div>

          {/* メモ */}
          <div>
            <label htmlFor="memo" className="mb-2 block text-sm font-medium text-gray-700">
              メモ（任意）
            </label>
            <textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="感想やメモを記入してください"
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          {/* アクションボタン */}
          <div className="flex gap-4">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={!isValid || isSubmitting}>
              {isSubmitting ? '保存中...' : '評価を保存'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
