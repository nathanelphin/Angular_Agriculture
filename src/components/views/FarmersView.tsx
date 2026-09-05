'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Sprout } from 'lucide-react';
import type { Farmer, ViewProps } from '@/lib/types';
import { fetchFarmers } from '@/lib/api';
import { useRouterStore } from '@/lib/stores/router';
import { useLang } from '@/lib/stores/lang';
import { getProvince, provinceName } from '@/lib/data/provinces';
import { SmartImage } from '@/components/shared/SmartImage';
import { Reveal } from '@/components/shared/Reveal';
import { EmptyState } from '@/components/shared/EmptyState';

// ─── Farmers index — the producers of Sovann Farm ────────────────────────────

export default function FarmersView({ view }: ViewProps) {
  void view;
  const navigate = useRouterStore((s) => s.navigate);
  const { t } = useLang();
  const { data: farmers, isLoading } = useQuery({ queryKey: ['farmers'], queryFn: fetchFarmers });

  const list = farmers ?? [];

  return (
    <div className="container-editorial pb-24 md:pb-32">
      {/* Header */}
      <header className="pt-12 md:pt-16">
        <Reveal>
          <p className="eyebrow flex items-center gap-3 text-terracotta">
            <span className="inline-block h-px w-10 bg-current opacity-60" aria-hidden="true" />
            The Producers
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight text-charcoal md:text-7xl">
            {t('farmersPage.title')}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-stone md:text-lg">
            {t('farmersPage.subtitle')}
          </p>
        </Reveal>
      </header>

      {/* Grid */}
      <section className="mt-12 md:mt-16" aria-label={t('farmersPage.title')}>
        {isLoading ? (
          <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <FarmerCardSkeleton key={i} />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={<Sprout className="h-7 w-7 text-moss" strokeWidth={1.25} />}
            title="No farmers yet"
            description="Our producer directory is resting between seasons. Explore the harvest in the meantime."
            action={
              <button type="button" onClick={() => navigate({ name: 'home' })} className="btn-primary">
                {t('common.backHome')}
              </button>
            }
          />
        ) : (
          <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3 lg:pb-12">
            {list.map((farmer, i) => (
              <Reveal
                key={farmer.id}
                delay={(i % 3) * 90}
                className={i % 3 === 1 ? 'lg:translate-y-10' : undefined}
              >
                <FarmerCard farmer={farmer} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Farmer card ─────────────────────────────────────────────────────────────

function FarmerCard({ farmer }: { farmer: Farmer }) {
  const navigate = useRouterStore((s) => s.navigate);
  const { t, lang } = useLang();

  const open = () => navigate({ name: 'farmer', slug: farmer.slug });
  const name = lang === 'kh' && farmer.nameKh ? farmer.nameKh : farmer.name;
  const role = lang === 'kh' && farmer.roleKh ? farmer.roleKh : farmer.role;
  const province =
    lang === 'kh' ? (getProvince(farmer.province)?.nameKh ?? provinceName(farmer.province)) : provinceName(farmer.province);

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`${name} — ${t('farmers.profile')}`}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
      className="group cursor-pointer focus-visible:outline-2 focus-visible:outline-gold"
    >
      <div className="relative overflow-hidden bg-parchment">
        <SmartImage
          src={farmer.portrait}
          alt={`${farmer.name} — ${provinceName(farmer.province)}, Cambodia`}
          ratio="portrait"
          imgClassName="transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
        />
        {lang === 'kh' && farmer.nameKh && (
          <span className="absolute bottom-3 left-3 bg-forest-deep/70 px-3 py-1 font-khmer text-xs text-ivory">
            {farmer.nameKh}
          </span>
        )}
      </div>
      <div className="border border-t-0 border-charcoal/10 bg-white p-5 transition-colors duration-300 group-hover:border-charcoal/25">
        <p className="eyebrow text-terracotta">
          {role} · {province}
        </p>
        <h3 className="mt-2 font-display text-2xl leading-snug text-charcoal">{name}</h3>
        <p className="mt-3 line-clamp-3 text-sm italic leading-relaxed text-stone">&ldquo;{farmer.quote}&rdquo;</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-charcoal/10 pt-4">
          <span className="text-xs uppercase tracking-[0.18em] text-stone">
            {farmer.yearsFarming} {t('farmers.years')}
          </span>
          <span className="inline-flex shrink-0 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-forest transition-colors duration-300 group-hover:text-terracotta">
            {t('farmers.profile')}
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
              strokeWidth={1.5}
            />
          </span>
        </div>
      </div>
    </article>
  );
}

// ─── Loading skeleton ────────────────────────────────────────────────────────

function FarmerCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="aspect-[4/5] animate-pulse bg-parchment" />
      <div className="space-y-3 border border-t-0 border-charcoal/10 bg-white p-5">
        <div className="h-3 w-1/2 animate-pulse bg-parchment" />
        <div className="h-6 w-2/3 animate-pulse bg-parchment" />
        <div className="h-3 w-full animate-pulse bg-parchment" />
        <div className="h-3 w-5/6 animate-pulse bg-parchment" />
        <div className="h-px w-full bg-charcoal/5" />
        <div className="h-3 w-1/3 animate-pulse bg-parchment" />
      </div>
    </div>
  );
}
