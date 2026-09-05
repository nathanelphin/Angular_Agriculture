'use client';

import { HeartHandshake, Sprout, Route, Recycle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLang } from '@/lib/stores/lang';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';

const PILLARS: { icon: LucideIcon; key: 'farmers' | 'farming' | 'local' | 'waste' }[] = [
  { icon: HeartHandshake, key: 'farmers' },
  { icon: Sprout, key: 'farming' },
  { icon: Route, key: 'local' },
  { icon: Recycle, key: 'waste' },
];

/**
 * 06 · The Future — four sustainability pillars as editorial index cards.
 */
export function SustainabilitySection() {
  const { t } = useLang();

  return (
    <section
      id="sustainability"
      aria-label="Sustainability"
      className="py-20 md:py-28"
    >
      <div className="container-editorial">
        <Reveal>
          <SectionHeading
            eyebrow={t('sustain.eyebrow')}
            title={t('sustain.title')}
            subtitle={t('sustain.subtitle')}
          />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.key} delay={i * 100} className="h-full">
              <div className="card-editorial group relative h-full p-8 transition-colors duration-500 hover:border-gold/60">
                {/* corner index */}
                <span
                  aria-hidden="true"
                  className="absolute right-6 top-6 font-display text-sm tracking-widest text-gold/40"
                >
                  0{i + 1}
                </span>

                <div className="mb-6 inline-flex border border-charcoal/15 p-3 transition-colors duration-500 group-hover:border-gold/60">
                  <pillar.icon
                    className="h-7 w-7 text-forest"
                    strokeWidth={1.25}
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-display text-xl leading-snug text-charcoal">
                  {t(`sustain.${pillar.key}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-stone">
                  {t(`sustain.${pillar.key}.desc`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
