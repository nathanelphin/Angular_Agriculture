'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Funnel, X } from 'lucide-react';
import type { CategoryId, ProvinceId, ViewProps } from '@/lib/types';
import { fetchProducts } from '@/lib/api';
import { useDebounce } from '@/lib/hooks';
import { useLang } from '@/lib/stores/lang';
import { categories } from '@/lib/data/categories';
import { getProvince, provinces as allProvinces, provinceName } from '@/lib/data/provinces';
import { EmptyState } from '@/components/shared/EmptyState';
import { ProductCard } from '@/components/shared/ProductCard';
import { Reveal } from '@/components/shared/Reveal';
import {
  FilterPanel,
  type PriceRange,
} from '@/components/shop/FilterPanel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type SortKey = 'featured' | 'newest' | 'priceAsc' | 'priceDesc' | 'bestselling';

const SORT_KEYS: SortKey[] = ['featured', 'newest', 'priceAsc', 'priceDesc', 'bestselling'];

// ─── ShopView — the full harvest catalogue, filtered client-side ──────────────

export default function ShopView({ view }: ViewProps) {
  const { t, lang } = useLang();

  const shopView = view.name === 'shop' ? view : { name: 'shop' as const };

  // ── Filter state (initialised from the routed view, e.g. #/shop?category=spices) ──
  const [category, setCategory] = useState<CategoryId | null>(shopView.category ?? null);
  const [province, setProvince] = useState<ProvinceId | null>(shopView.province ?? null);
  const [searchText, setSearchText] = useState(shopView.query ?? '');
  const [priceRange, setPriceRange] = useState<PriceRange>('any');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sustainableOnly, setSustainableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('featured');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filters initialise from the routed view (e.g. #/shop?category=spices) — the keyed view
  // wrapper remounts this component whenever the routed view object changes, so no sync
  // effect is needed here.

  const debouncedSearch = useDebounce(searchText, 250);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  // ── Client-side filtering + sorting ─────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!products) return [];
    const q = debouncedSearch.trim().toLowerCase();

    const list = products.filter((p) => {
      if (category && p.category !== category) return false;
      if (province && p.province !== province) return false;
      if (priceRange === 'lt10' && p.price >= 10) return false;
      if (priceRange === '10to20' && (p.price < 10 || p.price > 20)) return false;
      if (priceRange === 'gt20' && p.price <= 20) return false;
      if (organicOnly && !p.organic) return false;
      if (sustainableOnly && !p.sustainable) return false;
      if (q) {
        const haystack = [
          p.name,
          p.nameKh ?? '',
          p.description,
          p.farmerName,
          provinceName(p.province),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...list];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew));
        break;
      case 'priceAsc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'bestselling':
        sorted.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'featured':
      default:
        sorted.sort(
          (a, b) =>
            Number(b.featured) - Number(a.featured) ||
            Number(b.bestseller) - Number(a.bestseller) ||
            b.rating - a.rating,
        );
        break;
    }
    return sorted;
  }, [products, category, province, priceRange, organicOnly, sustainableOnly, debouncedSearch, sortBy]);

  const activeCount =
    (category ? 1 : 0) +
    (province ? 1 : 0) +
    (priceRange !== 'any' ? 1 : 0) +
    (organicOnly ? 1 : 0) +
    (sustainableOnly ? 1 : 0) +
    (searchText.trim() ? 1 : 0);

  const clearAll = () => {
    setCategory(null);
    setProvince(null);
    setSearchText('');
    setPriceRange('any');
    setOrganicOnly(false);
    setSustainableOnly(false);
  };

  const removeChip = (kind: 'category' | 'province' | 'price' | 'organic' | 'sustainable' | 'search') => {
    switch (kind) {
      case 'category':
        setCategory(null);
        break;
      case 'province':
        setProvince(null);
        break;
      case 'price':
        setPriceRange('any');
        break;
      case 'organic':
        setOrganicOnly(false);
        break;
      case 'sustainable':
        setSustainableOnly(false);
        break;
      case 'search':
        setSearchText('');
        break;
    }
  };

  const categoryName = (id: CategoryId | null) =>
    id ? (categories.find((c) => c.id === id)?.[lang === 'kh' ? 'nameKh' : 'name'] ?? id) : null;
  const provinceLabel = (id: ProvinceId | null) =>
    id ? (lang === 'kh' ? (getProvince(id)?.nameKh ?? id) : provinceName(id)) : null;
  const priceLabel: Record<Exclude<PriceRange, 'any'>, string> = {
    lt10: 'Under $10',
    '10to20': '$10 – $20',
    gt20: 'Over $20',
  };

  const chips: { kind: Parameters<typeof removeChip>[0]; label: string }[] = [];
  const cName = categoryName(category);
  const pName = provinceLabel(province);
  if (cName) chips.push({ kind: 'category', label: cName });
  if (pName) chips.push({ kind: 'province', label: pName });
  if (priceRange !== 'any') chips.push({ kind: 'price', label: priceLabel[priceRange] });
  if (organicOnly) chips.push({ kind: 'organic', label: t('common.organic') });
  if (sustainableOnly) chips.push({ kind: 'sustainable', label: t('common.sustainable') });
  if (searchText.trim()) chips.push({ kind: 'search', label: `“${searchText.trim()}”` });

  const filterPanel = (
    <FilterPanel
      categories={categories}
      provinces={allProvinces}
      search={searchText}
      onSearchChange={setSearchText}
      category={category}
      onCategoryChange={setCategory}
      province={province}
      onProvinceChange={setProvince}
      priceRange={priceRange}
      onPriceRangeChange={setPriceRange}
      organicOnly={organicOnly}
      onOrganicChange={setOrganicOnly}
      sustainableOnly={sustainableOnly}
      onSustainableChange={setSustainableOnly}
      activeCount={activeCount}
      onClear={clearAll}
    />
  );

  return (
    <div className="pb-24">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="pt-12 md:pt-16">
        <div className="container-editorial pb-10">
          <p className="eyebrow text-terracotta">SOVANN FARM · {t('nav.shop')}</p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.04] tracking-tight text-charcoal md:text-7xl">
            {t('shop.title')}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-stone md:text-lg">
            {t('shop.subtitle')}
          </p>
        </div>
      </header>

      {/* ── Filters + grid ─────────────────────────────────────────────────── */}
      <div className="container-editorial">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          {/* Desktop filter rail */}
          <aside className="hidden lg:block" aria-label={t('shop.filters')}>
            <div className="sticky top-24">{filterPanel}</div>
          </aside>

          <div>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-b border-charcoal/10 pb-5">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="btn-outline h-11 px-5 text-[10px] lg:hidden"
                aria-haspopup="dialog"
              >
                <Funnel className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                {t('shop.filters')}
                {activeCount > 0 && (
                  <span className="ml-1 flex h-5 min-w-5 items-center justify-center bg-gold px-1 text-[10px] font-bold text-forest-deep">
                    {activeCount}
                  </span>
                )}
              </button>

              <p
                className="text-xs font-semibold uppercase tracking-[0.24em] text-stone"
                aria-live="polite"
              >
                {filtered.length} {t('shop.results')}
              </p>

              <div className="ml-auto flex items-center gap-3">
                <label
                  htmlFor="shop-sort"
                  className="eyebrow hidden text-stone sm:block"
                >
                  {t('shop.sort')}
                </label>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                  <SelectTrigger
                    id="shop-sort"
                    className="h-11 w-[190px] rounded-none border-charcoal/25 bg-transparent text-xs font-semibold uppercase tracking-[0.12em] text-charcoal shadow-none focus:border-forest focus:ring-0 sm:w-[230px]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-charcoal/15">
                    {SORT_KEYS.map((key) => (
                      <SelectItem key={key} value={key} className="rounded-none text-xs">
                        {t(`shop.sort.${key}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filter chips */}
            {chips.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip.kind}
                    type="button"
                    onClick={() => removeChip(chip.kind)}
                    className="group flex cursor-pointer items-center gap-2 border border-charcoal/20 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-charcoal transition-colors hover:border-terracotta hover:text-terracotta focus-visible:outline-2 focus-visible:outline-gold"
                    aria-label={`${t('common.close')}: ${chip.label}`}
                  >
                    {chip.label}
                    <X className="h-3 w-3 text-stone transition-colors group-hover:text-terracotta" strokeWidth={2} aria-hidden="true" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearAll}
                  className="cursor-pointer text-[11px] font-bold uppercase tracking-[0.22em] text-terracotta underline decoration-terracotta/50 underline-offset-4 transition-colors hover:text-terracotta/75 focus-visible:outline-2 focus-visible:outline-gold"
                >
                  {t('shop.clearAll')}
                </button>
              </div>
            )}

            {/* Loading skeleton */}
            {isLoading && (
              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4" aria-busy="true" aria-label={t('common.loading')}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="border border-charcoal/10 bg-white">
                    <div className="aspect-[4/5] animate-pulse bg-parchment" />
                    <div className="space-y-2.5 p-5">
                      <div className="h-2.5 w-1/3 animate-pulse bg-parchment" />
                      <div className="h-4 w-3/4 animate-pulse bg-parchment" />
                      <div className="h-2.5 w-1/2 animate-pulse bg-parchment" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && filtered.length === 0 && (
              <EmptyState
                title={t('shop.empty')}
                description={t('shop.emptyDesc')}
                action={
                  <button type="button" onClick={clearAll} className="btn-primary">
                    {t('shop.clearAll')}
                  </button>
                }
              />
            )}

            {/* Product grid */}
            {!isLoading && filtered.length > 0 && (
              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
                {filtered.map((product, i) => (
                  <Reveal key={product.id} className="h-full" delay={(i % 4) * 70}>
                    <ProductCard product={product} priority={i < 4} className="h-full w-full" />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter sheet ────────────────────────────────────────────── */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="left"
          className="w-[330px] overflow-y-auto bg-ivory p-0 sm:max-w-[330px]"
        >
          <SheetHeader className="border-b border-charcoal/10 p-6 pb-5 text-left">
            <SheetTitle className="font-display text-2xl text-charcoal">
              {t('shop.filters')}
            </SheetTitle>
            <SheetDescription className="sr-only">{t('shop.subtitle')}</SheetDescription>
          </SheetHeader>
          <div className="px-6 pb-8">{filterPanel}</div>
          <div className={cn('sticky bottom-0 border-t border-charcoal/10 bg-ivory p-4')}>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="btn-primary w-full"
            >
              {t('shop.apply')} · {filtered.length}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
