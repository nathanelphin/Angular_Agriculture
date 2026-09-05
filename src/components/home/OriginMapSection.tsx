'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import type { ProvinceId } from '@/lib/types';
import { fetchProducts, fetchFarmers } from '@/lib/api';
import {
  MAP_VIEWBOX,
  provinceShapes,
  fillerShapes,
  tonleSapPath,
  mekongPath,
  provinces,
  provinceName,
} from '@/lib/data/provinces';
import { useLang } from '@/lib/stores/lang';
import { useRouterStore } from '@/lib/stores/router';
import { formatPrice } from '@/components/shared/ProductCard';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { SmartImage } from '@/components/shared/SmartImage';
import { cn } from '@/lib/utils';

const MAP_FILLS = {
  filler: 'rgba(28,58,42,0.05)',
  idle: 'rgba(28,58,42,0.12)',
  hover: 'rgba(201,162,39,0.35)',
  selected: '#C9A227',
  ivory: '#FAF6EE',
  forest: '#1C3A2A',
  forestDeep: '#12261A',
  mekong: '#40616E',
  label: 'rgba(38,34,28,0.8)',
};

/**
 * 05 · The Origin — interactive stylised SVG map of Cambodia with a
 * province detail panel (products, farmers, provenance copy).
 */
export function OriginMapSection() {
  const { t } = useLang();
  const navigate = useRouterStore((s) => s.navigate);
  const [selected, setSelected] = useState<ProvinceId>('kampot');
  const [hovered, setHovered] = useState<ProvinceId | null>(null);

  const productsQuery = useQuery({ queryKey: ['products'], queryFn: fetchProducts });
  const farmersQuery = useQuery({ queryKey: ['farmers'], queryFn: fetchFarmers });

  const products = productsQuery.data ?? [];
  const farmers = farmersQuery.data ?? [];

  const province = provinces.find((p) => p.id === selected);
  const provProducts = products.filter((p) => p.province === selected).slice(0, 3);
  const provFarmers = farmers.filter((f) => f.province === selected);

  return (
    <section
      id="origin"
      aria-label="Origins across Cambodia"
      className="bg-parchment/60 py-24"
    >
      <div className="container-editorial">
        <Reveal>
          <SectionHeading
            eyebrow={t('origin.eyebrow')}
            title={t('origin.title')}
            subtitle={t('origin.subtitle')}
            align="center"
            ornament
          />
        </Reveal>

        <div className="mt-14 grid items-start gap-12 lg:grid-cols-12 lg:gap-10">
          {/* ── Interactive map ─────────────────────────────────────────── */}
          <Reveal className="lg:col-span-6">
            <svg
              viewBox={MAP_VIEWBOX}
              className="mx-auto h-auto w-full max-w-xl"
              role="group"
              aria-label="Stylised map of Cambodia — select a province"
            >
              {/* silhouette filler provinces (non-interactive) */}
              {fillerShapes.map((shape) => (
                <path
                  key={shape.id}
                  d={shape.path}
                  fill={MAP_FILLS.filler}
                  stroke={MAP_FILLS.ivory}
                  strokeWidth={1}
                />
              ))}

              {/* Tonle Sap lake */}
              <path d={tonleSapPath} fill="rgba(64,97,110,0.4)" />

              {/* Mekong river */}
              <path
                d={mekongPath}
                fill="none"
                stroke={MAP_FILLS.mekong}
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />

              {/* selectable partner provinces */}
              {Object.entries(provinceShapes).map(([id, shape]) => {
                const pid = id as ProvinceId;
                const isSelected = pid === selected;
                const isHovered = pid === hovered;
                const fill = isSelected
                  ? MAP_FILLS.selected
                  : isHovered
                    ? MAP_FILLS.hover
                    : MAP_FILLS.idle;
                const name = provinceName(pid);

                return (
                  <g key={pid}>
                    <path
                      d={shape.path}
                      fill={fill}
                      stroke={isSelected ? MAP_FILLS.forest : 'transparent'}
                      strokeWidth={isSelected ? 1.5 : 0}
                      className="cursor-pointer outline-none transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                      tabIndex={0}
                      role="button"
                      aria-label={name}
                      aria-pressed={isSelected}
                      onClick={() => setSelected(pid)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelected(pid);
                        }
                      }}
                      onMouseEnter={() => setHovered(pid)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(pid)}
                      onBlur={() => setHovered(null)}
                    />
                    <text
                      x={shape.label.x}
                      y={shape.label.y}
                      textAnchor="middle"
                      pointerEvents="none"
                      className={cn(
                        'font-display text-[13px] transition-colors duration-300',
                        isSelected ? 'font-bold fill-forest-deep' : 'fill-charcoal/80',
                      )}
                    >
                      {name}
                    </text>
                  </g>
                );
              })}
            </svg>
            <p className="mt-4 text-center text-xs text-stone">{t('origin.hint')}</p>
          </Reveal>

          {/* ── Province panel ──────────────────────────────────────────── */}
          <Reveal delay={150} className="lg:col-span-6">
            {province && (
              <div key={province.id} className="animate-fade-in">
                <div className="group relative">
                  <SmartImage
                    src={province.image}
                    alt={`${province.name} — ${province.tagline}`}
                    ratio="landscape"
                    className="w-full"
                    imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 bg-forest-deep/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-honey">
                    {province.nameKh}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h3 className="font-display text-4xl tracking-tight text-charcoal">
                    {province.name}
                  </h3>
                  <span className="text-base text-stone">{province.nameKh}</span>
                </div>
                <p className="eyebrow mt-3 text-terracotta">{province.tagline}</p>
                <p className="mt-4 text-sm leading-relaxed text-stone md:text-base">
                  {province.description}
                </p>

                {/* Known for */}
                <p className="eyebrow mt-8 text-stone">{t('origin.knownFor')}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {province.knownFor.map((item) => (
                    <li
                      key={item}
                      className="border border-charcoal/15 px-3 py-1 text-xs text-charcoal/80"
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Products from this province */}
                <p className="eyebrow mt-8 text-stone">{t('origin.products')}</p>
                {productsQuery.isPending ? (
                  <div className="mt-3 space-y-2" aria-busy="true" aria-label={t('common.loading')}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-3" aria-hidden="true">
                        <div className="h-12 w-12 animate-pulse bg-parchment" />
                        <div className="h-4 w-2/3 animate-pulse bg-parchment" />
                      </div>
                    ))}
                  </div>
                ) : provProducts.length > 0 ? (
                  <ul className="mt-3">
                    {provProducts.map((product) => (
                      <li key={product.id} className="border-b border-charcoal/10 last:border-b-0">
                        <button
                          type="button"
                          onClick={() => navigate({ name: 'product', slug: product.slug })}
                          className="group flex w-full cursor-pointer items-center gap-3 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-gold"
                        >
                          <SmartImage
                            src={product.image}
                            alt={product.name}
                            ratio="square"
                            className="h-12 w-12 shrink-0"
                          />
                          <span className="min-w-0 flex-1 truncate text-sm text-charcoal transition-colors group-hover:text-forest">
                            {product.name}
                          </span>
                          <span className="shrink-0 text-sm font-semibold text-stone">
                            {formatPrice(product.price)}
                          </span>
                        </button>
                      </li>
                    ))}
                    <li className="pt-2">
                      <button
                        type="button"
                        onClick={() => navigate({ name: 'shop', province: selected })}
                        className="inline-flex cursor-pointer items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-forest transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-gold"
                      >
                        {t('common.viewAll')}
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                      </button>
                    </li>
                  </ul>
                ) : (
                  <div className="mt-3 border-b border-charcoal/10 pb-3">
                    <button
                      type="button"
                      onClick={() => navigate({ name: 'shop', province: selected })}
                      className="inline-flex cursor-pointer items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-forest transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-gold"
                    >
                      {t('common.viewAll')}
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                    </button>
                  </div>
                )}

                {/* Featured farmers */}
                {farmersQuery.isPending ? (
                  <div className="mt-8 flex gap-2" aria-busy="true" aria-hidden="true">
                    <div className="h-9 w-40 animate-pulse bg-parchment" />
                    <div className="h-9 w-40 animate-pulse bg-parchment" />
                  </div>
                ) : provFarmers.length > 0 ? (
                  <>
                    <p className="eyebrow mt-8 text-stone">{t('origin.farmers')}</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {provFarmers.map((farmer) => (
                        <li key={farmer.id}>
                          <button
                            type="button"
                            onClick={() => navigate({ name: 'farmer', slug: farmer.slug })}
                            className="cursor-pointer border border-charcoal/15 px-3 py-2 text-xs text-charcoal/80 transition-colors duration-300 hover:border-forest hover:text-forest focus-visible:outline-2 focus-visible:outline-gold"
                          >
                            {farmer.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}

                <button
                  type="button"
                  className="btn-primary mt-10"
                  onClick={() => navigate({ name: 'shop', province: selected })}
                >
                  {t('origin.explore')}
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
