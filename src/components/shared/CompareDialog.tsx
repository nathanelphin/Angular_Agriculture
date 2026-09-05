'use client';

import { toast } from 'sonner';
import { Check, Leaf, Recycle, Scale, ShoppingCart, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { Product } from '@/lib/types';
import { useLang } from '@/lib/stores/lang';
import { useCartStore } from '@/lib/stores/cart';
import { useRouterStore } from '@/lib/stores/router';
import { useCompareStore } from '@/lib/stores/compare';
import { sizeStock, SIZE_LOW_THRESHOLD } from '@/lib/stock';
import { provinceName } from '@/lib/data/provinces';
import { getCategory } from '@/lib/data/categories';
import { SmartImage } from '@/components/shared/SmartImage';
import { RatingStars } from '@/components/shared/RatingStars';
import { formatPrice } from '@/components/shared/ProductCard';
import { cn } from '@/lib/utils';

// ─── Compare dialog — editorial side-by-side harvest comparison ──────────────

interface CompareDialogProps {
  products: Product[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompareDialog({ products, open, onOpenChange }: CompareDialogProps) {
  const { t, lang } = useLang();
  const navigate = useRouterStore((s) => s.navigate);
  const add = useCartStore((s) => s.add);
  const removeFromCompare = useCompareStore((s) => s.remove);

  const name = (p: Product) => (lang === 'kh' && p.nameKh ? p.nameKh : p.name);

  const bestPrice = Math.min(...products.map((p) => p.price));
  const bestRating = Math.max(...products.map((p) => p.rating));

  const openProduct = (p: Product) => {
    onOpenChange(false);
    navigate({ name: 'product', slug: p.slug });
  };

  const quickAdd = (p: Product) => {
    add(p.id, p.sizes[0]?.label ?? '', 1);
    toast.success(`${name(p)} — ${t('common.added')}`);
  };

  const rows: {
    key: string;
    label: string;
    render: (p: Product) => React.ReactNode;
    isBest?: (p: Product) => boolean;
  }[] = [
    {
      key: 'price',
      label: t('compare.row.price'),
      render: (p) => <span className="font-semibold tabular-nums">{formatPrice(p.price)}</span>,
      isBest: (p) => products.length > 1 && p.price === bestPrice,
    },
    {
      key: 'size',
      label: t('compare.row.size'),
      render: (p) => (
        <span>
          {p.sizes.map((s) => s.label).join(' · ')}
        </span>
      ),
    },
    {
      key: 'rating',
      label: t('compare.row.rating'),
      render: (p) => (
        <span className="flex items-center gap-1.5">
          <Star
            className={cn('h-3.5 w-3.5', p.rating === bestRating ? 'fill-gold text-gold' : 'fill-gold/70 text-gold/70')}
            aria-hidden="true"
          />
          <span className="tabular-nums">{p.rating.toFixed(1)}</span>
          <span className="text-stone">({p.reviews})</span>
        </span>
      ),
      isBest: (p) => products.length > 1 && p.rating === bestRating,
    },
    {
      key: 'province',
      label: t('compare.row.province'),
      render: (p) => provinceName(p.province),
    },
    {
      key: 'farmer',
      label: t('compare.row.farmer'),
      render: (p) => p.farmerName,
    },
    {
      key: 'craft',
      label: t('compare.row.craft'),
      render: (p) => (
        <span className="flex flex-wrap gap-1.5">
          {p.organic && (
            <span className="inline-flex items-center gap-1 border border-moss/30 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-moss">
              <Leaf className="h-2.5 w-2.5" strokeWidth={1.5} aria-hidden="true" />
              {t('common.organic')}
            </span>
          )}
          {p.sustainable && (
            <span className="inline-flex items-center gap-1 border border-forest/25 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-forest">
              <Recycle className="h-2.5 w-2.5" strokeWidth={1.5} aria-hidden="true" />
              {t('common.sustainable')}
            </span>
          )}
          {p.bestseller && (
            <span className="bg-gold px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-forest-deep">
              {t('common.bestseller')}
            </span>
          )}
          {!p.organic && !p.sustainable && !p.bestseller && <span className="text-stone">—</span>}
        </span>
      ),
    },
    {
      key: 'stock',
      label: t('compare.row.stock'),
      // Per-size shelf: headline status follows the tightest live size, with a
      // whisper-line naming the constrained sizes (low or gone).
      render: (p) => {
        const stocks = p.sizes.map((s) => ({ label: s.label, n: sizeStock(p, s) }));
        const live = stocks.filter((s) => s.n > 0);
        if (live.length === 0) {
          return <span className="text-terracotta">{t('common.soldOut')}</span>;
        }
        const min = Math.min(...live.map((s) => s.n));
        const lowSizes = stocks.filter((s) => s.n > 0 && s.n <= SIZE_LOW_THRESHOLD);
        const goneSizes = stocks.filter((s) => s.n <= 0);
        return (
          <span>
            <span className={cn('flex items-center gap-1.5', min <= SIZE_LOW_THRESHOLD ? 'text-terracotta' : 'text-moss')}>
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  min <= SIZE_LOW_THRESHOLD ? 'animate-pulse bg-terracotta' : 'bg-moss',
                )}
                aria-hidden="true"
              />
              {min <= SIZE_LOW_THRESHOLD
                ? t('product.sizeOnly', { n: min })
                : t('product.inStock')}
            </span>
            {(lowSizes.length > 0 || goneSizes.length > 0) && (
              <span className="mt-1 block text-[11px] leading-relaxed text-stone">
                {[...lowSizes, ...goneSizes]
                  .map((s) =>
                    s.n <= 0
                      ? `${s.label} ${t('common.soldOut').toLowerCase()}`
                      : `${s.label} · ${s.n} ${t('product.sizeLeft')}`,
                  )
                  .join(' / ')}
              </span>
            )}
          </span>
        );
      },
    },
    {
      key: 'notes',
      label: t('compare.row.notes'),
      render: (p) => <span className="line-clamp-4 text-[13px] leading-relaxed">{p.description}</span>,
    },
  ];

  if (products.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[92vh] gap-0 overflow-y-auto border-charcoal/15 bg-ivory p-0 sm:max-w-5xl"
        aria-describedby={undefined}
      >
        <DialogDescription className="sr-only">{t('compare.title')}</DialogDescription>

        <div className="border-b border-charcoal/10 px-6 pb-5 pt-6 md:px-8">
          <p className="eyebrow flex items-center gap-2.5 text-terracotta">
            <span className="inline-block h-px w-8 bg-current opacity-60" aria-hidden="true" />
            {t('compare.eyebrow')}
          </p>
          <DialogTitle className="mt-3 font-display text-3xl leading-tight text-charcoal md:text-4xl">
            {t('compare.title')}
          </DialogTitle>
        </div>

        {/* Comparison table — first column = row labels, then one column per product */}
        <div className="overflow-x-auto px-6 py-6 md:px-8">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm text-charcoal">
            <caption className="sr-only">{t('compare.title')}</caption>
            <thead>
              <tr>
                <th scope="col" className="w-24 align-bottom pb-4 pr-4 sm:w-32">
                  <span className="sr-only">{t('compare.title')}</span>
                  <Scale className="h-5 w-5 text-stone" strokeWidth={1.25} aria-hidden="true" />
                </th>
                {products.map((p) => (
                  <th key={p.id} scope="col" className="min-w-[150px] align-bottom pb-4 pr-4 last:pr-0">
                    <div className="group relative">
                      <button
                        type="button"
                        onClick={() => removeFromCompare(p.id)}
                        aria-label={`${t('compare.remove')}: ${name(p)}`}
                        className="absolute -left-2 -top-2 z-10 flex h-6 w-6 cursor-pointer items-center justify-center border border-charcoal/15 bg-white text-stone shadow-sm transition-colors hover:border-terracotta hover:bg-terracotta hover:text-ivory focus-visible:outline-2 focus-visible:outline-gold"
                      >
                        <span aria-hidden="true" className="text-sm leading-none">×</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openProduct(p)}
                        className="block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-gold"
                      >
                        <SmartImage
                          src={p.image}
                          alt={name(p)}
                          ratio="square"
                          className="w-full max-w-[110px] border border-charcoal/10"
                        />
                        <span className="mt-2.5 block text-[9px] font-bold uppercase tracking-[0.22em] text-terracotta">
                          {provinceName(p.province)}
                        </span>
                        <span className="mt-1 block font-display text-lg leading-snug text-charcoal transition-colors group-hover:text-forest">
                          {name(p)}
                        </span>
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-t border-charcoal/10 align-top transition-colors hover:bg-parchment/40">
                  <th scope="row" className="py-4 pr-4 text-[9px] font-bold uppercase tracking-[0.2em] text-stone sm:text-[10px]">
                    {row.label}
                  </th>
                  {products.map((p) => (
                    <td key={p.id} className="py-4 pr-4 text-[13px] leading-relaxed last:pr-0">
                      <span className={cn(row.isBest?.(p) && 'font-semibold text-forest')}>
                        {row.render(p)}
                      </span>
                      {row.isBest?.(p) && (
                        <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.18em] text-gold">
                          {row.key === 'price' ? t('compare.bestPrice') : t('compare.bestRated')}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Actions row */}
              <tr className="border-t border-charcoal/10">
                <th scope="row" className="py-5 pr-4">
                  <span className="sr-only">{t('common.addToCart')}</span>
                </th>
                {products.map((p) => (
                  <td key={p.id} className="py-5 pr-4 last:pr-0">
                    <button
                      type="button"
                      onClick={() => quickAdd(p)}
                      disabled={p.stock <= 0}
                      className="btn-primary h-11 w-full max-w-[150px] px-3 text-[9px] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                      {t('common.addToCart')}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-charcoal/10 bg-parchment/40 px-6 py-4 md:px-8">
          <p className="text-[11px] italic leading-relaxed text-stone">{t('compare.footnote')}</p>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="btn-outline h-10 shrink-0 px-5 text-[10px]"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            {t('common.close')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
