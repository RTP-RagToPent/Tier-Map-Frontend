'use client';

import Image from 'next/image';

import { RatingStars } from '@shared/components/rating/RatingStars';
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
    address?: string;
    thumbnailUrl?: string;
    distanceKm?: number;
  };
  onPrev?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
}

export function EvaluationForm({ spot, onPrev, onNext, onSkip }: EvaluationFormProps) {
  const {
    rating,
    setRating,
    memo,
    setMemo,
    isSubmitting,
    isValid,
    getRatingLabel,
    handleSubmit,
    handleCancel,
  } = useEvaluation();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8">
      <Card className="w-full max-w-3xl overflow-hidden shadow-2xl">
        <div className="relative h-52 w-full bg-muted">
          {spot.thumbnailUrl ? (
            <Image src={spot.thumbnailUrl} alt={spot.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl text-muted-foreground">
              📍
            </div>
          )}
        </div>
        <CardHeader className="gap-2">
          <CardTitle className="text-2xl font-bold text-foreground">{spot.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {spot.address || '住所情報はありません'}
          </CardDescription>
          {spot.distanceKm !== undefined && (
            <span className="text-xs text-muted-foreground">
              現在地から約 {spot.distanceKm.toFixed(1)}km
            </span>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">評価</h2>
            <RatingStars value={rating} onChange={setRating} size="lg" />
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">{getRatingLabel(rating)}</p>
            )}
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">メモ</h2>
            <textarea
              className="w-full rounded-xl border border-muted bg-background p-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="味や雰囲気、気づいたことを記録しましょう"
              rows={5}
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              disabled={isSubmitting}
            />
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              戻る
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={!isValid || isSubmitting}>
              {isSubmitting ? '保存中…' : '評価を保存'}
            </Button>
          </div>

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row">
            <Button variant="ghost" className="flex-1" onClick={onPrev} disabled={!onPrev}>
              前へ
            </Button>
            <Button variant="ghost" className="flex-1" onClick={onNext} disabled={!onNext}>
              次へ
            </Button>
            <Button variant="ghost" className="flex-1" onClick={onSkip}>
              後で評価
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
