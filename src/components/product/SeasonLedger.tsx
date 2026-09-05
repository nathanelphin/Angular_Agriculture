'use client';

import type { Product } from '@/lib/types';
import { useLang } from '@/lib/stores/lang';
import {
  hasSeason,
  isInSeason,
  monthName,
  MONTH_LETTERS,
  nextSeasonMonth,
  seasonRangeLabel,
} from '@/lib/season';
import { cn } from '@/lib/utils';

interface SeasonLedgerProps {
  product: Product;
  className?: string;
}

/**
 * Harvest Window — a quiet editorial ledger of the twelve months, with the
 * gather-months inked in gold. Tells the shopper when this harvest actually
 * leaves the fields, and whether the fields are gathering it right now.
 */
export function SeasonLedger({ product, className }: SeasonLedgerProps) {
  const { t, lang } = useLang();

  if (!hasSeason(product)) return null;

  const inSeason = isInSeason(product);
  const range = seasonRangeLabel(product, lang);
  const backMonth = monthName(nextSeasonMonth(product), lang);

  return (
    <div
      className={cn('border border-charcoal/10 bg-parchment/40 p-5', className)}
      aria-label={`${t('season.eyebrow')}: ${range}`}
    >
      {/* Header — eyebrow + live status */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="eyebrow text-stone">{t('season.eyebrow')}</p>
        {inSeason ? (
          <p
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-forest"
            aria-live="polite"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" aria-hidden="true" />
            {t('season.inSeason')}
          </p>
        ) : (
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-stone">
            <span className="h-1.5 w-1.5 rounded-full bg-stone/50" aria-hidden="true" />
            {t('season.resting', { month: backMonth })}
          </p>
        )}
      </div>

      {/* The twelve months */}
      <div className="mt-4 grid grid-cols-12" role="img">
        {MONTH_LETTERS.map((letter, i) => {
          const month = i + 1;
          const active = (product.harvestMonths ?? []).includes(month);
          return (
            <span
              key={month}
              aria-hidden="true"
              className={cn(
                'flex h-9 items-center justify-center border-r border-t border-b text-[10px] font-bold uppercase tracking-wide transition-colors duration-300',
                'border-charcoal/12 first:border-l',
                active
                  ? 'bg-gold/90 text-forest-deep'
                  : 'bg-transparent text-stone/60',
              )}
            >
              {letter}
            </span>
          );
        })}
      </div>

      {/* Caption */}
      <p className="mt-3 text-xs leading-relaxed text-stone">
        {t('season.pickedIn', { range })}
        {inSeason ? ` ${t('season.captionNow')}` : ''}
      </p>
    </div>
  );
}
