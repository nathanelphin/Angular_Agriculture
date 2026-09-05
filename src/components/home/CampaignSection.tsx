'use client';

import type { ReactNode } from 'react';
import { useLang } from '@/lib/stores/lang';
import { useRouterStore } from '@/lib/stores/router';
import { Reveal } from '@/components/shared/Reveal';
import { KhmerOrnament } from '@/components/shared/KhmerOrnament';
import { SmartImage } from '@/components/shared/SmartImage';

const COLLECTION = [
  { name: 'Phka Malis Jasmine Rice', price: 8, slug: 'phka-malis-jasmine-rice' },
  { name: 'Kampot Black Pepper', price: 12, slug: 'kampot-black-pepper' },
  { name: 'Kampong Thom Palm Sugar', price: 9, slug: 'palm-sugar' },
  { name: 'Wild Mondulkiri Honey', price: 15, slug: 'forest-honey' },
];

function usd(price: number): string {
  return `$${price.toFixed(2)}`;
}

/** Golden italic accent on the word “Golden” when the title carries it. */
function goldenTitle(title: string): ReactNode {
  const idx = title.indexOf('Golden');
  if (idx === -1) return title;
  return (
    <>
      {title.slice(0, idx)}
      <em className="italic text-honey">Golden</em>
      {title.slice(idx + 'Golden'.length)}
    </>
  );
}

/**
 * Campaign — full-bleed dark chapter for the Golden Harvest collection,
 * with a hard-coded price ledger linking straight to product views.
 */
export function CampaignSection() {
  const { t } = useLang();
  const navigate = useRouterStore((s) => s.navigate);

  return (
    <section
      aria-label="The Golden Harvest collection"
      className="bg-forest-deep py-24 text-ivory md:py-36"
    >
      <div className="container-editorial grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Copy + price ledger */}
        <Reveal>
          <p className="eyebrow text-honey">{t('campaign.eyebrow')}</p>
          <h2 className="mt-5 font-display text-5xl leading-[1.02] tracking-tight md:text-7xl">
            {goldenTitle(t('campaign.title'))}
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ivory/70 md:text-lg">
            {t('campaign.subtitle')}
          </p>

          <ul className="mt-10">
            {COLLECTION.map((item) => (
              <li key={item.slug} className="border-b border-ivory/15 first:border-t">
                <button
                  type="button"
                  onClick={() => navigate({ name: 'product', slug: item.slug })}
                  className="group flex w-full cursor-pointer items-baseline justify-between gap-6 py-4 text-left transition-colors duration-300 hover:text-honey focus-visible:outline-2 focus-visible:outline-gold"
                >
                  <span className="font-display text-lg md:text-xl">{item.name}</span>
                  <span className="shrink-0 text-sm font-semibold tracking-[0.18em] text-ivory/80 transition-colors group-hover:text-honey">
                    {usd(item.price)}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <KhmerOrnament className="mt-8 opacity-70" width={120} />

          <button
            type="button"
            className="btn-gold mt-10"
            onClick={() => navigate({ name: 'shop' })}
          >
            {t('campaign.cta')}
          </button>
        </Reveal>

        {/* Campaign photograph */}
        <Reveal delay={150}>
          <div className="group relative">
            <SmartImage
              src="/images/campaign-golden-harvest.jpg"
              alt="Golden rice harvest in the Cambodian countryside"
              ratio="landscape"
              className="w-full border border-ivory/10"
              imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 border border-ivory/10"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
