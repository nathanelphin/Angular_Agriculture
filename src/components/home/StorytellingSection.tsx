'use client';

import { useLang } from '@/lib/stores/lang';
import { useRouterStore } from '@/lib/stores/router';
import { Reveal } from '@/components/shared/Reveal';
import { SmartImage } from '@/components/shared/SmartImage';

/**
 * 03 · The Stories — editorial image with offset gold frame and a pull-quote.
 */
export function StorytellingSection() {
  const { t } = useLang();
  const navigate = useRouterStore((s) => s.navigate);

  return (
    <section
      id="stories"
      aria-label="Stories from the soil"
      className="container-editorial py-24 md:py-28"
    >
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
        {/* Photograph with offset gold frame */}
        <Reveal className="lg:col-span-6">
          <div className="relative mr-4 mb-4 lg:mr-6 lg:mb-6">
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-4 translate-y-4 border border-gold"
            />
            <SmartImage
              src="/images/story-featured-farmer.jpg"
              alt="A Cambodian farmer standing in a green rice field"
              ratio="tall"
              className="relative z-10 w-full"
            />
          </div>
        </Reveal>

        {/* Copy + pull-quote */}
        <Reveal delay={150} className="lg:col-span-6">
          <p className="eyebrow text-terracotta">{t('storysec.eyebrow')}</p>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight text-charcoal md:text-6xl">
            {t('storysec.title')}
          </h2>
          <p className="mt-6 max-w-xl leading-loose text-stone">
            {t('storysec.body')}
          </p>
          <p className="mt-8 max-w-xl border-l-2 border-gold pl-6 font-display text-xl italic leading-relaxed text-charcoal">
            Behind every grain of rice is a farmer, a field, a season, and
            generations of knowledge.
          </p>
          <button
            type="button"
            className="btn-outline mt-10"
            onClick={() => navigate({ name: 'stories' })}
          >
            {t('storysec.cta')}
          </button>
        </Reveal>
      </div>
    </section>
  );
}
