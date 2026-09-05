'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Check, Heart, Leaf, Recycle } from 'lucide-react';
import type { ProvinceId, ViewProps } from '@/lib/types';
import { fetchFarmers, fetchProduct, fetchProducts } from '@/lib/api';
import { useLang } from '@/lib/stores/lang';
import { useRouterStore } from '@/lib/stores/router';
import { useCartStore } from '@/lib/stores/cart';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { useRecentStore } from '@/lib/stores/recent';
import { useMounted } from '@/lib/hooks';
import { getCategory } from '@/lib/data/categories';
import { getProvince, provinceName } from '@/lib/data/provinces';
import { EmptyState } from '@/components/shared/EmptyState';
import { ProductCard, formatPrice } from '@/components/shared/ProductCard';
import { QuantityStepper } from '@/components/shared/QuantityStepper';
import { RatingStars } from '@/components/shared/RatingStars';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { SmartImage } from '@/components/shared/SmartImage';
import { OriginChain } from '@/components/product/OriginChain';
import { ProductReviews } from '@/components/product/ProductReviews';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

// ─── ProductView — gallery, craft details, origin story & related harvests ────

export default function ProductView({ view }: ViewProps) {
  const { t, lang } = useLang();
  const navigate = useRouterStore((s) => s.navigate);
  const add = useCartStore((s) => s.add);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const wishlistIds = useWishlistStore((s) => s.ids);
  const recordRecent = useRecentStore((s) => s.record);
  const recentSlugs = useRecentStore((s) => s.slugs);
  const mounted = useMounted();

  const slug = view.name === 'product' ? view.slug : '';

  // ── Data ────────────────────────────────────────────────────────────────────
  const {
    data: product,
    isError,
  } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProduct(slug),
    enabled: slug.length > 0,
  });
  const { data: farmers } = useQuery({ queryKey: ['farmers'], queryFn: fetchFarmers });
  const { data: allProducts } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });

  const farmer = useMemo(
    () => farmers?.find((f) => f.id === product?.farmerId),
    [farmers, product?.farmerId],
  );
  const prov = useMemo(() => (product ? getProvince(product.province) : undefined), [product]);

  // ── Local state ─────────────────────────────────────────────────────────────
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Selection state initialises from the loaded product; the keyed view wrapper remounts
  // this component on navigation, so no reset effect is required.

  // Clear the “Added ✓” timer on unmount.
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // Track this product in the recently-viewed history — only once it has
  // actually loaded, so failed/unknown slugs never pollute the history.
  useEffect(() => {
    if (product) recordRecent(product.slug);
  }, [product?.id, recordRecent]);

  // ── Gallery (product → farm → province) ─────────────────────────────────────
  const gallery = useMemo(() => {
    if (!product) return [];
    const images: { src: string; alt: string }[] = [
      { src: product.image, alt: product.name },
    ];
    if (farmer?.farmImage) images.push({ src: farmer.farmImage, alt: `${farmer.name} — the farm` });
    if (prov) images.push({ src: prov.image, alt: `${prov.name}, Cambodia — ${prov.tagline}` });
    return images;
  }, [product, farmer, prov]);

  // ── Related products (same category, topped up with same province) ──────────
  const related = useMemo(() => {
    if (!product || !allProducts) return [];
    const sameCategory = allProducts.filter(
      (p) => p.id !== product.id && p.category === product.category,
    );
    const sameProvince = allProducts.filter(
      (p) =>
        p.id !== product.id &&
        p.category !== product.category &&
        p.province === product.province,
    );
    return [...sameCategory, ...sameProvince].slice(0, 4);
  }, [product, allProducts]);

  // ── Recently viewed (history strip, excludes the current product) ───────────
  const recentProducts = useMemo(() => {
    if (!product || !allProducts) return [];
    return recentSlugs
      .filter((s) => s !== product.slug)
      .map((s) => allProducts.find((p) => p.slug === s))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .slice(0, 4);
  }, [product, allProducts, recentSlugs]);

  // ── Loading / not found ─────────────────────────────────────────────────────
  if (product === undefined && !isError) {
    return <ProductViewSkeleton />;
  }

  // ── Not found ───────────────────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="container-editorial py-24">
        <EmptyState
          title={t('shop.empty')}
          description={t('shop.emptyDesc')}
          action={
            <button
              type="button"
              onClick={() => navigate({ name: 'shop' })}
              className="btn-primary"
            >
              {t('product.shop')}
            </button>
          }
        />
      </div>
    );
  }

  // ── Derived content ─────────────────────────────────────────────────────────
  const name = lang === 'kh' && product.nameKh ? product.nameKh : product.name;
  const categoryData = getCategory(product.category);
  const categoryNameValue = categoryData
    ? lang === 'kh'
      ? categoryData.nameKh
      : categoryData.name
    : null;
  const provinceLabel =
    product.province === 'multi'
      ? lang === 'kh'
        ? 'ខេត្តច្រើន'
        : 'Multiple Provinces'
      : lang === 'kh'
        ? (prov?.nameKh ?? provinceName(product.province))
        : provinceName(product.province);

  const sizeOptions = product.sizes;
  const selectedSizeObj =
    sizeOptions.find((s) => s.label === selectedSize) ?? sizeOptions[0];
  const activeSrc = gallery[Math.min(activeImage, Math.max(gallery.length - 1, 0))]?.src ?? product.image;
  const activeAlt =
    gallery[Math.min(activeImage, Math.max(gallery.length - 1, 0))]?.alt ?? product.name;

  const wished = wishlistIds.includes(product.id);
  const farmerSlug =
    farmer?.slug ??
    (product.farmerId && product.farmerId.startsWith('f-') ? product.farmerId.slice(2) : null);
  const localizedProvince = (id: ProvinceId) =>
    lang === 'kh' ? (getProvince(id)?.nameKh ?? provinceName(id)) : provinceName(id);

  const handleAdd = () => {
    if (product.stock <= 0) return;
    add(product.id, selectedSizeObj?.label ?? '', qty);
    setJustAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(false), 1600);
    toast.success(`${name} — ${t('common.added')}`);
  };

  const handleWishlist = () => {
    toggleWishlist(product.id);
  };

  const goFarmer = () => {
    if (farmerSlug) navigate({ name: 'farmer', slug: farmerSlug });
  };

  const accordionTrigger =
    'rounded-none py-5 text-[11px] font-bold uppercase tracking-[0.26em] text-charcoal hover:no-underline hover:text-forest';

  return (
    <div>
      {/* ── Breadcrumb + back ──────────────────────────────────────────────── */}
      <div className="container-editorial pt-10 md:pt-14">
        <button
          type="button"
          onClick={() => navigate({ name: 'shop' })}
          className="flex cursor-pointer items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-stone transition-colors hover:text-forest focus-visible:outline-2 focus-visible:outline-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          {t('product.shop')}
        </button>
        <nav
          aria-label="Breadcrumb"
          className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]"
        >
          <button
            type="button"
            onClick={() => navigate({ name: 'shop' })}
            className="cursor-pointer text-stone transition-colors hover:text-forest focus-visible:outline-2 focus-visible:outline-gold"
          >
            {t('product.shop')}
          </button>
          {categoryNameValue && (
            <>
              <span className="text-charcoal/25" aria-hidden="true">/</span>
              <button
                type="button"
                onClick={() => navigate({ name: 'shop', category: product.category })}
                className="cursor-pointer text-stone transition-colors hover:text-forest focus-visible:outline-2 focus-visible:outline-gold"
              >
                {categoryNameValue}
              </button>
            </>
          )}
          <span className="text-charcoal/25" aria-hidden="true">/</span>
          <span className="text-charcoal" aria-current="page">{name}</span>
        </nav>

        {/* ── Main grid ──────────────────────────────────────────────────────── */}
        <div className="grid gap-12 pb-20 pt-8 lg:grid-cols-2 lg:gap-16">
          {/* LEFT — gallery */}
          <div>
            <div className="group relative overflow-hidden border border-charcoal/10 bg-parchment">
              <SmartImage
                key={activeSrc}
                src={activeSrc}
                alt={activeAlt}
                ratio="portrait"
                priority
                imgClassName="group-hover:scale-105"
              />
            </div>
            <div className="mt-4 flex gap-3" role="group" aria-label={`${name} gallery`}>
              {gallery.map((image, i) => (
                <button
                  key={`${image.src}-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-pressed={activeImage === i}
                  aria-label={`View image ${i + 1} — ${image.alt}`}
                  className={cn(
                    'relative h-20 w-24 cursor-pointer overflow-hidden border bg-parchment transition-all duration-300 focus-visible:outline-2 focus-visible:outline-gold',
                    activeImage === i
                      ? 'border-gold shadow-[0_10px_24px_-14px_rgba(201,162,39,0.7)]'
                      : 'border-charcoal/15 hover:border-charcoal/40',
                  )}
                >
                  <SmartImage src={image.src} alt="" ratio="none" className="h-full w-full" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — details */}
          <div>
            <p className="eyebrow text-terracotta">
              {provinceLabel} · {categoryNameValue}
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.06] tracking-tight text-charcoal md:text-5xl">
              {name}
            </h1>
            {lang !== 'kh' && product.nameKh && (
              <p className="mt-2 font-khmer text-base text-stone">{product.nameKh}</p>
            )}

            <div className="mt-5">
              <button
                type="button"
                onClick={() =>
                  document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                aria-label={`${product.rating} ${t('product.reviews')} — ${t('reviews.title')}`}
                className="cursor-pointer transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-gold"
              >
                <RatingStars
                  value={product.rating}
                  size="md"
                  showValue
                  reviews={product.reviews}
                  reviewsLabel={t('product.reviews')}
                />
              </button>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <p className="font-display text-3xl tracking-tight text-charcoal">
                {formatPrice(selectedSizeObj?.price ?? product.price)}
              </p>
              {selectedSizeObj && (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone">
                  / {selectedSizeObj.label}
                </p>
              )}
            </div>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-stone">
              {product.description}
            </p>

            <div className="rule mt-8" />

            {/* Size */}
            <div className="mt-8">
              <p className="eyebrow text-stone">{t('product.size')}</p>
              <div
                className="mt-3 flex flex-wrap gap-2"
                role="radiogroup"
                aria-label={t('product.size')}
              >
                {sizeOptions.map((s) => {
                  const active = (selectedSize || sizeOptions[0]?.label) === s.label;
                  return (
                    <button
                      key={s.label}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setSelectedSize(s.label)}
                      className={cn(
                        'h-11 cursor-pointer border px-5 text-sm font-semibold transition-all duration-300 focus-visible:outline-2 focus-visible:outline-gold',
                        active
                          ? 'border-forest bg-forest text-ivory'
                          : 'border-charcoal/20 text-charcoal hover:border-forest hover:text-forest',
                      )}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity + stock */}
            <div className="mt-8">
              <p className="eyebrow text-stone">{t('product.quantity')}</p>
              <div className="mt-3 flex flex-wrap items-center gap-5">
                <QuantityStepper value={qty} onChange={setQty} max={Math.max(product.stock, 1)} />
                {product.stock > 0 ? (
                  <span className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-moss">
                    <span className="h-1.5 w-1.5 rounded-full bg-moss" aria-hidden="true" />
                    {t('product.inStock')} ({product.stock})
                  </span>
                ) : (
                  <span className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">
                    <span className="h-1.5 w-1.5 rounded-full bg-terracotta" aria-hidden="true" />
                    {t('common.soldOut')}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-10 space-y-3">
              <button
                type="button"
                onClick={handleAdd}
                disabled={product.stock <= 0}
                className={cn(
                  'btn-primary h-14 w-full text-xs disabled:cursor-not-allowed disabled:opacity-40',
                  justAdded && 'bg-gold text-forest-deep',
                )}
              >
                {justAdded ? (
                  <>
                    <Check className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                    {t('common.added')}
                  </>
                ) : (
                  t('common.addToCart')
                )}
              </button>
              <button
                type="button"
                onClick={handleWishlist}
                aria-pressed={wished}
                className="btn-outline w-full"
              >
                <Heart
                  className={cn('h-4 w-4', wished && 'fill-terracotta text-terracotta')}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                {t('product.wishlist')}
              </button>
            </div>

            {/* Meta accordion */}
            <Accordion type="single" collapsible className="mt-10">
              <AccordionItem value="origin" className="border-charcoal/10">
                <AccordionTrigger className={accordionTrigger}>
                  {t('product.origin')}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-stone">
                  <p className="font-semibold text-charcoal">
                    {provinceLabel}, Cambodia
                  </p>
                  {prov?.description && <p className="mt-2">{prov.description}</p>}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="farmer" className="border-charcoal/10">
                <AccordionTrigger className={accordionTrigger}>
                  {t('product.farmer')}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-stone">
                  <p className="font-semibold text-charcoal">{product.farmerName}</p>
                  {farmer && (
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
                      {lang === 'kh' && farmer.roleKh ? farmer.roleKh : farmer.role} ·{' '}
                      {localizedProvince(farmer.province)}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={goFarmer}
                    disabled={!farmerSlug}
                    className="mt-4 inline-flex cursor-pointer items-center gap-2 border border-charcoal/25 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-charcoal transition-all duration-300 hover:border-forest hover:bg-forest hover:text-ivory focus-visible:outline-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t('product.meetFarmer')}
                    <ArrowRight className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                  </button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="production" className="border-charcoal/10">
                <AccordionTrigger className={accordionTrigger}>
                  {t('product.production')}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-stone">
                  <div className="flex flex-wrap gap-2">
                    {product.organic && (
                      <span className="flex items-center gap-2 border border-moss/40 bg-moss/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-moss">
                        <Leaf className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                        {t('common.organic')}
                      </span>
                    )}
                    {product.sustainable && (
                      <span className="flex items-center gap-2 border border-forest/30 bg-forest/5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-forest">
                        <Recycle className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                        {t('common.sustainable')}
                      </span>
                    )}
                    {!product.organic && !product.sustainable && (
                      <p>
                        {product.farmerName} · {product.unit}
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping" className="border-charcoal/10">
                <AccordionTrigger className={accordionTrigger}>
                  {t('product.shipping')}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-stone">
                  <p>{t('product.shippingValue')}</p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
                    {t('announcement.shipping')}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Farmer card */}
            {farmer && (
              <div className="card-editorial mt-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <SmartImage
                  src={farmer.portrait}
                  alt={farmer.name}
                  ratio="none"
                  className="h-20 w-20 shrink-0 border border-charcoal/10"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg leading-tight text-charcoal">{farmer.name}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-stone">
                    {lang === 'kh' && farmer.roleKh ? farmer.roleKh : farmer.role} ·{' '}
                    {localizedProvince(farmer.province)}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm italic leading-relaxed text-stone">
                    “{farmer.quote}”
                  </p>
                </div>
                <button
                  type="button"
                  onClick={goFarmer}
                  className="btn-outline h-10 shrink-0 px-4 text-[10px]"
                >
                  {t('common.meetFarmer')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── The Origin — map → province → farm → product ────────────────────── */}
      <section className="border-t border-charcoal/10 py-20 md:py-24">
        <div className="container-editorial">
          <SectionHeading
            eyebrow="THE ORIGIN"
            title={t('product.story.title')}
            subtitle={t('product.story.subtitle')}
          />
          <div className="mt-14">
            <OriginChain product={product} province={prov} farmer={farmer} />
          </div>
          <div className="mt-16 max-w-3xl">
            <p className="font-display text-lg leading-loose text-charcoal/85 md:text-xl">
              {product.story}
            </p>
            {prov?.description && (
              <p className="mt-8 text-base leading-relaxed text-stone">{prov.description}</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Reviews ─────────────────────────────────────────────────────────── */}
      <section
        id="reviews"
        className="scroll-mt-24 border-t border-charcoal/10 py-20 md:py-24"
        aria-label={t('reviews.title')}
      >
        <div className="container-editorial">
          <ProductReviews product={product} />
        </div>
      </section>

      {/* ── Related harvests ────────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="border-t border-charcoal/10 py-20 md:py-24">
          <div className="container-editorial">
            <SectionHeading title={t('product.related')} />
            <div className="mt-10 grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
              {related.map((p, i) => (
                <Reveal key={p.id} className="h-full" delay={(i % 4) * 70}>
                  <ProductCard product={p} className="h-full w-full" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Recently viewed ─────────────────────────────────────────────────── */}
      {mounted && recentProducts.length > 0 && (
        <section
          className="border-t border-charcoal/10 bg-parchment/40 py-16 md:py-20"
          aria-label={t('product.recentlyViewed')}
        >
          <div className="container-editorial">
            <p className="eyebrow flex items-center gap-3 text-terracotta">
              <span className="inline-block h-px w-10 bg-current opacity-60" aria-hidden="true" />
              {t('product.recentlyViewed')}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
              {recentProducts.map((p, i) => (
                <Reveal key={p.id} className="h-full" delay={(i % 4) * 70}>
                  <ProductCard product={p} className="h-full w-full" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Skeleton — calm pulses while the harvest loads ───────────────────────────

function ProductViewSkeleton() {
  return (
    <div className="container-editorial py-16" aria-busy="true" aria-label="Loading">
      <div className="h-3 w-44 animate-pulse bg-parchment" />
      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <div className="aspect-[4/5] animate-pulse bg-parchment" />
        <div className="space-y-5">
          <div className="h-3 w-36 animate-pulse bg-parchment" />
          <div className="h-12 w-3/4 animate-pulse bg-parchment" />
          <div className="h-4 w-1/2 animate-pulse bg-parchment" />
          <div className="h-9 w-32 animate-pulse bg-parchment" />
          <div className="h-20 w-full max-w-md animate-pulse bg-parchment" />
          <div className="h-11 w-2/3 animate-pulse bg-parchment" />
          <div className="h-14 w-full max-w-sm animate-pulse bg-parchment" />
        </div>
      </div>
    </div>
  );
}
