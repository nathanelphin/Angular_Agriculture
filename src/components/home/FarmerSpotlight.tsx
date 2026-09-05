'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { fetchFarmers } from '@/lib/api';
import { useLang } from '@/lib/stores/lang';
import { useRouterStore } from '@/lib/stores/router';
import { provinceName } from '@/lib/data/provinces';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { SmartImage } from '@/components/shared/SmartImage';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';

/**
 * 04 · The Farmers — three portraits, middle card dropped for rhythm.
 */
export function FarmerSpotlight() {
  const { t } = useLang();
  const navigate = useRouterStore((s) => s.navigate);
  const { data, isPending, isError } = useQuery({
    queryKey: ['farmers'],
    queryFn: fetchFarmers,
  });

  const farmers = (data ?? []).slice(0, 3);

  return (
    <section
      aria-label="Meet the farmers"
      className="container-editorial py-20 md:py-28"
    >
      {/* Header */}
      <Reveal className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          eyebrow={t('farmers.eyebrow')}
          title={t('farmers.title')}
          subtitle={t('farmers.subtitle')}
        />
        <button
          type="button"
          className="btn-outline"
          onClick={() => navigate({ name: 'farmers' })}
        >
          {t('farmers.cta')}
        </button>
      </Reveal>

      {/* Grid */}
      {isPending ? (
        <div
          className="mt-12 grid gap-5 md:grid-cols-3"
          aria-busy="true"
          aria-label={t('common.loading')}
        >
          {[0, 1, 2].map((i) => (
            <div key={i} aria-hidden="true">
              <div className="aspect-[4/5] animate-pulse bg-parchment" />
              <div className="mt-5 space-y-3">
                <div className="h-3 w-1/2 animate-pulse bg-parchment" />
                <div className="h-6 w-2/3 animate-pulse bg-parchment" />
                <div className="h-4 w-full animate-pulse bg-parchment" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title={t('farmers.title')}
          description={t('farmers.subtitle')}
          action={
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate({ name: 'farmers' })}
            >
              {t('farmers.cta')}
            </button>
          }
        />
      ) : (
        <div className="mt-12 grid gap-x-5 gap-y-12 md:grid-cols-3">
          {farmers.map((farmer, i) => (
            <Reveal
              key={farmer.id}
              delay={i * 120}
              className={cn(i === 1 && 'lg:translate-y-10')}
            >
              <article
                className="group cursor-pointer"
                onClick={() => navigate({ name: 'farmer', slug: farmer.slug })}
              >
                <button
                  type="button"
                  aria-label={`${t('common.meetFarmer')}: ${farmer.name}`}
                  className="relative block w-full cursor-pointer overflow-hidden focus-visible:outline-2 focus-visible:outline-gold"
                >
                  <SmartImage
                    src={farmer.portrait}
                    alt={`${farmer.name} — ${farmer.role}, ${provinceName(farmer.province)}`}
                    ratio="portrait"
                    imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </button>
                <p className="eyebrow mt-5 text-terracotta">
                  {farmer.role} · {provinceName(farmer.province)}
                </p>
                <h3 className="mt-2 font-display text-2xl leading-snug text-charcoal transition-colors duration-300 group-hover:text-forest">
                  {farmer.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm italic leading-relaxed text-stone">
                  “{farmer.quote}”
                </p>
                <button
                  type="button"
                  onClick={() => navigate({ name: 'farmer', slug: farmer.slug })}
                  className="mt-4 inline-flex cursor-pointer items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-forest transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-gold"
                >
                  {t('common.meetFarmer')}
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </button>
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
