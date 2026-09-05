'use client';

import { PencilLine } from 'lucide-react';
import { useLang } from '@/lib/stores/lang';
import { SmartImage } from '@/components/shared/SmartImage';
import { formatPrice } from '@/components/shared/ProductCard';
import { cn } from '@/lib/utils';

export interface OrderSummaryItem {
  key: string;
  name: string;
  size: string;
  qty: number;
  unitPrice: number;
  image: string;
}

interface OrderSummaryProps {
  items: OrderSummaryItem[];
  subtotal: number;
  shipping: number;
  discount: number;
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
  showEdits = false,
  onEdit,
  className,
}: OrderSummaryProps) {
  const { t, lang } = useLang();
  const total = subtotal + shipping - discount;
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
        {discount > 0 && (
          <div className="flex items-center justify-between">
            <dt className="text-gold">{discountLabel}</dt>
            <dd className="font-semibold tabular-nums text-gold">−{formatPrice(discount)}</dd>
          </div>
        )}
      </dl>

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
