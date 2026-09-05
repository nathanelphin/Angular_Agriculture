'use client';

import { useRef, useState } from 'react';
import { Check, Heart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useLang } from '@/lib/stores/lang';
import { useCartStore } from '@/lib/stores/cart';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { useRouterStore } from '@/lib/stores/router';
import { provinceName } from '@/lib/data/provinces';
import { SmartImage } from '@/components/shared/SmartImage';
import { RatingStars } from '@/components/shared/RatingStars';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  className?: string;
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export function ProductCard({ product, priority = false, className }: ProductCardProps) {
  const { t, lang } = useLang();
  const navigate = useRouterStore((s) => s.navigate);
  const add = useCartStore((s) => s.add);
  const wishlisted = useWishlistStore((s) => s.ids.includes(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const name = lang === 'kh' && product.nameKh ? product.nameKh : product.name;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    add(product.id, product.sizes[0]?.label ?? '', 1);
    setJustAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(false), 1600);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const openProduct = () => navigate({ name: 'product', slug: product.slug });

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col border border-charcoal/10 bg-white transition-all duration-500 hover:border-charcoal/25 hover:shadow-[0_24px_60px_-32px_rgba(28,58,42,0.35)]',
        className,
      )}
    >
      {/* Image */}
      <button
        type="button"
        onClick={openProduct}
        aria-label={name}
        className="relative block w-full cursor-pointer overflow-hidden focus-visible:outline-2 focus-visible:outline-gold"
      >
        <SmartImage
          src={product.image}
          alt={`${product.name} — ${provinceName(product.province)}`}
          ratio="portrait"
          priority={priority}
          imgClassName="transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
        />
        {/* origin ribbon on hover */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-forest-deep/70 to-transparent p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-ivory">
            {provinceName(product.province)} · Cambodia
          </span>
        </div>
      </button>

      {/* Badges */}
      <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
        {product.bestseller && (
          <span className="bg-gold px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-forest-deep">
            {t('common.bestseller')}
          </span>
        )}
        {product.organic && (
          <span className="bg-forest px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-ivory">
            {t('common.organic')}
          </span>
        )}
        {product.isNew && (
          <span className="bg-terracotta px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-ivory">
            {t('common.new')}
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button
        type="button"
        onClick={handleWishlist}
        aria-label={wishlisted ? t('common.removeFromWishlist') : t('common.addToWishlist')}
        aria-pressed={wishlisted}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-white/95 text-charcoal shadow-sm transition-all duration-300 hover:scale-110 focus-visible:outline-2 focus-visible:outline-gold"
      >
        <Heart
          className={cn('h-4 w-4 transition-colors', wishlisted && 'fill-terracotta text-terracotta')}
          strokeWidth={1.5}
        />
      </button>

      {/* Info */}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-terracotta">
          {provinceName(product.province)}
        </p>
        <button
          type="button"
          onClick={openProduct}
          className="mt-1.5 cursor-pointer text-left font-display text-xl leading-snug text-charcoal transition-colors hover:text-forest focus-visible:outline-2 focus-visible:outline-gold"
        >
          {name}
        </button>
        <div className="mt-2">
          <RatingStars value={product.rating} showValue reviews={product.reviews} reviewsLabel={t('product.reviews')} />
        </div>

        <div className="mt-auto flex items-center justify-between pt-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone">{product.sizes[0]?.label ?? product.unit}</p>
            <p className="mt-0.5 text-lg font-semibold tracking-tight text-charcoal">
              {formatPrice(product.price)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`${t('common.addToCart')}: ${name}`}
            className={cn(
              'btn-primary h-11 px-5 text-[10px]',
              justAdded && '!bg-gold !text-forest-deep',
            )}
          >
            {justAdded ? t('common.added') : t('common.addToCart')}
          </button>
        </div>
      </div>
    </article>
  );
}
