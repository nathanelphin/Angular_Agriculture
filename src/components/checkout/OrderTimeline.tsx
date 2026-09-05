'use client';

import { useEffect, useState } from 'react';
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
 * Fulfilment stage derived from order age. The demo accelerates real-world
 * fulfilment so a placed order visibly progresses: confirmed immediately,
 * packing after 2 min, on the road after 5 min, delivered after 9 min.
 */
const STAGE_MINUTES = [0, 2, 5, 9] as const;

export function orderStageIndex(createdAt: string): number {
  const placed = new Date(createdAt).getTime();
  if (Number.isNaN(placed)) return 0;
  const minutes = (Date.now() - placed) / 60_000;
  let stage = 0;
  for (let i = STAGE_MINUTES.length - 1; i >= 0; i -= 1) {
    if (minutes >= STAGE_MINUTES[i]) {
      stage = i;
      break;
    }
  }
  return stage;
}

interface OrderTimelineProps {
  etaLabel: string;
  /** ISO timestamp the order was placed — drives live stage advancement. */
  placedAt: string;
}

/**
 * Live fulfilment timeline. The active stage follows the order's age and
 * re-checks every 30 s, so a demo order visibly advances while the page is
 * open. Steps before the active one render as done; later steps stay pending.
 */
export function OrderTimeline({ etaLabel, placedAt }: OrderTimelineProps) {
  const { t, lang } = useLang();
  const [, setTick] = useState(0);

  // Re-evaluate the derived stage periodically while the view is open.
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const activeStage = orderStageIndex(placedAt);

  const labels: Record<(typeof STEPS)[number]['key'], string> = {
    confirmed: t('track.confirmed'),
    packing: t('track.packing'),
    transit: t('track.transit'),
    delivered: t('track.delivered'),
  };

  return (
    <div aria-label={t('track.title')}>
      <div className="flex items-center justify-between gap-4">
        <p className="eyebrow text-stone">{t('track.title')}</p>
        <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-forest">
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-forest" />
          </span>
          {t('track.live')}
        </span>
      </div>
      <ol className="mt-6 grid grid-cols-4 gap-2">
        {STEPS.map((step, i) => {
          const done = i < activeStage;
          const active = i === activeStage;
          const Icon = step.icon;
          return (
            <li key={step.key} className="relative flex flex-col items-center text-center">
              {/* connector */}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute left-1/2 top-6 hidden h-px w-full sm:block',
                    i < activeStage ? 'bg-forest' : 'bg-charcoal/15',
                  )}
                />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  'relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-ivory transition-colors duration-500',
                  done && 'border-forest bg-forest text-ivory',
                  active && !done && 'border-forest text-forest shadow-[0_0_0_5px_rgba(28,58,42,0.08)]',
                  !done && !active && 'border-charcoal/15 text-stone',
                )}
              >
                {done ? (
                  <Check className="h-5 w-5" strokeWidth={2} />
                ) : (
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                )}
                {active && !done && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full border-2 border-ivory bg-gold"
                  />
                )}
              </span>
              <span
                className={cn(
                  'mt-3 text-[9px] font-bold uppercase tracking-[0.16em] sm:text-[10px]',
                  done || active ? 'text-forest' : 'text-stone',
                )}
              >
                {labels[step.key]}
              </span>
              {active && (
                <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.2em] text-gold">
                  {t('track.live')}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-5 text-center text-xs italic text-stone">
        {lang === 'kh'
          ? `ការដឹកជញ្ជូនរំពឹងទុក៖ ${etaLabel}`
          : `Estimated arrival: ${etaLabel}`}
      </p>
      <p className="mt-1 text-center text-[10px] text-stone/80">{t('track.demoNote')}</p>
    </div>
  );
}
