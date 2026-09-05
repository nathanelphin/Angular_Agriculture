'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, Check, Eye, Leaf, Recycle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { Product } from '@/lib/types';
import { useLang } from '@/lib/stores/lang';
import { useCartStore } from '@/lib/stores/cart';
import { useRouterStore } from '@/lib/stores/router';
import { provinceName } from '@/lib/data/provinces';
import { getCategory } from '@/lib/data/categories';
import { SmartImage } from '@/components/shared/SmartImage';
import { RatingStars } from '@/components/shared/RatingStars';
import { QuantityStepper } from '@/components/shared/QuantityStepper';
import { formatPrice } from '@/components/shared/ProductCard';
import { cn } from '@/lib/utils';

// ─── Quick View — modal product summary without leaving the shop grid ────────

interface QuickViewDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewDialog({ product, open, onOpenChange }: QuickViewDialogProps) {
  const { t, lang } = useLang();
  const navigate = useRouterStore((s) => s.navigate);
  const add = useCartStore((s) => s.add);

  const sizes = product.sizes;
  // Selections initialise on mount and persist across re-opens of the same
  // card (event-handler driven component — no reset effect needed).
  const [size, setSize] = useState(sizes[0]?.label ?? '');
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const name = lang === 'kh' && product.nameKh ? product.nameKh : product.name;
  const selected = sizes.find((s) => s.label === size) ?? sizes[0];
  const categoryName = getCategory(product.category)?.name ?? '';

  const handleAdd = () => {
    add(product.id, selected?.label ?? '', qty);
    setJustAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(false), 1600);
    toast.success(`${name} — ${t('common.added')}`);
  };

  const openFull = () => {
    onOpenChange(false);
    navigate({ name: 'product', slug: product.slug });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[92vh] gap-0 overflow-y-auto border-charcoal/15 bg-ivory p-0 sm:max-w-3xl"
        aria-describedby={undefined}
      >
        <DialogDescription className="sr-only">{name}</DialogDescription>
        <div className="grid sm:grid-cols-2">
          {/* Image */}
          <div className="relative bg-parchment">
            <SmartImage
              src={product.image}
              alt={name}
              ratio="square"
              className="h-full w-full sm:min-h-[26rem]"
            />
            <span className="absolute bottom-3 left-3 bg-ivory/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-charcoal/70">
              {provinceName(product.province)} · Cambodia
            </span>
          </div>

          {/* Details */}
          <div className="flex flex-col p-6 md:p-8">
            <p className="eyebrow text-terracotta">
              {provinceName(product.province)} · {categoryName}
            </p>
            <DialogTitle className="mt-3 font-display text-3xl leading-tight text-charcoal">
              {name}
            </DialogTitle>
            {lang !== 'kh' && product.nameKh && (
              <p className="mt-1 font-khmer text-sm text-stone">{product.nameKh}</p>
            )}

            <div className="mt-3">
              <RatingStars
                value={product.rating}
                showValue
                reviews={product.reviews}
                reviewsLabel={t('product.reviews')}
              />
            </div>

            <p className="mt-4 font-display text-2xl tracking-tight text-charcoal">
              {formatPrice(selected?.price ?? product.price)}
              {selected && (
                <span className="ml-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone">
                  / {selected.label}
                </span>
              )}
            </p>

            <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-stone">
              {product.description}
            </p>

            {/* Production flags */}
            {(product.organic || product.sustainable) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.organic && (
                  <span className="inline-flex items-center gap-1.5 border border-forest/25 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-forest">
                    <Leaf className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                    {t('common.organic')}
                  </span>
                )}
                {product.sustainable && (
                  <span className="inline-flex items-center gap-1.5 border border-moss/25 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-moss">
                    <Recycle className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                    {t('common.sustainable')}
                  </span>
                )}
              </div>
            )}

            <div className="rule my-5" />

            {/* Size */}
            {sizes.length > 1 && (
              <div>
                <p className="eyebrow text-stone">{t('product.size')}</p>
                <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={t('product.size')}>
                  {sizes.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setSize(s.label)}
                      aria-pressed={size === s.label}
                      className={cn(
                        'h-10 cursor-pointer border px-4 text-xs font-semibold transition-colors duration-300',
                        size === s.label
                          ? 'border-forest bg-forest text-ivory'
                          : 'border-charcoal/20 text-charcoal hover:border-forest',
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + add */}
            <div className="mt-5 flex items-center gap-3">
              <QuantityStepper value={qty} onChange={setQty} min={1} max={Math.max(product.stock, 1)} />
              <button
                type="button"
                onClick={handleAdd}
                disabled={product.stock <= 0}
                className={cn(
                  'btn-primary h-12 flex-1 text-[10px]',
                  justAdded && '!bg-gold !text-forest-deep',
                )}
              >
                {justAdded ? (
                  <>
                    <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                    {t('common.added')}
                  </>
                ) : (
                  t('common.addToCart')
                )}
              </button>
            </div>

            {/* Full details */}
            <button
              type="button"
              onClick={openFull}
              className="btn-outline mt-4 h-11 text-[10px]"
            >
              {t('quickView.fullDetails')}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Screen-reader shortcut to open the full page */}
        <button
          type="button"
          onClick={openFull}
          className="sr-only"
          aria-label={`${t('common.quickView')} — ${t('quickView.fullDetails')}`}
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
