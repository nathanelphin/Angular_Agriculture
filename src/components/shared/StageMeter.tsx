'use client';

import { cn } from '@/lib/utils';

// ─── SOVANN FARM — StageMeter, the little journey meter ─────────────────────
// A miniature fulfilment meter (confirmed → packing → transit → delivered)
// shared by the Storekeeper's Desk order rows and the account order cards so
// the whole shop speaks the same visual language about where a parcel is.

interface StageMeterProps {
  /** Derived stage index 0–3 (orderStageIndex). */
  stage: number;
  /** Human stage label rendered beneath the dots (already translated). */
  label: string;
  className?: string;
}

const STAGE_COUNT = 4;

export function StageMeter({ stage, label, className }: StageMeterProps) {
  const delivered = stage >= STAGE_COUNT - 1;
  const clamped = Math.min(Math.max(stage, 0), STAGE_COUNT - 1);

  return (
    <span className={cn('inline-flex flex-col gap-1.5 align-top', className)}>
      <span aria-hidden="true" className="flex items-center">
        {Array.from({ length: STAGE_COUNT }).map((_, i) => (
          <span key={i} className="flex items-center">
            {i > 0 && (
              <span
                className={cn(
                  'h-px w-3',
                  delivered ? 'bg-gold/70' : i <= clamped ? 'bg-forest' : 'bg-charcoal/15',
                )}
              />
            )}
            {i === clamped && !delivered ? (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-forest" />
              </span>
            ) : (
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  delivered
                    ? 'bg-gold'
                    : i < clamped
                      ? 'bg-forest'
                      : 'border border-charcoal/20 bg-transparent',
                )}
              />
            )}
          </span>
        ))}
      </span>
      <span
        className={cn(
          'text-[8px] font-bold uppercase tracking-[0.16em] whitespace-nowrap',
          delivered ? 'text-[#8a6d10]' : clamped > 0 ? 'text-forest' : 'text-stone',
        )}
      >
        {label}
      </span>
      {/* Screen readers get the stage as text; the meter is decoration. */}
      <span className="sr-only">
        {label} — {clamped + 1} of {STAGE_COUNT}
      </span>
    </span>
  );
}
