'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'dark' | 'light';
  className?: string;
  compact?: boolean;
}

/** SOVANN FARM wordmark — rice grain emblem + editorial serif. */
export function Logo({ variant = 'dark', className, compact = false }: LogoProps) {
  const color = variant === 'dark' ? 'text-charcoal' : 'text-ivory';
  const accent = 'text-gold';

  return (
    <span className={cn('inline-flex items-center gap-2.5 select-none', color, className)}>
      <svg
        viewBox="0 0 40 40"
        className={cn('h-8 w-8 shrink-0', accent)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        aria-hidden="true"
      >
        {/* diamond frame */}
        <rect x="8" y="8" width="24" height="24" transform="rotate(45 20 20)" />
        {/* three rice grains */}
        <ellipse cx="20" cy="14.5" rx="1.7" ry="3.4" />
        <ellipse cx="15.8" cy="21.5" rx="1.7" ry="3.4" transform="rotate(-30 15.8 21.5)" />
        <ellipse cx="24.2" cy="21.5" rx="1.7" ry="3.4" transform="rotate(30 24.2 21.5)" />
      </svg>
      {!compact && (
        <span className="flex flex-col whitespace-nowrap leading-none">
          <span className="font-display text-[19px] font-bold tracking-[0.08em]">SOVANN FARM</span>
          <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.42em] opacity-70">
            Cambodia
          </span>
        </span>
      )}
    </span>
  );
}
