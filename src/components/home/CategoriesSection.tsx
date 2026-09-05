'use client';

import { ArrowRight } from 'lucide-react';
import type { CategoryId } from '@/lib/types';
import { categories } from '@/lib/data/categories';
import { useLang } from '@/lib/stores/lang';
import { useRouterStore } from '@/lib/stores/router';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { SmartImage } from '@/components/shared/SmartImage';
import { cn } from '@/lib/utils';

/**
 * Asymmetric editorial tile spans — rows on desktop always total 12 columns:
 * row 1–2: rice(5×2) + fruits(4×2) + spices(3) / sweeteners(3)
 * row 3:   nuts(4) + farm-goods(4) + artisan(4)
 * row 4:   gifts(12) as a wide banner
 */
const TILE_SPANS: Record<CategoryId, string> = {
  rice: 'col-span-2 row-span-2 lg:col-span-5 lg:row-span-2',
  fruits: 'col-span-2 row-span-2 lg:col-span-4 lg:row-span-2',
  spices: 'col-span-1 lg:col-span-3',
  sweeteners: 'col-span-1 lg:col-span-3',
  nuts: 'col-span-1 lg:col-span-4',
  'farm-goods': 'col-span-1 lg:col-span-4',
  artisan: 'col-span-2 lg:col-span-4',
  gifts: 'col-span-2 lg:col-span-12',
};

/**
 * The Pantry of Cambodia — asymmetric photo-tile grid, each tile
 * navigating into a pre-filtered shop view.
 */
export function CategoriesSection() {
  const { t } = useLang();
  const navigate = useRouterStore((s) => s.navigate);

  return (
    <section
      id="categories"
      aria-label="Shop by category"
      className="bg-parchment/60 py-20 md:py-28"
    >
      <div className="container-editorial">
        <Reveal>
          <SectionHeading
            eyebrow={t('categories.eyebrow')}
            title={t('categories.title')}
            subtitle={t('categories.subtitle')}
          />
        </Reveal>

        <div className="mt-12 grid auto-rows-[150px] grid-cols-2 gap-4 md:auto-rows-[220px] lg:grid-cols-12">
          {categories.map((category, i) => (
            <Reveal
              key={category.id}
              delay={(i % 3) * 90}
              className={cn('h-full', TILE_SPANS[category.id])}
            >
              <button
                type="button"
                onClick={() => navigate({ name: 'shop', category: category.id })}
                aria-label={`${category.name} — ${category.description}`}
                className="group relative block h-full w-full cursor-pointer overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-gold"
              >
                <SmartImage
                  src={category.image}
                  alt={category.name}
                  ratio="none"
                  className="absolute inset-0"
                  imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* legibility overlay, deepens on hover */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-forest-deep/30 transition-colors duration-500 group-hover:bg-forest-deep/45"
                />
                {/* label */}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-5">
                  <div className="min-w-0">
                    <h3 className="font-display text-xl leading-tight text-ivory md:text-2xl">
                      {category.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-[10px] tracking-wide text-ivory/70 sm:text-[11px]">
                      {category.description}
                    </p>
                  </div>
                  <ArrowRight
                    className="h-5 w-5 shrink-0 -translate-x-2 text-ivory opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
