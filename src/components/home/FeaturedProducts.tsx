'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/lib/api';
import { useLang } from '@/lib/stores/lang';
import { useRouterStore } from '@/lib/stores/router';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { ProductCard } from '@/components/shared/ProductCard';
import { EmptyState } from '@/components/shared/EmptyState';

/**
 * 02 · The Harvest — four featured products with pulse-skeleton loading.
 */
export function FeaturedProducts() {
  const { t } = useLang();
  const navigate = useRouterStore((s) => s.navigate);
  const { data, isPending, isError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const products = data ?? [];
  const featured = products.filter((p) => p.featured);
  const list = (featured.length > 0 ? featured : products).slice(0, 4);

  return (
    <section
      aria-label="Featured products"
      className="container-editorial py-20 md:py-28"
    >
      {/* Header row */}
      <Reveal className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          eyebrow={t('featured.eyebrow')}
          title={t('featured.title')}
          subtitle={t('featured.subtitle')}
        />
        <button
          type="button"
          className="btn-outline hidden md:inline-flex"
          onClick={() => navigate({ name: 'shop' })}
        >
          {t('featured.cta')}
        </button>
      </Reveal>

      {/* Grid */}
      {isPending ? (
        <div
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
          aria-busy="true"
          aria-label={t('common.loading')}
        >
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border border-charcoal/10 bg-white" aria-hidden="true">
              <div className="aspect-[4/5] animate-pulse bg-parchment" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-1/3 animate-pulse bg-parchment" />
                <div className="h-5 w-3/4 animate-pulse bg-parchment" />
                <div className="h-4 w-1/2 animate-pulse bg-parchment" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title={t('shop.empty')}
          description={t('shop.emptyDesc')}
          action={
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate({ name: 'shop' })}
            >
              {t('featured.cta')}
            </button>
          }
        />
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {list.map((product, i) => (
            <Reveal key={product.id} delay={i * 90} className="h-full">
              <ProductCard product={product} priority={i === 0} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
