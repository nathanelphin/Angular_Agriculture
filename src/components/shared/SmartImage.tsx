'use client';

import { useState } from 'react';
import { Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';

const RATIOS: Record<string, string> = {
  square: 'aspect-square',
  portrait: 'aspect-[4/5]',
  tall: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/9]',
  cinema: 'aspect-[21/9]',
  none: '',
};

interface SmartImageProps {
  src: string;
  alt: string;
  ratio?: keyof typeof RATIOS;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Editorial image with parchment placeholder + graceful fallback.
 * Plain <img> keeps behaviour predictable for locally generated assets.
 */
export function SmartImage({
  src,
  alt,
  ratio = 'portrait',
  className,
  imgClassName,
  priority = false,
}: SmartImageProps) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-parchment',
        RATIOS[ratio],
        className,
      )}
    >
      {state !== 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center bg-parchment" aria-hidden="true">
          {state === 'error' ? (
            <Sprout className="h-8 w-8 text-moss/40" strokeWidth={1.25} />
          ) : (
            <div className="h-full w-full animate-pulse bg-gradient-to-br from-parchment via-ivory to-parchment" />
          )}
        </div>
      )}
      {state !== 'error' && (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setState('ready')}
          onError={() => setState('error')}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-700',
            state === 'ready' ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
        />
      )}
    </div>
  );
}
