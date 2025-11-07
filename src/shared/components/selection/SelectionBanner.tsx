'use client';

import { Button } from '@shared/components/ui/button';

export interface SelectionBannerProps {
  count: number;
  max?: number;
  onProceed: () => void;
  proceedLabel?: string;
}

export function SelectionBanner({
  count,
  max = 5,
  onProceed,
  proceedLabel = '候補を確定',
}: SelectionBannerProps) {
  const disabled = count === 0;
  const reached = count >= max;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          選択中:
          <span className={`text-lg font-semibold ${reached ? 'text-primary' : 'text-foreground'}`}>
            {count}/{max}
          </span>
        </div>
        <Button onClick={onProceed} disabled={disabled} size="lg" className="min-w-[160px]">
          {proceedLabel}
        </Button>
      </div>
    </div>
  );
}
