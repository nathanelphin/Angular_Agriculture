'use client';

import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  value: number; // 0–5
  size?: 'sm' | 'md';
  showValue?: boolean;
  reviews?: number;
  reviewsLabel?: string;
  className?: string;
}

export function RatingStars({
  value,
  size = 'sm',
  showValue = false,
  reviews,
  reviewsLabel,
  className,
}: RatingStarsProps) {
  const px = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5';
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = value >= i + 1;
    const half = !filled && value >= i + 0.5;
    return { filled, half, key: i };
  });

  return (
    <div className={cn('flex items-center gap-2', className)} aria-label={`Rated ${value} out of 5`}>
      <div className="flex items-center gap-0.5">
        {stars.map(({ filled, half, key }) =>
          half ? (
            <span key={key} className="relative inline-flex">
              <Star className={cn(px, 'text-charcoal/15')} strokeWidth={1.5} />
              <StarHalf className={cn(px, 'absolute inset-0 text-gold')} strokeWidth={1.5} />
            </span>
          ) : (
            <Star
              key={key}
              className={cn(px, filled ? 'fill-gold text-gold' : 'text-charcoal/15')}
              strokeWidth={1.5}
            />
          ),
        )}
      </div>
      {showValue && <span className="text-xs font-medium text-charcoal/80">{value.toFixed(1)}</span>}
      {typeof reviews === 'number' && (
        <span className="text-xs text-stone">
          ({reviews} {reviewsLabel ?? 'reviews'})
        </span>
      )}
    </div>
  );
}
