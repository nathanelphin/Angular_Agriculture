'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, X } from 'lucide-react';
import type { ViewProps } from '@/lib/types';
import { fetchProducts } from '@/lib/api';
import { useCartStore } from '@/lib/stores/cart';
import { useRouterStore } from '@/lib/stores/router';
import { useLang } from '@/lib/stores/lang';
import { useMounted } from '@/lib/hooks';
import { SmartImage } from '@/components/shared/SmartImage';
import { Reveal } from '@/components/shared/Reveal';
import { EmptyState } from '@/components/shared/EmptyState';
import { QuantityStepper } from '@/components/shared/QuantityStepper';
import { formatPrice } from '@/components/shared/ProductCard';
import {
  FREE_SHIPPING_THRESHOLD,
  harvestDiscountFor,
  shippingFor,
} from '@/components/checkout/totals';

export default function CartView({ view }: ViewProps) {
  void view;
  const { t, lang } = useLang();
  const navigate = useRouterStore((s) => s.navigate);
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const mounted = useMounted();
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });

  const tt = (en: string, kh: string) => (lang === 'kh' ? kh : en);

  // Join cart lines (productId + size + qty) with the product catalogue.
  const lines = useMemo(
    () =>
      items.map((item) => {
        const product = products?.find((p) => p.id === item.productId) ?? null;
        const unitPrice = product
          ? (product.sizes.find((s) => s.label === item.size)?.price ?? product.price)
          : 0;
        return { item, product, unitPrice };
      }),
    [items, products],
  );

  const rows = useMemo(() => lines.filter((l) => l.product), [lines]);
  const subtotal = rows.reduce((acc, l) => acc + l.unitPrice * l.item.qty, 0);
  const shipping = shippingFor('standard', subtotal);
  const discount = harvestDiscountFor(subtotal);
  const total = subtotal + shipping - discount;
  const count = items.reduce((acc, i) => acc + i.qty, 0);
  const empty = mounted && items.length === 0;

  return (
    <div className="pb-28">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="container-editorial pt-14 md:pt-24">
        <Reveal>
          <p className="eyebrow text-terracotta">Sovann Farm</p>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-display text-5xl leading-[1.05] text-charcoal md:text-7xl">
              {t('cart.title')}
            </h1>
            {mounted && count > 0 && (
              <p className="pb-2 text-xs uppercase tracking-[0.28em] text-stone">
                {count} {t('cart.items')}
              </p>
            )}
          </div>
        </Reveal>
      </header>

      {empty ? (
        <div className="container-editorial">
          <EmptyState
            title={t('cart.empty')}
            description={t('cart.emptyDesc')}
            action={
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate({ name: 'shop' })}
              >
                {t('cart.start')}
              </button>
            }
          />
        </div>
      ) : (
        <div className="container-editorial mt-12 grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-16">
          {/* ── Items ────────────────────────────────────────────────────────── */}
          <section aria-label={t('cart.title')}>
            {!products ? (
              // Catalogue still loading — quiet parchment skeletons.
              <ul aria-hidden="true">
                {[0, 1].map((i) => (
                  <li key={i} className="flex animate-pulse gap-5 border-b border-charcoal/10 py-6">
                    <div className="h-24 w-24 shrink-0 bg-parchment" />
                    <div className="flex-1 space-y-3 py-1">
                      <div className="h-5 w-2/3 bg-parchment" />
                      <div className="h-3 w-1/3 bg-parchment" />
                      <div className="h-11 w-32 bg-parchment" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul>
                {lines.map(({ item, product, unitPrice }) => {
                  const key = `${item.productId}-${item.size}`;
                  if (!product) {
                    // Catalogue loaded but this saved product no longer exists.
                    return (
                      <li
                        key={key}
                        className="flex items-center justify-between gap-4 border-b border-charcoal/10 py-6"
                      >
                        <p className="text-sm italic text-stone">
                          {tt('This item is no longer available.', 'ទំនិញនេះលែងមានលក់ទៀតហើយ។')}
                        </p>
                        <button
                          type="button"
                          onClick={() => remove(item.productId, item.size)}
                          aria-label={t('cart.remove')}
                          className="flex h-9 w-9 items-center justify-center text-stone transition-colors hover:text-terracotta"
                        >
                          <X className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </li>
                    );
                  }
                  const name =
                    lang === 'kh' && product.nameKh ? product.nameKh : product.name;
                  return (
                    <li key={key} className="border-b border-charcoal/10 py-6">
                      <div className="flex gap-5">
                        <button
                          type="button"
                          onClick={() => navigate({ name: 'product', slug: product.slug })}
                          aria-label={name}
                          className="shrink-0 cursor-pointer"
                        >
                          <SmartImage
                            src={product.image}
                            alt={name}
                            ratio="square"
                            className="h-24 w-24"
                          />
                        </button>
                        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => navigate({ name: 'product', slug: product.slug })}
                              className="cursor-pointer text-left font-display text-xl leading-snug text-charcoal transition-colors hover:text-forest"
                            >
                              {name}
                            </button>
                            <p className="eyebrow mt-2 text-stone">
                              {item.size || product.unit} · {product.farmerName}
                            </p>
                            <QuantityStepper
                              className="mt-4"
                              value={item.qty}
                              onChange={(qty) => setQty(item.productId, item.size, qty)}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end sm:justify-start">
                            <p className="font-semibold tabular-nums text-charcoal">
                              {formatPrice(unitPrice * item.qty)}
                            </p>
                            <button
                              type="button"
                              onClick={() => remove(item.productId, item.size)}
                              aria-label={`${t('cart.remove')}: ${name}`}
                              className="flex h-9 w-9 items-center justify-center text-stone transition-colors hover:text-terracotta"
                            >
                              <X className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Support note + continue */}
            <div className="flex flex-col gap-5 pt-10 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-3 text-sm italic text-stone">
                <Heart
                  className="h-4 w-4 shrink-0 fill-terracotta/15 text-terracotta"
                  strokeWidth={1.5}
                />
                {t('cart.supportMsg')}
              </p>
              <button
                type="button"
                onClick={() => navigate({ name: 'shop' })}
                className="self-start text-[11px] font-bold uppercase tracking-[0.22em] text-charcoal underline underline-offset-8 transition-colors hover:text-forest sm:self-auto"
              >
                {t('cart.continue')}
              </button>
            </div>
          </section>

          {/* ── Summary ──────────────────────────────────────────────────────── */}
          <aside className="self-start lg:sticky lg:top-24" aria-label={t('checkout.summary')}>
            <Reveal delay={120}>
              <div className="card-editorial p-8">
                <h2 className="font-display text-2xl text-charcoal">{t('checkout.summary')}</h2>

                <dl className="mt-7 space-y-3.5 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-stone">{t('cart.subtotal')}</dt>
                    <dd className="font-semibold tabular-nums text-charcoal">
                      {formatPrice(subtotal)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-stone">{t('cart.shipping')}</dt>
                    <dd
                      className={
                        shipping === 0
                          ? 'font-semibold tabular-nums text-terracotta'
                          : 'font-semibold tabular-nums text-charcoal'
                      }
                    >
                      {shipping === 0 ? t('cart.free') : formatPrice(shipping)}
                    </dd>
                  </div>
                  {mounted && rows.length > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
                    <p className="text-[11px] italic leading-relaxed text-stone">
                      {tt(
                        `Add ${formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for complimentary delivery.`,
                        `បន្ថែម ${formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} ទៀត ដើម្បីទទួលការដឹកជញ្ជូនឥតគិតថ្លៃ។`,
                      )}
                    </p>
                  )}
                  {discount > 0 && (
                    <div className="flex items-center justify-between">
                      <dt className="text-gold">
                        {tt('Harvest discount −5%', 'បញ្ចុះតម្លៃរដូវចម្ការ −៥%')}
                      </dt>
                      <dd className="font-semibold tabular-nums text-gold">
                        −{formatPrice(discount)}
                      </dd>
                    </div>
                  )}
                </dl>

                <div className="rule my-6" />

                <div className="flex items-baseline justify-between">
                  <span className="eyebrow text-stone">{t('cart.total')}</span>
                  <span className="font-display text-2xl tabular-nums text-charcoal">
                    {formatPrice(total)}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn-primary mt-8 w-full"
                  onClick={() => navigate({ name: 'checkout' })}
                >
                  {t('cart.checkout')}
                </button>

                <p className="mt-5 text-center text-[11px] leading-relaxed text-stone">
                  {t('announcement.shipping')}
                </p>
              </div>
            </Reveal>
          </aside>
        </div>
      )}
    </div>
  );
}
