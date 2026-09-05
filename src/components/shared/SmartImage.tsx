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
  /**
   * Classes for the hover-zoom wrapper (e.g. `group-hover:scale-105`).
   * Kept separate from the <img> so per-call transition utilities can never
   * override the load-in fade below.
   */
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Editorial image with parchment placeholder + blur-up fade-in + graceful
 * fallback. Plain <img> keeps behaviour predictable for locally generated
 * assets; the hover-zoom layer is separate so call sites can style it freely.
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
        <div className={cn('h-full w-full will-change-transform', imgClassName)}>
          <img
            src={src}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setState('ready')}
            onError={() => setState('error')}
            className={cn(
              'h-full w-full object-cover transition-[opacity,transform,filter] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform,filter]',
              state === 'ready'
                ? 'scale-100 opacity-100 blur-0'
                : 'scale-[1.04] opacity-0 blur-[6px]',
            )}
          />
        </div>
      )}
    </div>
  );
}
