'use client';

import { useMemo, useState } from 'react';

import { Badge } from '@shared/components/ui/badge';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { GENRES } from '@shared/types/genre';

import { CustomGenreDialog } from './CustomGenreDialog';

export interface SearchBarProps {
  region: string;
  genre: string;
  onRegionChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onSearch: () => void;
  customGenres?: string[];
  onAddCustomGenre?: (genre: string) => void;
  isValid?: boolean;
}

export function SearchBar({
  region,
  genre,
  onRegionChange,
  onGenreChange,
  onSearch,
  customGenres = [],
  onAddCustomGenre,
  isValid = true,
}: SearchBarProps) {
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);

  const genreBadges = useMemo(() => {
    const standardGenres = GENRES.map((g) => {
      // 「カスタム」ボタンの場合は特別な処理
      if (g === 'カスタム') {
        return (
          <Badge
            key={g}
            variant={isCustomDialogOpen ? 'default' : 'outline'}
            className="flex-shrink-0 cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-accent"
            onClick={() => setIsCustomDialogOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsCustomDialogOpen(true);
              }
            }}
            aria-pressed={isCustomDialogOpen}
          >
            {g}
          </Badge>
        );
      }
      return (
        <Badge
          key={g}
          variant={genre === g ? 'default' : 'outline'}
          className="flex-shrink-0 cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-accent"
          onClick={() => onGenreChange(g)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onGenreChange(g);
            }
          }}
          aria-pressed={genre === g}
        >
          {g}
        </Badge>
      );
    });

    // カスタムジャンルを追加
    const customGenreBadges = customGenres.map((customGenre) => (
      <Badge
        key={`custom-${customGenre}`}
        variant={genre === customGenre ? 'default' : 'outline'}
        className="flex-shrink-0 cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-accent"
        onClick={() => onGenreChange(customGenre)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onGenreChange(customGenre);
          }
        }}
        aria-pressed={genre === customGenre}
      >
        {customGenre}
      </Badge>
    ));

    return [...standardGenres, ...customGenreBadges];
  }, [genre, onGenreChange, customGenres, isCustomDialogOpen]);

  const handleAddCustomGenre = (newGenre: string) => {
    if (onAddCustomGenre) {
      onAddCustomGenre(newGenre);
    }
    setIsCustomDialogOpen(false);
  };

  return (
    <>
      <div className="sticky top-0 z-40 w-full border-b bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex-1">
              <Input
                type="text"
                value={region}
                onChange={(event) => onRegionChange(event.target.value)}
                placeholder="例: 渋谷区、新宿区"
                aria-label="地域を入力"
                className="h-14 min-h-[56px] text-base sm:h-10 sm:min-h-[40px] sm:text-sm"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] sm:flex-nowrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
              {genreBadges}
            </div>

            <Button
              onClick={onSearch}
              disabled={!isValid}
              className="h-14 min-h-[56px] w-full shrink-0 text-base sm:h-10 sm:min-h-[40px] sm:w-auto sm:text-sm"
              aria-disabled={!isValid}
            >
              検索
            </Button>
          </div>
        </div>
      </div>

      {onAddCustomGenre && (
        <CustomGenreDialog
          open={isCustomDialogOpen}
          onOpenChange={setIsCustomDialogOpen}
          onAdd={handleAddCustomGenre}
          existingCustomGenres={customGenres}
        />
      )}
    </>
  );
}
