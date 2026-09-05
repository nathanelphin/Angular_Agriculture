'use client';

import { useState } from 'react';
import { BadgePercent, Check, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/lib/stores/cart';
import { useLang } from '@/lib/stores/lang';
import { useMounted } from '@/lib/hooks';
import { evaluatePromo, findPromo, type PromoCode } from '@/components/checkout/totals';
import { cn } from '@/lib/utils';

interface PromoCodeInputProps {
  /** Live subtotal used to validate minimum-spend rules. */
  subtotal: number;
  className?: string;
}

/**
 * Editorial promo-code field + applied-state chip.
 * Shared by the cart summary and the checkout summary so a code applied in
 * either place carries through the whole flow (persisted in the cart store).
 */
export function PromoCodeInput({ subtotal, className }: PromoCodeInputProps) {
  const { lang } = useLang();
  const mounted = useMounted();
  const promoCode = useCartStore((s) => s.promoCode);
  const applyPromo = useCartStore((s) => s.applyPromo);
  const clearPromo = useCartStore((s) => s.clearPromo);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const tt = (en: string, kh: string) => (lang === 'kh' ? kh : en);

  const activePromo: PromoCode | undefined = promoCode ? findPromo(promoCode) : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checking || !input.trim()) return;
    setChecking(true);
    // Small delay keeps the interaction legible (feels like a real check).
    window.setTimeout(() => {
      const result = evaluatePromo(input, subtotal);
      if (!result.ok || !result.promo) {
        setError(
          result.reason === 'minimum' && result.promo
            ? tt(
                `Add $${result.promo.minSubtotal.toFixed(0)} or more to use ${result.promo.code}.`,
                `បន្ថែម $${result.promo.minSubtotal.toFixed(0)} ទៀត ដើម្បីប្រើ ${result.promo.code}។`,
              )
            : tt('That code isn\u2019t valid.', 'កូដនេះមិនត្រឹមត្រូវទេ។'),
        );
        setChecking(false);
        return;
      }
      applyPromo(result.promo.code);
      setInput('');
      setError(null);
      setChecking(false);
      toast.success(
        tt(
          `${result.promo.labelEn} applied — ${result.promo.code}`,
          `${result.promo.labelKh} បានអនុវត្ត — ${result.promo.code}`,
        ),
      );
    }, 450);
  };

  // Hydration-safe: render the applied chip only after mount.
  if (mounted && activePromo) {
    return (
      <div className={cn('border border-gold/50 bg-gold/10 p-4', className)}>
        <div className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2.5">
            <BadgePercent className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
            <span className="min-w-0">
              <span className="block truncate text-xs font-bold uppercase tracking-[0.18em] text-charcoal">
                {lang === 'kh' ? activePromo.labelKh : activePromo.labelEn}
              </span>
              <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
                {activePromo.code}
              </span>
            </span>
          </span>
          <button
            type="button"
            onClick={() => {
              clearPromo();
              toast(tt('Promo code removed.', 'កូដបញ្ចុះតម្លៃត្រូវបានលុប។'));
            }}
            aria-label={tt('Remove promo code', 'លុបកូដបញ្ចុះតម្លៃ')}
            className="flex h-8 w-8 shrink-0 items-center justify-center text-stone transition-colors hover:text-terracotta"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} noValidate>
        <label
          htmlFor="promo-code"
          className="text-[10px] font-bold uppercase tracking-[0.24em] text-stone"
        >
          {tt('Promo code', 'កូដបញ្ចុះតម្លៃ')}
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="promo-code"
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError(null);
            }}
            placeholder={tt('HARVEST10', 'HARVEST10')}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'promo-code-error' : undefined}
            className="input-editorial h-11 flex-1 uppercase tracking-[0.14em] placeholder:normal-case placeholder:tracking-normal"
          />
          <button
            type="submit"
            disabled={checking || !input.trim()}
            className="btn-outline h-11 shrink-0 px-5 text-[10px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checking ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} aria-hidden="true" />
            ) : (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                {tt('Apply', 'អនុវត្ត')}
              </>
            )}
          </button>
        </div>
        {error && (
          <p id="promo-code-error" role="alert" className="mt-2 text-xs text-terracotta">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
