'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutStepperProps {
  steps: string[];
  current: number; // 1-based
  onStepClick?: (step: number) => void;
  className?: string;
}

/**
 * Editorial checkout progress — numbered circles joined by hairlines.
 * Completed steps are clickable to jump back.
 */
export function CheckoutStepper({ steps, current, onStepClick, className }: CheckoutStepperProps) {
  return (
    <ol className={cn('flex items-center', className)} aria-label="Checkout progress">
      {steps.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        const clickable = done && Boolean(onStepClick);
        return (
          <li
            key={label}
            className={cn('flex items-center gap-3', i < steps.length - 1 ? 'flex-1' : 'shrink-0')}
          >
            <button
              type="button"
              onClick={clickable ? () => onStepClick?.(step) : undefined}
              disabled={!clickable}
              aria-current={active ? 'step' : undefined}
              aria-label={`${label} — ${active ? 'current step' : done ? 'completed step' : 'upcoming step'}`}
              className={cn('flex items-center gap-3', clickable ? 'cursor-pointer' : 'cursor-default')}
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center border text-xs font-semibold transition-colors duration-300',
                  done && 'border-forest bg-forest text-ivory',
                  active && 'border-forest bg-gold/10 text-forest',
                  !done && !active && 'border-charcoal/20 text-stone',
                )}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={2} /> : step}
              </span>
              <span
                className={cn(
                  'hidden text-[11px] font-bold uppercase tracking-[0.24em] sm:block',
                  active && 'text-forest',
                  done && 'text-charcoal',
                  !done && !active && 'text-stone',
                )}
              >
                {label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn('h-px flex-1 transition-colors duration-300', done ? 'bg-forest/50' : 'bg-charcoal/15')}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
