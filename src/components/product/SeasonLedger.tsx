'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { BellRing, Check, Sprout } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/lib/types';
import { useLang } from '@/lib/stores/lang';
import { fetchHarvestReservations, fetchHarvestWatchers, subscribeHarvestAlert } from '@/lib/api';
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Harvest Window — a quiet editorial ledger of the twelve months, with the
 * gather-months inked in gold. Tells the shopper when this harvest actually
 * leaves the fields, and whether the fields are gathering it right now.
 * While the fields rest, the ledger takes names — "notify me at harvest".
 */
export function SeasonLedger({ product, className }: SeasonLedgerProps) {
  const { t, lang } = useLang();
  const [email, setEmail] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [sending, setSending] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [watchers, setWatchers] = useState(0);
  const [holds, setHolds] = useState(0);

  const backMonth = monthName(nextSeasonMonth(product), lang);

  // How many neighbours are already waiting (only worth asking while resting).
  useEffect(() => {
    if (isInSeason(product) || !hasSeason(product)) return;
    let cancelled = false;
    void fetchHarvestWatchers(product.id).then((n) => {
      if (!cancelled) setWatchers(n);
    });
    void fetchHarvestReservations(product.id).then((r) => {
      if (!cancelled) setHolds(r.holds);
    });
    return () => {
      cancelled = true;
    };
  }, [product]);

  if (!hasSeason(product)) return null;

  const inSeason = isInSeason(product);
  const range = seasonRangeLabel(product, lang);

  const handleNotify = async (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setSending(true);
    const res = await subscribeHarvestAlert(product.id, value);
    setSending(false);
    if (res.ok) {
      setSubscribed(true);
      setWatchers(res.watchers ?? watchers + 1);
      toast.success(t('season.notify.success'));
    } else {
      toast.error(res.message ?? t('season.notify.error'));
    }
  };

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

      {/* ── Notify me at harvest — the ledger takes names while the fields rest ── */}
      {!inSeason && (
        <div className="mt-4 border-t border-charcoal/10 pt-4" aria-live="polite">
          {subscribed ? (
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-gold/60 bg-gold/10"
                aria-hidden="true"
              >
                <Check className="h-3.5 w-3.5 text-forest" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-forest">{t('season.notify.success')}</p>
                <p className="mt-1 text-xs leading-relaxed text-stone">
                  {t('season.notify.note', { month: backMonth })}
                  {watchers > 1 && (
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-clay">
                      {t('season.notify.watchers', { n: watchers })}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-terracotta">
                <BellRing className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
                {t('season.notify.eyebrow')}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-stone">
                {t('season.notify.body')}
              </p>
              <form
                onSubmit={handleNotify}
                className="mt-3 flex items-stretch gap-0"
                aria-label={t('season.notify.eyebrow')}
                noValidate
              >
                <label htmlFor={`notify-email-${product.id}`} className="sr-only">
                  {t('season.notify.placeholder')}
                </label>
                <input
                  id={`notify-email-${product.id}`}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setInvalid(false);
                  }}
                  placeholder={t('season.notify.placeholder')}
                  autoComplete="email"
                  aria-invalid={invalid}
                  aria-describedby={invalid ? `notify-error-${product.id}` : undefined}
                  className={cn(
                    'h-10 min-w-0 flex-1 border bg-transparent px-3 text-xs text-charcoal placeholder:text-stone/60 focus:outline-none transition-colors duration-300',
                    invalid
                      ? 'border-terracotta focus:border-terracotta'
                      : 'border-charcoal/20 focus:border-forest',
                  )}
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-gold h-10 shrink-0 px-4 text-[9px] disabled:cursor-wait disabled:opacity-60"
                >
                  {sending ? '…' : t('season.notify.action')}
                </button>
              </form>
              {invalid && (
                <p
                  id={`notify-error-${product.id}`}
                  role="alert"
                  className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-terracotta"
                >
                  {t('season.notify.invalid')}
                </p>
              )}
              {watchers > 0 && !invalid && (
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-clay">
                  {t('season.notify.watchers', { n: watchers })}
                </p>
              )}
              {holds > 0 && (
                <p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-forest">
                  <Sprout className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
                  {t('season.reserve.holds', { n: holds })}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
