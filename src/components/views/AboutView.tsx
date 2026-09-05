'use client';

import { useEffect } from 'react';
import { Eye, Gem, HeartHandshake, Landmark, Sprout, Target } from 'lucide-react';
import type { ViewProps } from '@/lib/types';
import { useRouterStore } from '@/lib/stores/router';
import { useLang } from '@/lib/stores/lang';
import { SmartImage } from '@/components/shared/SmartImage';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { KhmerOrnament } from '@/components/shared/KhmerOrnament';

// ─── About — our house, our values, our promise ──────────────────────────────

const STATS = [
  { value: '65%', label: 'of price to farmers' },
  { value: '8', label: 'provinces sourced' },
  { value: '40+', label: 'partner farms' },
  { value: '100%', label: 'traceable harvests' },
];

export default function AboutView({ view }: ViewProps) {
  const navigate = useRouterStore((s) => s.navigate);
  const { t } = useLang();
  const anchor = view.name === 'about' ? view.anchor : undefined;

  // Navbar targets #sustainability on this view — scroll once content mounts.
  useEffect(() => {
    if (!anchor) return;
    const timer = window.setTimeout(() => {
      document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [anchor]);

  const values = [
    { icon: HeartHandshake, title: t('about.value.fairness.title'), desc: t('about.value.fairness.desc') },
    { icon: Landmark, title: t('about.value.heritage.title'), desc: t('about.value.heritage.desc') },
    { icon: Gem, title: t('about.value.quality.title'), desc: t('about.value.quality.desc') },
    { icon: Sprout, title: t('about.value.future.title'), desc: t('about.value.future.desc') },
  ];

  return (
    <div className="pb-4">
      {/* Hero */}
      <header className="pb-12 pt-16 md:pt-20">
        <div className="container-editorial">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-terracotta">
              <span className="inline-block h-px w-10 bg-current opacity-60" aria-hidden="true" />
              Our House
            </p>
            <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.02] tracking-tight text-charcoal md:text-8xl">
              {t('about.title')}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone">{t('about.subtitle')}</p>
          </Reveal>
          <Reveal delay={140} className="group mt-10">
            <SmartImage
              src="/images/about-landscape.jpg"
              alt="Cambodian farmland at golden hour — rice fields stretching to the horizon"
              ratio="wide"
              priority
              imgClassName="transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
            />
          </Reveal>
        </div>
      </header>

      {/* Mission / Vision */}
      <section className="py-16 md:py-20" aria-label={`${t('about.mission.title')} · ${t('about.vision.title')}`}>
        <div className="container-editorial grid gap-6 md:grid-cols-2">
          <Reveal className="card-editorial p-10">
            <Target className="h-6 w-6 text-moss" strokeWidth={1.25} />
            <p className="eyebrow mt-6 text-gold">{t('about.mission.title')}</p>
            <p className="mt-4 text-lg leading-relaxed text-charcoal/85">{t('about.mission.body')}</p>
          </Reveal>
          <Reveal delay={120} className="card-editorial p-10">
            <Eye className="h-6 w-6 text-mekong" strokeWidth={1.25} />
            <p className="eyebrow mt-6 text-gold">{t('about.vision.title')}</p>
            <p className="mt-4 text-lg leading-relaxed text-charcoal/85">{t('about.vision.body')}</p>
          </Reveal>
        </div>
      </section>

      {/* Imagery break */}
      <Reveal className="container-editorial">
        <figure>
          <SmartImage
            src="/images/about-hands-grain.jpg"
            alt="A farmer's hands holding freshly milled jasmine rice grain"
            ratio="cinema"
          />
          <figcaption className="mt-3 text-center text-sm italic text-stone">
            Rice from the 2026 harvest, Prey Veng.
          </figcaption>
        </figure>
      </Reveal>

      {/* Values */}
      <section className="py-16 md:py-20" aria-label={t('about.values.title')}>
        <div className="container-editorial">
          <Reveal>
            <SectionHeading align="center" eyebrow="What We Stand For" title={t('about.values.title')} />
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 80} className="card-editorial h-full p-8">
                <span className="flex h-11 w-11 items-center justify-center border border-charcoal/10 bg-parchment">
                  <v.icon className="h-5 w-5 text-forest" strokeWidth={1.5} />
                </span>
                <h3 className="mt-6 font-display text-2xl text-charcoal">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone">{v.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability band — navbar anchor target */}
      <section
        id="sustainability"
        className="scroll-mt-24 bg-forest py-20 text-ivory"
        aria-label={t('about.sustainability.title')}
      >
        <div className="container-editorial">
          <Reveal>
            <p className="eyebrow text-honey">{t('about.sustainability.title')}</p>
            <p className="mt-6 max-w-2xl text-lg leading-loose text-ivory/80">{t('about.sustainability.body')}</p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="border-l border-ivory/15 pl-6">
                  <p className="font-display text-4xl text-honey">{s.value}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.22em] text-ivory/60">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={200}>
            <KhmerOrnament className="mt-14 opacity-80" width={120} />
          </Reveal>
        </div>
      </section>

      {/* CTA row */}
      <section className="py-16 text-center md:py-20" aria-label="Call to action">
        <div className="container-editorial">
          <Reveal>
            <KhmerOrnament className="mx-auto mb-8" />
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button type="button" onClick={() => navigate({ name: 'farmers' })} className="btn-primary">
                {t('about.cta')}
              </button>
              <button type="button" onClick={() => navigate({ name: 'shop' })} className="btn-outline">
                {t('featured.cta')}
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
