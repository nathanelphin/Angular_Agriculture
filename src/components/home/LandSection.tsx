'use client';

import { useCountUp } from '@/lib/hooks';
import { useLang } from '@/lib/stores/lang';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';

/**
 * 01 · The Land — editorial statement paired with a 2×2 stat ledger.
 * Each number counts itself up the first time it scrolls into view.
 */
export function LandSection() {
  const { t } = useLang();

  const stats = [
    { value: 40, suffix: '+', label: t('stats.farms') },
    { value: 120, suffix: '', label: t('stats.farmers') },
    { value: 8, suffix: '', label: t('stats.provinces') },
    { value: 65, suffix: '%', label: t('stats.direct') },
  ];

  return (
    <section
      id="land"
      aria-label="The land of Cambodia"
      className="container-editorial py-20 md:py-28"
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        {/* Statement */}
        <Reveal className="lg:col-span-7">
          <SectionHeading
            eyebrow={t('land.eyebrow')}
            title={t('land.title')}
            className="max-w-none"
          />
          <p className="mt-6 max-w-xl text-base leading-relaxed text-stone md:text-lg">
            {t('land.body')}
          </p>
        </Reveal>

        {/* Stats ledger */}
        <Reveal delay={150} className="lg:col-span-5">
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 self-start">
            {stats.map((stat) => (
              <StatCell key={stat.label} {...stat} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function StatCell({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const [ref, display] = useCountUp(value);
  return (
    <div className="border-l-2 border-gold pl-4">
      <p
        ref={ref}
        className="font-display text-4xl tabular-nums tracking-tight text-forest md:text-5xl"
      >
        {display}
        {suffix}
      </p>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone">
        {label}
      </p>
    </div>
  );
}
