'use client';

import { SpotCard } from '@shared/components/spot/SpotCard';
import { Button } from '@shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog';
import type { UISpot } from '@shared/types/ui';

export interface ReplaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCandidates: UISpot[];
  newSpot: UISpot;
  onReplace: (index: number) => void;
}

export function ReplaceDialog({
  open,
  onOpenChange,
  currentCandidates,
  newSpot,
  onReplace,
}: ReplaceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl space-y-6">
        <DialogHeader>
          <DialogTitle>候補が上限に達しました</DialogTitle>
          <DialogDescription>
            新しいスポットを追加するには、既存の候補のいずれかを置き換えてください。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">追加予定のスポット</h3>
          <SpotCard spot={newSpot} showMeta actionLabel="追加" selected={false} />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">入れ替える候補を選択</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {currentCandidates.map((spot, index) => (
              <div key={spot.id} className="relative">
                <SpotCard
                  spot={spot}
                  showMeta
                  actionLabel="入れ替え"
                  selected={false}
                  onToggle={() => onReplace(index)}
                />
                <Button
                  className="absolute bottom-4 right-4"
                  size="sm"
                  onClick={() => onReplace(index)}
                >
                  入れ替え
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
