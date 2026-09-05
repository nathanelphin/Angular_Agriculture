'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Copy, Heart, Share2 } from 'lucide-react';
import type { Product, ViewProps } from '@/lib/types';
import { fetchProducts } from '@/lib/api';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { useRouterStore } from '@/lib/stores/router';
import { useLang } from '@/lib/stores/lang';
import { useMounted } from '@/lib/hooks';
import { Reveal } from '@/components/shared/Reveal';
import { EmptyState } from '@/components/shared/EmptyState';
import { ProductCard, formatPrice } from '@/components/shared/ProductCard';
import { copyTextToClipboard } from '@/lib/clipboard';
import { provinceName } from '@/lib/data/provinces';

export default function WishlistView({ view }: ViewProps) {
  void view;
  const { t, lang } = useLang();
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

  /** Plain-text export of the wishlist — clipboard + native share sheet. */
  const listText = () => {
    const lines = wishlistProducts.map(
      (p) => `• ${lang === 'kh' && p.nameKh ? p.nameKh : p.name} — ${formatPrice(p.price)} (${provinceName(p.province)})`,
    );
    return `${t('wishlist.listTitle')}\n\n${lines.join('\n')}\n\nsovann.farm — From Cambodian Soil, To Your Table.`;
  };

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(listText());
    if (ok) {
      toast.success(t('wishlist.copied'));
    } else {
      toast.error(t('share.copyFailed'));
    }
  };

  const handleShare = async () => {
    const text = listText();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: t('wishlist.listTitle'), text });
        return;
      } catch {
        return; // user dismissed the share sheet
      }
    }
    await handleCopy();
  };

  return (
    <div className="container-editorial pb-28 pt-14 md:pt-24">
      <Reveal>
        <p className="eyebrow text-terracotta">Sovann Farm</p>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-5xl leading-[1.05] text-charcoal md:text-7xl">
            {t('wishlist.title')}
          </h1>
          {mounted && wishlistProducts.length > 0 && (
            <div className="flex items-center gap-3 pb-2">
              <p className="text-xs uppercase tracking-[0.28em] text-stone">
                {wishlistProducts.length} {t('shop.results')}
              </p>
              <span className="h-4 w-px bg-charcoal/15" aria-hidden="true" />
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex cursor-pointer items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-charcoal transition-colors duration-300 hover:text-forest focus-visible:outline-2 focus-visible:outline-gold"
              >
                <Copy className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                {t('wishlist.copy')}
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex cursor-pointer items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-charcoal transition-colors duration-300 hover:text-forest focus-visible:outline-2 focus-visible:outline-gold"
              >
                <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                {t('wishlist.share')}
              </button>
            </div>
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
