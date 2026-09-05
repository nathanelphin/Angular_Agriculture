'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Check, Leaf, Sprout } from 'lucide-react';
import type { Farmer, Product, ViewProps } from '@/lib/types';
import { fetchFarmers, fetchProducts } from '@/lib/api';
import { useRouterStore } from '@/lib/stores/router';
import { useLang } from '@/lib/stores/lang';
import { getProvince, provinceName } from '@/lib/data/provinces';
import { SmartImage } from '@/components/shared/SmartImage';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { ProductCard } from '@/components/shared/ProductCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';

// ─── Farmer profile — a long-form editorial portrait ─────────────────────────

export default function FarmerProfileView({ view }: ViewProps) {
  const slug = view.name === 'farmer' ? view.slug : '';
  const navigate = useRouterStore((s) => s.navigate);
  const { t } = useLang();

  const { data: farmers, isLoading } = useQuery({ queryKey: ['farmers'], queryFn: fetchFarmers });
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });

  const farmer = (farmers ?? []).find((f) => f.slug === slug);

  if (isLoading) return <ProfileSkeleton />;

  if (!farmer) {
    return (
      <div className="container-editorial">
        <EmptyState
          icon={<Sprout className="h-7 w-7 text-moss" strokeWidth={1.25} />}
          title="Farmer not found"
          description="This profile has returned to the fields — meet the other producers of Sovann Farm instead."
          action={
            <button type="button" onClick={() => navigate({ name: 'farmers' })} className="btn-primary">
              {t('farmer.back')}
            </button>
          }
        />
      </div>
    );
  }

  const harvest = (products ?? []).filter((p) => farmer.products.includes(p.slug));

  return <Profile farmer={farmer} harvest={harvest} />;
}

// ─── Profile body ────────────────────────────────────────────────────────────

function Profile({ farmer, harvest }: { farmer: Farmer; harvest: Product[] }) {
  const navigate = useRouterStore((s) => s.navigate);
  const { t, lang } = useLang();

  const role = lang === 'kh' && farmer.roleKh ? farmer.roleKh : farmer.role;
  const province =
    lang === 'kh' ? (getProvince(farmer.province)?.nameKh ?? provinceName(farmer.province)) : provinceName(farmer.province);

  const stats = [
    { value: `${farmer.yearsFarming}+`, label: t('farmer.years') },
    { value: farmer.farmSize, label: t('farmer.size') },
    { value: farmer.specialty, label: t('farmers.specialty'), truncate: true },
  ];

  return (
    <article>
      {/* Back */}
      <div className="container-editorial pt-8 md:pt-10">
        <button
          type="button"
          onClick={() => navigate({ name: 'farmers' })}
          className="eyebrow inline-flex cursor-pointer items-center gap-2 text-stone transition-colors duration-300 hover:text-forest"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          {t('farmer.back')}
        </button>
      </div>

      {/* Hero */}
      <header className="container-editorial pb-16 pt-10 md:pb-20 md:pt-14">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="relative">
              <SmartImage
                src={farmer.portrait}
                alt={`${farmer.name} — ${province}, Cambodia`}
                ratio="portrait"
                priority
              />
              {lang === 'kh' && farmer.nameKh && (
                <span className="absolute bottom-3 left-3 bg-forest-deep/70 px-3 py-1 font-khmer text-xs text-ivory">
                  {farmer.nameKh}
                </span>
              )}
            </div>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7">
            <p className="eyebrow text-terracotta">
              {role} · {province}
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight text-charcoal md:text-7xl">
              {farmer.name}
            </h1>
            <blockquote className="mt-6 border-l-2 border-gold pl-6 font-display text-2xl italic leading-relaxed text-stone">
              &ldquo;{farmer.quote}&rdquo;
            </blockquote>
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-charcoal/10 pt-6 md:gap-6">
              {stats.map((s) => (
                <div key={s.label} className="min-w-0">
                  <p className="truncate font-display text-2xl leading-tight text-charcoal md:text-3xl" title={s.value}>
                    {s.value}
                  </p>
                  <p className="mt-1.5 text-xs uppercase tracking-[0.2em] text-stone">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </header>

      {/* The Farm */}
      <section className="py-16 md:py-20" aria-label={t('farmer.theFarm')}>
        <div className="container-editorial">
          <Reveal>
            <SectionHeading eyebrow={t('farmer.theFarm')} title={`${farmer.farmSize} of ${province}`} />
          </Reveal>
          <Reveal delay={100} className="group mt-10">
            <SmartImage
              src={farmer.farmImage}
              alt={`${t('farmer.theFarm')} — ${farmer.name}, ${province}`}
              ratio="wide"
              imgClassName="transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
            />
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {farmer.farm.map((paragraph, i) => (
              <Reveal key={i} delay={i * 80}>
                <p className="text-base leading-relaxed text-stone md:text-lg">{paragraph}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Practices */}
      <section className="bg-parchment/60 py-16 md:py-20" aria-label={t('farmer.practices')}>
        <div className="container-editorial">
          <Reveal className="max-w-4xl">
            <p className="eyebrow text-terracotta">Field Notes</p>
            <h2 className="mt-3 font-display text-3xl leading-tight tracking-tight text-charcoal md:text-4xl">
              {t('farmer.practices')}
            </h2>
          </Reveal>
          <ul className="mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
            {farmer.practices.map((practice, i) => (
              <Reveal as="li" key={i} delay={(i % 2) * 80}>
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-charcoal/15 bg-white">
                    <Check className="h-4 w-4 text-gold" strokeWidth={2} />
                  </span>
                  <span className="pt-1 text-sm leading-relaxed text-charcoal/85 md:text-base">{practice}</span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Their Story */}
      <section className="py-16 md:py-24" aria-label={t('farmer.theirStory')}>
        <div className="container-editorial">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <p className="eyebrow text-terracotta">{t('farmer.theirStory')}</p>
            </Reveal>
            <div className="mt-8 space-y-8">
              {farmer.story.map((paragraph, i) => (
                <Reveal key={i} delay={i * 60}>
                  <p
                    className={cn(
                      'text-lg leading-loose text-charcoal/85',
                      i === 0 &&
                        'first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.85] first-letter:text-forest',
                    )}
                  >
                    {paragraph}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability band */}
      <section className="bg-forest py-16 text-ivory md:py-20" aria-label={t('farmer.sustainability')}>
        <div className="container-editorial">
          <Reveal>
            <div className="flex flex-col items-center gap-8 md:flex-row">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-gold text-forest-deep">
                <Leaf className="h-6 w-6" strokeWidth={1.5} />
              </span>
              <div>
                <p className="eyebrow text-honey">{t('farmer.sustainability')}</p>
                <p className="mt-4 max-w-3xl font-display text-xl italic leading-relaxed text-ivory/80 md:text-2xl">
                  {farmer.sustainability}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* The Harvest */}
      <section className="py-16 md:py-24" aria-label={t('farmer.products')}>
        <div className="container-editorial">
          <Reveal>
            <SectionHeading
              eyebrow={t('farmer.products')}
              title={`From ${farmer.name}’s fields`}
              subtitle={t('farmer.productsSubtitle')}
            />
          </Reveal>
          {harvest.length > 0 ? (
            <div className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-4">
              {harvest.map((product, i) => (
                <Reveal key={product.id} delay={(i % 4) * 80} className="h-full">
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-10 max-w-xl text-base leading-relaxed text-stone">{t('farmer.productsSubtitle')}</p>
          )}
        </div>
      </section>
    </article>
  );
}

// ─── Loading skeleton ────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="container-editorial py-16" aria-hidden="true">
      <div className="h-3 w-24 animate-pulse bg-parchment" />
      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="aspect-[4/5] animate-pulse bg-parchment lg:col-span-5" />
        <div className="flex flex-col justify-end gap-4 lg:col-span-7">
          <div className="h-3 w-44 animate-pulse bg-parchment" />
          <div className="h-14 w-3/4 animate-pulse bg-parchment" />
          <div className="h-16 w-full animate-pulse bg-parchment" />
          <div className="grid grid-cols-3 gap-4 border-t border-charcoal/10 pt-6 md:gap-6">
            <div className="h-10 animate-pulse bg-parchment" />
            <div className="h-10 animate-pulse bg-parchment" />
            <div className="h-10 animate-pulse bg-parchment" />
          </div>
        </div>
      </div>
    </div>
  );
}
