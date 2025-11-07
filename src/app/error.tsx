'use client';

import { useEffect } from 'react';

import { Button } from '@shared/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error boundary', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div>
        <h2 className="text-xl font-semibold text-foreground">エラーが発生しました</h2>
        <p className="mt-2 text-sm text-muted-foreground">ページの再読み込みをお試しください。</p>
      </div>
      <Button onClick={reset}>再読み込み</Button>
    </div>
  );
}
