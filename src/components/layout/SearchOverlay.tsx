'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { SmartImage } from '@/components/shared/SmartImage';
import { KhmerOrnament } from '@/components/shared/KhmerOrnament';
import { formatPrice } from '@/components/shared/ProductCard';
import { useRouterStore } from '@/lib/stores/router';
import { useUIStore } from '@/lib/stores/ui';
import { useLang } from '@/lib/stores/lang';
import { useDebounce } from '@/lib/hooks';
import { fetchFarmers, fetchProducts, fetchStories } from '@/lib/api';
import { provinceName, provinces } from '@/lib/data/provinces';
import type { View } from '@/lib/types';

const POPULAR_SEARCHES = ['pepper', 'rice', 'kampot', 'organic', 'honey'];
const MAX_PER_GROUP = 4;

function ResultSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="eyebrow text-stone">{label}</h3>
      <div className="mt-4 grid gap-2 md:grid-cols-2">{children}</div>
    </section>
  );
}

/**
 * Full-width search sheet dropping from the top of the viewport.
 * Searches products, farmers, stories and provinces as the user types.
 */
export function SearchOverlay() {
  const { t, lang } = useLang();
  const navigate = useRouterStore((s) => s.navigate);
  const open = useUIStore((s) => s.searchOpen);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 200);
  const inputRef = useRef<HTMLInputElement>(null);

  // Central close/reset — safe to call from event handlers.
  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
  };

  const products = useQuery({ queryKey: ['products'], queryFn: fetchProducts, enabled: open });
  const farmers = useQuery({ queryKey: ['farmers'], queryFn: fetchFarmers, enabled: open });
  const stories = useQuery({ queryKey: ['stories'], queryFn: fetchStories, enabled: open });

  const q = debounced.trim().toLowerCase();

  const results = useMemo(() => {
    const match = (fields: (string | string[] | undefined)[]) =>
      fields.some((field) =>
        Array.isArray(field)
          ? field.some((f) => f.toLowerCase().includes(q))
          : (field ?? '').toLowerCase().includes(q),
      );

    return {
      products: q
        ? (products.data ?? [])
            .filter((p) => match([p.name, p.nameKh, p.description]))
            .slice(0, MAX_PER_GROUP)
        : [],
      farmers: q
        ? (farmers.data ?? [])
            .filter((f) => match([f.name, f.nameKh, f.role, f.specialty]))
            .slice(0, MAX_PER_GROUP)
        : [],
      stories: q
        ? (stories.data ?? [])
            .filter((s) => match([s.title, s.titleKh, s.excerpt, s.category]))
            .slice(0, MAX_PER_GROUP)
        : [],
      provinces: q
        ? provinces
            .filter((p) => match([p.name, p.nameKh, p.description, p.tagline, p.knownFor]))
            .slice(0, MAX_PER_GROUP)
        : [],
    };
  }, [q, products.data, farmers.data, stories.data]);

  const searching =
    products.isPending || farmers.isPending || stories.isPending;
  const isEmpty =
    results.products.length === 0 &&
    results.farmers.length === 0 &&
    results.stories.length === 0 &&
    results.provinces.length === 0;

  const go = (v: View) => {
    navigate(v);
    closeSearch();
  };

  const pick = (en: string, kh?: string) => (lang === 'kh' && kh ? kh : en);

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setSearchOpen(true) : closeSearch())}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
        className="fixed left-0 right-0 top-0 w-full max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 bg-ivory p-0 shadow-[0_40px_90px_-40px_rgba(18,38,26,0.45)] duration-300 data-[state=closed]:slide-out-to-top data-[state=closed]:zoom-out-100 data-[state=open]:slide-in-from-top-16 data-[state=open]:zoom-in-100 sm:max-w-none"
      >
        <DialogDescription className="sr-only">{t('search.placeholder')}</DialogDescription>

        <div className="container-editorial py-10">
          {/* Heading + close */}
          <div className="flex items-start justify-between gap-6">
            <div>
              <KhmerOrnament width={72} />
              <p className="eyebrow mt-4 text-stone">{t('nav.search')}</p>
              <DialogTitle className="mt-2 font-display text-3xl text-charcoal md:text-4xl">
                {t('search.title')}
              </DialogTitle>
            </div>
            <button
              type="button"
              onClick={closeSearch}
              aria-label={t('common.close')}
              className="flex h-10 w-10 shrink-0 items-center justify-center border border-charcoal/15 text-charcoal transition-colors duration-300 hover:border-gold hover:text-gold"
            >
              <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>

          {/* Query input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            aria-label={t('search.title')}
            enterKeyHint="search"
            autoComplete="off"
            className="mt-8 w-full border-b-2 border-charcoal/20 bg-transparent py-3 font-display text-2xl text-charcoal placeholder:text-stone/60 focus:border-gold focus:outline-none"
          />

          {/* Results / empty states */}
          <div className="mt-8 max-h-[55vh] overflow-y-auto pb-2 pr-1">
            {q === '' ? (
              <div className="py-1">
                <p className="eyebrow text-stone">{t('search.popular')}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        inputRef.current?.focus();
                      }}
                      className="border border-charcoal/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-charcoal/70 transition-colors duration-300 hover:border-gold hover:text-gold"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : isEmpty && searching ? (
              <p className="py-10 text-center text-sm text-stone">{t('common.loading')}</p>
            ) : isEmpty ? (
              <div className="py-12 text-center">
                <p className="text-sm text-stone">{t('search.noResults')}</p>
                <p className="mt-2 font-display text-2xl text-charcoal">&ldquo;{debounced.trim()}&rdquo;</p>
              </div>
            ) : (
              <div className="space-y-9">
                {results.products.length > 0 && (
                  <ResultSection label={t('search.products')}>
                    {results.products.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => go({ name: 'product', slug: p.slug })}
                        className="flex w-full items-center gap-4 border border-transparent p-2 text-left transition-colors duration-300 hover:border-charcoal/10 hover:bg-white"
                      >
                        <SmartImage
                          src={p.image}
                          alt={p.name}
                          ratio="square"
                          className="h-14 w-14 shrink-0"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-charcoal">
                            {pick(p.name, p.nameKh)}
                          </span>
                          <span className="mt-0.5 block text-xs text-stone">
                            {formatPrice(p.price)} · {provinceName(p.province)}
                          </span>
                        </span>
                      </button>
                    ))}
                  </ResultSection>
                )}

                {results.farmers.length > 0 && (
                  <ResultSection label={t('search.farmers')}>
                    {results.farmers.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => go({ name: 'farmer', slug: f.slug })}
                        className="flex w-full items-center gap-4 border border-transparent p-2 text-left transition-colors duration-300 hover:border-charcoal/10 hover:bg-white"
                      >
                        <SmartImage
                          src={f.portrait}
                          alt={f.name}
                          ratio="square"
                          className="h-14 w-14 shrink-0"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-charcoal">
                            {pick(f.name, f.nameKh)}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-stone">
                            {pick(f.role, f.roleKh)} · {provinceName(f.province)}
                          </span>
                        </span>
                      </button>
                    ))}
                  </ResultSection>
                )}

                {results.stories.length > 0 && (
                  <ResultSection label={t('search.stories')}>
                    {results.stories.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => go({ name: 'story', slug: s.slug })}
                        className="flex w-full items-center gap-4 border border-transparent p-2 text-left transition-colors duration-300 hover:border-charcoal/10 hover:bg-white"
                      >
                        <SmartImage
                          src={s.image}
                          alt={s.title}
                          ratio="square"
                          className="h-14 w-14 shrink-0"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-charcoal">
                            {pick(s.title, s.titleKh)}
                          </span>
                          <span className="mt-0.5 block text-xs text-stone">{s.category}</span>
                        </span>
                      </button>
                    ))}
                  </ResultSection>
                )}

                {results.provinces.length > 0 && (
                  <ResultSection label={t('search.provinces')}>
                    {results.provinces.map((province) => (
                      <button
                        key={province.id}
                        type="button"
                        onClick={() => go({ name: 'shop', province: province.id })}
                        className="flex w-full items-center gap-4 border border-transparent p-2 text-left transition-colors duration-300 hover:border-charcoal/10 hover:bg-white"
                      >
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center border border-charcoal/10 bg-parchment text-forest">
                          <MapPin className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-charcoal">
                            {pick(province.name, province.nameKh)}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-stone">
                            {province.tagline}
                          </span>
                        </span>
                      </button>
                    ))}
                  </ResultSection>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
