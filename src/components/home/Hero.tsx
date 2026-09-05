'use client';

import { ArrowRight } from 'lucide-react';
import { useLang } from '@/lib/stores/lang';
import { useRouterStore } from '@/lib/stores/router';
import { SmartImage } from '@/components/shared/SmartImage';

/**
 * Hero — full-bleed rice-field photograph, editorial serif headline,
 * staggered entrance and a quiet scroll cue.
 */
export function Hero() {
  const { t } = useLang();
  const navigate = useRouterStore((s) => s.navigate);

  return (
    <section
      aria-label="Hero — The Harvest of Cambodia"
      className="relative -mt-16 flex min-h-[92svh] items-end overflow-hidden bg-forest-deep md:-mt-20"
    >
      {/* Background photograph with slow Ken Burns drift */}
      <SmartImage
        src="/images/hero-rice-fields.jpg"
        alt="Cambodian rice fields at golden hour"
        ratio="none"
        priority
        className="absolute inset-0"
        imgClassName="animate-kenburns"
      />

      {/* Legibility overlay — the only gradient allowed on imagery */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 via-forest-deep/25 to-forest-deep/30"
      />

      {/* Content */}
      <div className="container-editorial relative pb-16 pt-32 md:pb-24">
        <p
          className="eyebrow animate-fade-in text-honey"
          style={{ animationDelay: '80ms' }}
        >
          {t('hero.eyebrow')}
        </p>

        <h1 className="mt-6 font-display text-5xl leading-[0.98] tracking-tight text-ivory md:text-7xl lg:text-[7rem]">
          <span
            className="block animate-fade-in"
            style={{ animationDelay: '200ms' }}
          >
            {t('hero.titleA')}
          </span>
          <span
            className="block animate-fade-in italic text-honey"
            style={{ animationDelay: '340ms' }}
          >
            {t('hero.titleB')}
          </span>
        </h1>

        <div
          className="mt-8 max-w-xl animate-fade-in"
          style={{ animationDelay: '480ms' }}
        >
          <p className="text-base leading-relaxed text-ivory/85 md:text-lg">
            {t('hero.subtitle')}
          </p>
        </div>

        <div
          className="mt-10 flex flex-wrap items-center gap-4 animate-fade-in"
          style={{ animationDelay: '620ms' }}
        >
          <button
            type="button"
            className="btn-gold"
            onClick={() => navigate({ name: 'shop' })}
          >
            {t('hero.cta1')}
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn-light"
            onClick={() => navigate({ name: 'farmers' })}
          >
            {t('hero.cta2')}
          </button>
        </div>
      </div>

      {/* Scroll cue — vertical hairline + rotated micro label */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-ivory/60 [writing-mode:vertical-rl]">
          {t('hero.scroll')}
        </span>
        <span className="h-12 w-px animate-pulse bg-ivory/60" />
      </div>
    </section>
  );
}
