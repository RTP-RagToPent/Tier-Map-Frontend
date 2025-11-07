'use client';

import { StarIcon } from 'lucide-react';

import { cn } from '@shared/lib/utils';

export interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<NonNullable<RatingStarsProps['size']>, string> = {
  sm: 'size-5',
  md: 'size-6',
  lg: 'size-8',
};

export function RatingStars({ value, onChange, readonly = false, size = 'md' }: RatingStarsProps) {
  const maxStars = 5;

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="評価">
      {Array.from({ length: maxStars }, (_, index) => {
        const starValue = index + 1;
        const filled = starValue <= value;

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => !readonly && onChange?.(starValue)}
            disabled={readonly}
            className={cn(
              'rounded transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              !readonly && 'cursor-pointer hover:scale-110',
              sizeClasses[size]
            )}
            aria-label={`${starValue}つ星`}
            aria-pressed={filled}
            role="radio"
          >
            <StarIcon
              className={cn(
                sizeClasses[size],
                filled ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted-foreground'
              )}
              aria-hidden="true"
            />
          </button>
        );
      })}
      <span className="ml-2 text-sm font-medium text-muted-foreground" aria-live="polite">
        {value.toFixed(1)}
      </span>
    </div>
  );
}
