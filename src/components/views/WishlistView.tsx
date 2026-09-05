'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import type { Product, ViewProps } from '@/lib/types';
import { fetchProducts } from '@/lib/api';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { useRouterStore } from '@/lib/stores/router';
import { useLang } from '@/lib/stores/lang';
import { useMounted } from '@/lib/hooks';
import { Reveal } from '@/components/shared/Reveal';
import { EmptyState } from '@/components/shared/EmptyState';
import { ProductCard } from '@/components/shared/ProductCard';

export default function WishlistView({ view }: ViewProps) {
  void view;
  const { t } = useLang();
  const navigate = useRouterStore((s) => s.navigate);
  const ids = useWishlistStore((s) => s.ids);
  const mounted = useMounted();
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });

  const wishlistProducts = useMemo<Product[]>(
    () =>
      products
        ? ids
            .map((id) => products.find((p) => p.id === id))
            .filter((p): p is Product => Boolean(p))
        : [],
    [ids, products],
  );

  const empty = mounted && ids.length === 0;

  return (
    <div className="container-editorial pb-28 pt-14 md:pt-24">
      <Reveal>
        <p className="eyebrow text-terracotta">Sovann Farm</p>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-5xl leading-[1.05] text-charcoal md:text-7xl">
            {t('wishlist.title')}
          </h1>
          {mounted && wishlistProducts.length > 0 && (
            <p className="pb-2 text-xs uppercase tracking-[0.28em] text-stone">
              {wishlistProducts.length} {t('shop.results')}
            </p>
          )}
        </div>
      </Reveal>

      {empty ? (
        <EmptyState
          icon={<Heart className="h-7 w-7 text-terracotta" strokeWidth={1.25} />}
          title={t('wishlist.empty')}
          description={t('wishlist.emptyDesc')}
          action={
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate({ name: 'shop' })}
            >
              {t('wishlist.discover')}
            </button>
          }
        />
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-6">
          {!products
            ? // Catalogue loading — quiet parchment placeholders.
              Array.from({ length: Math.min(ids.length || 4, 8) }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse bg-parchment"
                  aria-hidden="true"
                />
              ))
            : wishlistProducts.map((product, i) => (
                <Reveal key={product.id} delay={(i % 4) * 70} className="h-full">
                  <ProductCard product={product} priority={i < 4} />
                </Reveal>
              ))}
        </div>
      )}
    </div>
  );
}
