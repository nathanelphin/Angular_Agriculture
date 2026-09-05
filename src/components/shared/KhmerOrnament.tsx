'use client';

import { cn } from '@/lib/utils';

/**
 * Khmer-inspired geometric ornament — a rice-grain lattice row.
 * Used sparingly as a cultural signature (dividers, footer, corners).
 */
export function KhmerOrnament({ className, width = 96 }: { className?: string; width?: number }) {
  return (
    <svg
      viewBox="0 0 96 16"
      width={width}
      height={16}
      className={cn('text-gold', className)}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      {/* diamond + grain motif, repeated */}
      {[0, 24, 48, 72].map((x) => (
        <g key={x} transform={`translate(${x}, 8)`}>
          <rect x="-5" y="-5" width="10" height="10" transform="rotate(45)" />
          <ellipse cx="0" cy="0" rx="1.6" ry="3" transform="rotate(45)" />
        </g>
      ))}
    </svg>
  );
}

/** Full-width subtle pattern band — Khmer textile inspired. */
export function KhmerPatternBand({ className }: { className?: string }) {
  return (
    <div className={cn('relative h-10 overflow-hidden', className)} aria-hidden="true">
      <svg className="h-full w-full text-forest/15" preserveAspectRatio="none">
        <defs>
          <pattern id="khmer-band" width="24" height="40" patternUnits="userSpaceOnUse">
            <rect x="9" y="9" width="22" height="22" transform="rotate(45 20 20)" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="0" cy="20" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#khmer-band)" />
      </svg>
    </div>
  );
}
