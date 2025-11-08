'use client';

import { useState } from 'react';

import { Button } from '@shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';

export interface CustomGenreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (genre: string) => void;
  existingCustomGenres?: string[];
}

export function CustomGenreDialog({
  open,
  onOpenChange,
  onAdd,
  existingCustomGenres = [],
}: CustomGenreDialogProps) {
  const [customGenre, setCustomGenre] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmed = customGenre.trim();

    if (!trimmed) {
      setError('ジャンル名を入力してください');
      return;
    }

    if (trimmed.length > 20) {
      setError('ジャンル名は20文字以内で入力してください');
      return;
    }

    if (existingCustomGenres.includes(trimmed)) {
      setError('このジャンルは既に追加されています');
      return;
    }

    setError(null);
    onAdd(trimmed);
    setCustomGenre('');
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCustomGenre('');
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>カスタムジャンルを追加</DialogTitle>
          <DialogDescription>
            検索したいジャンル名を入力してください（最大20文字）
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-genre">ジャンル名</Label>
            <Input
              id="custom-genre"
              type="text"
              value={customGenre}
              onChange={(e) => {
                setCustomGenre(e.target.value);
                setError(null);
              }}
              placeholder="例: パンケーキ、ホルモン"
              maxLength={20}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              aria-invalid={error !== null}
              aria-describedby={error ? 'custom-genre-error' : undefined}
            />
            {error && (
              <p id="custom-genre-error" className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={!customGenre.trim()}>
            追加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
