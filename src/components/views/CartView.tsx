'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, X } from 'lucide-react';
import { toast } from 'sonner';
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
import { PromoCodeInput } from '@/components/shared/PromoCodeInput';
import { formatPrice } from '@/components/shared/ProductCard';
import { shelfFor } from '@/lib/stock';
import {
  FREE_SHIPPING_THRESHOLD,
  findPromo,
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
  const add = useCartStore((s) => s.add);
  const promoCode = useCartStore((s) => s.promoCode);
  const mounted = useMounted();
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });

  const tt = (en: string, kh: string) => (lang === 'kh' ? kh : en);

  // Join cart lines (productId + size + qty) with the product catalogue —
  // and with the shelf behind each line, so the basket can talk about stock.
  const lines = useMemo(
    () =>
      items.map((item) => {
        const product = products?.find((p) => p.id === item.productId) ?? null;
        const unitPrice = product
          ? (product.sizes.find((s) => s.label === item.size)?.price ?? product.price)
          : 0;
        const shelf = product ? shelfFor(product, item.size) : 0;
        return { item, product, unitPrice, shelf };
      }),
    [items, products],
  );

  const rows = useMemo(() => lines.filter((l) => l.product), [lines]);
  const subtotal = rows.reduce((acc, l) => acc + l.unitPrice * l.item.qty, 0);
  const promo = promoCode ? findPromo(promoCode) : undefined;
  const promoOk = Boolean(promo && subtotal >= promo.minSubtotal);
  const shipping = shippingFor('standard', subtotal, promoOk ? promo : undefined);
  const discount = harvestDiscountFor(subtotal);
  const promoDiscount = promoOk
    ? promo!.kind === 'percent'
      ? Math.round(subtotal * (promo!.value / 100) * 100) / 100
      : promo!.kind === 'amount'
        ? promo!.value
        : 0
    : 0;
  const total = subtotal + shipping - discount - promoDiscount;
  const count = items.reduce((acc, i) => acc + i.qty, 0);
  const empty = mounted && items.length === 0;
  const shipProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  // ── Cross-sell — complementary harvests not already in the basket ────────────
  const suggestions = useMemo(() => {
    if (!products || rows.length === 0) return [];
    const inCart = new Set(items.map((i) => i.productId));
    const cartProducts = rows.map((r) => r.product!);
    return products
      .filter((p) => !inCart.has(p.id))
      .map((p) => {
        let score = 0;
        if (cartProducts.some((c) => c.province === p.province)) score += 3;
        if (cartProducts.some((c) => c.farmerId && c.farmerId === p.farmerId)) score += 2;
        if (p.bestseller) score += 2;
        if (!cartProducts.some((c) => c.category === p.category)) score += 1;
        return { p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => s.p);
  }, [products, items, rows]);

  const addSuggestion = (productId: string) => {
    const product = products?.find((p) => p.id === productId);
    add(productId, product?.sizes[0]?.label ?? '', 1);
    if (product) {
      toast.success(
        `${lang === 'kh' && product.nameKh ? product.nameKh : product.name} — ${t('common.added')}`,
      );
    }
  };

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
                {lines.map(({ item, product, unitPrice, shelf }) => {
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
                  // Shelf truth for this line — the basket never promises more
                  // units than the shelf actually holds.
                  const overShelf = shelf > 0 && item.qty > shelf;
                  const shelfFull = !overShelf && shelf > 0 && item.qty >= shelf;
                  const afterShelf = shelf - item.qty;
                  const gaugePct = Math.min(100, Math.round((item.qty / shelf) * 100));
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
                              max={shelf > 0 ? shelf : undefined}
                              onChange={(qty) => setQty(item.productId, item.size, qty)}
                            />

                            {/* Shelf truth — gauge + whisper line */}
                            {shelf > 0 && (
                              <div className="mt-3 max-w-64" aria-live="polite">
                                {overShelf ? (
                                  <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-bold uppercase tracking-[0.16em] text-terracotta">
                                    <span
                                      className="relative flex h-1.5 w-1.5"
                                      aria-hidden="true"
                                    >
                                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terracotta opacity-60" />
                                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-terracotta" />
                                    </span>
                                    {t('cart.shelf.exceeded', { n: shelf })}
                                    <button
                                      type="button"
                                      onClick={() => setQty(item.productId, item.size, shelf)}
                                      className="cursor-pointer underline decoration-terracotta/50 underline-offset-4 transition-colors hover:decoration-terracotta focus-visible:outline-2 focus-visible:outline-gold"
                                    >
                                      {t('cart.shelf.trim')}
                                    </button>
                                  </p>
                                ) : (
                                  <>
                                    <p
                                      className={
                                        shelfFull
                                          ? 'text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a6d10]'
                                          : afterShelf <= 8
                                            ? 'text-[10px] font-semibold uppercase tracking-[0.16em] text-moss'
                                            : 'text-[10px] uppercase tracking-[0.16em] text-stone'
                                      }
                                    >
                                      {shelfFull
                                        ? t('cart.shelf.full')
                                        : afterShelf <= 8
                                          ? t('cart.shelf.after', { n: afterShelf })
                                          : t('cart.shelf.units', { n: shelf })}
                                    </p>
                                    <div className="mt-2 h-1 w-full overflow-hidden bg-charcoal/8">
                                      <div
                                        className={
                                          shelfFull
                                            ? 'h-full bg-gold transition-[width] duration-700 ease-out'
                                            : afterShelf <= 8
                                              ? 'h-full bg-moss transition-[width] duration-700 ease-out'
                                              : 'h-full bg-moss/50 transition-[width] duration-700 ease-out'
                                        }
                                        style={{ width: `${gaugePct}%` }}
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
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

                {/* Free-shipping progress */}
                {mounted && rows.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-baseline justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.18em]">
                      <span className={shipping === 0 ? 'text-moss' : 'text-stone'}>
                        {shipping === 0
                          ? tt('Complimentary delivery unlocked', 'ដឹកជញ្ជូនឥតគិតថ្លៃបានបើក')
                          : tt(
                              `${formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} away from free delivery`,
                              `ចំណាយ ${formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} ទៀត ដើម្បីដឹកជញ្ជូនឥតគិតថ្លៃ`,
                            )}
                      </span>
                      <span className="tabular-nums text-stone">{shipProgress}%</span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={shipProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={t('announcement.shipping')}
                      className="mt-2.5 h-1.5 w-full overflow-hidden bg-charcoal/8"
                    >
                      <div
                        className={
                          shipping === 0
                            ? 'h-full bg-moss transition-[width] duration-700 ease-out'
                            : 'h-full bg-gold transition-[width] duration-700 ease-out'
                        }
                        style={{ width: `${shipProgress}%` }}
                      />
                    </div>
                  </div>
                )}

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
                  {mounted && rows.length > 0 && subtotal < FREE_SHIPPING_THRESHOLD && shipping > 0 && (
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
                  {promoDiscount > 0 && promo && (
                    <div className="flex items-center justify-between">
                      <dt className="text-gold">
                        {lang === 'kh' ? promo.labelKh : promo.labelEn}
                        <span className="ml-2 text-[10px] font-bold tracking-[0.18em] text-stone">
                          {promo.code}
                        </span>
                      </dt>
                      <dd className="font-semibold tabular-nums text-gold">
                        −{formatPrice(promoDiscount)}
                      </dd>
                    </div>
                  )}
                </dl>

                {/* Promo code */}
                <div className="rule my-6" />
                <PromoCodeInput subtotal={subtotal} />

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

      {/* ── Cross-sell — Complete Your Harvest ─────────────────────────────── */}
      {suggestions.length > 0 && (
        <section
          className="container-editorial mt-16 border-t border-charcoal/10 pt-12"
          aria-label={t('cart.pairsWith')}
        >
          <p className="eyebrow flex items-center gap-3 text-terracotta">
            <span className="inline-block h-px w-10 bg-current opacity-60" aria-hidden="true" />
            {t('cart.pairsWith')}
          </p>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {suggestions.map((p, i) => {
              const pName = lang === 'kh' && p.nameKh ? p.nameKh : p.name;
              return (
                <Reveal key={p.id} delay={i * 70} className="h-full">
                  <div className="flex h-full items-center gap-4 border border-charcoal/10 bg-white p-4">
                    <button
                      type="button"
                      onClick={() => navigate({ name: 'product', slug: p.slug })}
                      aria-label={pName}
                      className="shrink-0 cursor-pointer"
                    >
                      <SmartImage
                        src={p.image}
                        alt={pName}
                        ratio="square"
                        className="h-20 w-20"
                      />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-stone">
                        {p.farmerName}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate({ name: 'product', slug: p.slug })}
                        className="mt-0.5 block w-full cursor-pointer truncate text-left font-display text-base leading-snug text-charcoal transition-colors hover:text-forest"
                      >
                        {pName}
                      </button>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold tabular-nums text-charcoal">
                          {formatPrice(p.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => addSuggestion(p.id)}
                          aria-label={`${t('common.addToCart')}: ${pName}`}
                          className="btn-primary h-8 shrink-0 whitespace-nowrap px-3 text-[9px]"
                        >
                          + {t('common.addToCart')}
                        </button>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
