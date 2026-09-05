'use client';

import { Sprout } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useLang } from '@/lib/stores/lang';
import { useRouterStore } from '@/lib/stores/router';
import { hasSeason, isInSeason, monthName, MONTH_LETTERS, nextSeasonMonth } from '@/lib/season';
import { cn } from '@/lib/utils';

interface SeasonCalendarProps {
  products: Product[];
  className?: string;
}

/**
 * The Year's Harvest — a month-at-a-glance ledger for the storekeeper's desk.
 * One row per seasonal harvest, twelve columns of months; gold cells mark
 * when the fields gather each crop, and the current month wears the forest
 * band so "what's in the fields today" reads at a glance.
 */
export function SeasonCalendar({ products, className }: SeasonCalendarProps) {
  const { t, lang } = useLang();
  const navigate = useRouterStore((s) => s.navigate);

  const seasonal = products.filter(hasSeason);
  const currentMonth = new Date().getMonth() + 1;
  const inSeasonNow = seasonal.filter((p) => isInSeason(p));

  if (seasonal.length === 0) return null;

  return (
    <section
      className={cn('card-editorial p-6 md:p-8', className)}
      aria-label={t('admin.calendar.title')}
    >
      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="eyebrow flex items-center gap-2.5 text-moss">
          <Sprout className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          {t('admin.calendar.title')}
        </h2>
        <p
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-forest"
          aria-live="polite"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" aria-hidden="true" />
          {t('admin.calendar.inSeasonCount', { n: inSeasonNow.length })}
        </p>
      </div>

      {/* Ledger */}
      <div className="mt-6 overflow-x-auto pb-1">
        <div className="min-w-[620px]">
          {/* Month header */}
          <div className="grid grid-cols-[minmax(150px,1.6fr)_repeat(12,1fr)]" aria-hidden="true">
            <span className="pr-3 text-[8px] font-bold uppercase tracking-[0.2em] text-stone">
              {t('admin.calendar.legend')}
            </span>
            {MONTH_LETTERS.map((letter, i) => {
              const month = i + 1;
              const isNow = month === currentMonth;
              return (
                <span
                  key={month}
                  className={cn(
                    'flex flex-col items-center gap-0.5 border-b pb-1.5 text-[9px] font-bold uppercase tracking-wide',
                    isNow ? 'border-forest text-forest' : 'border-charcoal/15 text-stone',
                  )}
                >
                  {letter}
                  {isNow && (
                    <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />
                  )}
                </span>
              );
            })}
          </div>

          {/* Product rows */}
          <ul className="sr-only">
            {seasonal.map((p) => (
              <li key={p.id}>
                {lang === 'kh' && p.nameKh ? p.nameKh : p.name} —{' '}
                {isInSeason(p)
                  ? t('season.inSeason')
                  : t('season.resting', { month: monthName(nextSeasonMonth(p), lang) })}
              </li>
            ))}
          </ul>

          <div>
            {seasonal.map((p) => {
              const inSeason = isInSeason(p);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => navigate({ name: 'product', slug: p.slug })}
                  className="group grid w-full cursor-pointer grid-cols-[minmax(150px,1.6fr)_repeat(12,1fr)] items-center border-b border-charcoal/8 text-left transition-colors last:border-0 hover:bg-parchment/50 focus-visible:outline-2 focus-visible:outline-gold"
                  title={lang === 'kh' && p.nameKh ? p.nameKh : p.name}
                >
                  <span className="min-w-0 py-2 pr-3">
                    <span
                      className={cn(
                        'block truncate text-[11px] font-semibold transition-colors',
                        inSeason ? 'text-forest' : 'text-charcoal/80',
                        'group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4',
                      )}
                    >
                      {lang === 'kh' && p.nameKh ? p.nameKh : p.name}
                    </span>
                    <span className="block truncate text-[9px] uppercase tracking-[0.12em] text-stone">
                      {p.farmerName}
                    </span>
                  </span>
                  {MONTH_LETTERS.map((_, i) => {
                    const month = i + 1;
                    const active = (p.harvestMonths ?? []).includes(month);
                    const isNow = month === currentMonth;
                    return (
                      <span key={month} className="flex justify-center py-2" aria-hidden="true">
                        <span
                          className={cn(
                            'flex h-4 w-4 items-center justify-center rounded-[1px] transition-colors duration-300',
                            active
                              ? isNow
                                ? 'bg-gold shadow-[0_0_0_1.5px_var(--color-forest)]'
                                : 'bg-gold/80 group-hover:bg-gold'
                              : isNow
                                ? 'bg-forest/[0.07]'
                                : 'bg-transparent',
                          )}
                        >
                          {active && isNow && (
                            <span className="h-1 w-1 animate-pulse rounded-full bg-forest-deep" />
                          )}
                        </span>
                      </span>
                    );
                  })}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="mt-4 text-[11px] leading-relaxed text-stone">
        {t('admin.calendar.caption')}
      </p>
    </section>
  );
}
