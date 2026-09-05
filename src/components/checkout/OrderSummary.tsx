'use client';

import { PencilLine } from 'lucide-react';
import { useLang } from '@/lib/stores/lang';
import { SmartImage } from '@/components/shared/SmartImage';
import { PromoCodeInput } from '@/components/shared/PromoCodeInput';
import { formatPrice } from '@/components/shared/ProductCard';
import { cn } from '@/lib/utils';

export interface OrderSummaryItem {
  key: string;
  name: string;
  size: string;
  qty: number;
  unitPrice: number;
  image: string;
  /** Units on the shelf behind this line — enables the stock whisper. */
  shelf?: number;
}

interface OrderSummaryProps {
  items: OrderSummaryItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  giftFee?: number;
  promoCode?: string;
  promoLabel?: string;
  promoDiscount?: number;
  /** Allow applying a code right here (checkout aside). */
  allowPromo?: boolean;
  /** Show quick "edit" links back to information / delivery steps. */
  showEdits?: boolean;
  onEdit?: (step: 1 | 2) => void;
  className?: string;
}

/** Sticky order summary used on the checkout steps. */
export function OrderSummary({
  items,
  subtotal,
  shipping,
  discount,
  giftFee = 0,
  promoCode,
  promoLabel,
  promoDiscount,
  allowPromo = false,
  showEdits = false,
  onEdit,
  className,
}: OrderSummaryProps) {
  const { t, lang } = useLang();
  const total = subtotal + shipping + giftFee - discount - (promoDiscount ?? 0);
  const discountLabel = lang === 'kh' ? 'បញ្ចុះតម្លៃរដូវចម្ការ −៥%' : 'Harvest discount −5%';

  return (
    <div className={cn('card-editorial p-6 md:p-8', className)}>
      <h2 className="font-display text-2xl text-charcoal">{t('checkout.summary')}</h2>

      <ul className="mt-6">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-4 border-b border-charcoal/10 py-4">
            <SmartImage src={item.image} alt={item.name} ratio="square" className="h-14 w-14 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-charcoal">{item.name}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-stone">
                {item.size} · ×{item.qty}
              </p>
              {typeof item.shelf === 'number' && item.shelf > 0 && (
                <p
                  className={cn(
                    'mt-1 text-[10px] font-semibold uppercase tracking-[0.14em]',
                    item.qty > item.shelf
                      ? 'text-terracotta'
                      : item.shelf - item.qty <= 8
                        ? 'text-moss'
                        : 'text-stone/80',
                  )}
                >
                  {item.qty > item.shelf
                    ? t('cart.shelf.exceeded', { n: item.shelf })
                    : item.shelf - item.qty === 0
                      ? t('cart.shelf.full')
                      : item.shelf - item.qty <= 8
                        ? t('cart.shelf.after', { n: item.shelf - item.qty })
                        : t('cart.shelf.units', { n: item.shelf })}
                </p>
              )}
            </div>
            <p className="text-sm font-semibold tabular-nums text-charcoal">
              {formatPrice(item.unitPrice * item.qty)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-stone">{t('cart.subtotal')}</dt>
          <dd className="font-semibold tabular-nums text-charcoal">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-stone">{t('cart.shipping')}</dt>
          <dd
            className={cn(
              'font-semibold tabular-nums',
              shipping === 0 ? 'text-terracotta' : 'text-charcoal',
            )}
          >
            {shipping === 0 ? t('cart.free') : formatPrice(shipping)}
          </dd>
        </div>
        {giftFee > 0 && (
          <div className="flex items-center justify-between">
            <dt className="text-charcoal">
              {lang === 'kh' ? 'ខ្ចប់ជាកាដូ' : 'Gift wrap'}
            </dt>
            <dd className="font-semibold tabular-nums text-charcoal">{formatPrice(giftFee)}</dd>
          </div>
        )}
        {discount > 0 && (
          <div className="flex items-center justify-between">
            <dt className="text-gold">{discountLabel}</dt>
            <dd className="font-semibold tabular-nums text-gold">−{formatPrice(discount)}</dd>
          </div>
        )}
        {promoDiscount != null && promoDiscount > 0 && (
          <div className="flex items-center justify-between">
            <dt className="text-gold">
              {promoLabel ?? promoCode}
              {promoCode && (
                <span className="ml-2 text-[10px] font-bold tracking-[0.18em] text-stone">
                  {promoCode}
                </span>
              )}
            </dt>
            <dd className="font-semibold tabular-nums text-gold">−{formatPrice(promoDiscount)}</dd>
          </div>
        )}
      </dl>

      {allowPromo && (
        <>
          <div className="rule my-5" />
          <PromoCodeInput subtotal={subtotal} />
        </>
      )}

      <div className="rule my-6" />

      <div className="flex items-baseline justify-between">
        <span className="eyebrow text-stone">{t('cart.total')}</span>
        <span className="font-display text-2xl tabular-nums text-charcoal">{formatPrice(total)}</span>
      </div>

      {showEdits && onEdit && (
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-charcoal/10 pt-5">
          <button
            type="button"
            onClick={() => onEdit(1)}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-stone transition-colors hover:text-forest"
          >
            <PencilLine className="h-3 w-3" strokeWidth={1.5} />
            {t('checkout.step.information')}
          </button>
          <button
            type="button"
            onClick={() => onEdit(2)}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-stone transition-colors hover:text-forest"
          >
            <PencilLine className="h-3 w-3" strokeWidth={1.5} />
            {t('checkout.step.delivery')}
          </button>
        </div>
      )}
    </div>
  );
}
