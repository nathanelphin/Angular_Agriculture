'use client';

import { Check, ClipboardCheck, PackageCheck, Sprout, Truck } from 'lucide-react';
import { useLang } from '@/lib/stores/lang';
import { cn } from '@/lib/utils';

// ─── Order timeline — confirmed → packing → on the road → delivered ──────────

const STEPS = [
  { key: 'confirmed', icon: ClipboardCheck },
  { key: 'packing', icon: PackageCheck },
  { key: 'transit', icon: Truck },
  { key: 'delivered', icon: Sprout },
] as const;

/**
 * Demo fulfilment timeline shown on the confirmation page. Step 1 is always
 * active for a freshly placed order; the remaining steps are visual promise.
 */
export function OrderTimeline({ etaLabel }: { etaLabel: string }) {
  const { t, lang } = useLang();

  const labels: Record<(typeof STEPS)[number]['key'], string> = {
    confirmed: t('track.confirmed'),
    packing: t('track.packing'),
    transit: t('track.transit'),
    delivered: t('track.delivered'),
  };

  return (
    <div aria-label={t('track.title')}>
      <p className="eyebrow text-stone">{t('track.title')}</p>
      <ol className="mt-6 grid grid-cols-4 gap-2">
        {STEPS.map((step, i) => {
          const active = i === 0; // fresh order — first stage live
          const done = i === 0;
          const Icon = step.icon;
          return (
            <li key={step.key} className="relative flex flex-col items-center text-center">
              {/* connector */}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute left-1/2 top-6 hidden h-px w-full sm:block',
                    i === 0 ? 'bg-forest' : 'bg-charcoal/15',
                  )}
                />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  'relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-ivory transition-colors duration-500',
                  done ? 'border-forest bg-forest text-ivory' : active ? 'border-forest text-forest' : 'border-charcoal/15 text-stone',
                )}
              >
                {done ? <Check className="h-5 w-5" strokeWidth={2} /> : <Icon className="h-5 w-5" strokeWidth={1.5} />}
              </span>
              <span
                className={cn(
                  'mt-3 text-[9px] font-bold uppercase tracking-[0.16em] sm:text-[10px]',
                  done ? 'text-forest' : 'text-stone',
                )}
              >
                {labels[step.key]}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-5 text-center text-xs italic text-stone">
        {lang === 'kh'
          ? `ការដឹកជញ្ជូនរំពឹងទុក៖ ${etaLabel}`
          : `Estimated arrival: ${etaLabel}`}
      </p>
    </div>
  );
}
