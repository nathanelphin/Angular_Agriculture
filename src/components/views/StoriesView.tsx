'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Feather } from 'lucide-react';
import type { Story, ViewProps } from '@/lib/types';
import { fetchStories } from '@/lib/api';
import { useRouterStore } from '@/lib/stores/router';
import { useLang } from '@/lib/stores/lang';
import { SmartImage } from '@/components/shared/SmartImage';
import { Reveal } from '@/components/shared/Reveal';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';

// ─── Stories index — the journal of Sovann Farm ──────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function StoriesView({ view }: ViewProps) {
  void view;
  const navigate = useRouterStore((s) => s.navigate);
  const { t, lang } = useLang();
  const { data: stories, isLoading } = useQuery({ queryKey: ['stories'], queryFn: fetchStories });

  const list = stories ?? [];
  const featured = list.find((s) => s.featured) ?? list[0];
  const rest = featured ? list.filter((s) => s.id !== featured.id) : [];
  const titleOf = (s: Story) => (lang === 'kh' && s.titleKh ? s.titleKh : s.title);
  const open = (slug: string) => navigate({ name: 'story', slug });

  return (
    <div className="container-editorial pb-24 md:pb-32">
      {/* Header */}
      <header className="pt-12 md:pt-16">
        <Reveal>
          <p className="eyebrow flex items-center gap-3 text-terracotta">
            <span className="inline-block h-px w-10 bg-current opacity-60" aria-hidden="true" />
            The Journal
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight text-charcoal md:text-7xl">
            {t('stories.title')}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-stone md:text-lg">
            {t('stories.subtitle')}
          </p>
        </Reveal>
      </header>

      {isLoading ? (
        <StoriesSkeleton />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<Feather className="h-7 w-7 text-moss" strokeWidth={1.25} />}
          title="No stories yet"
          description="The journal is resting between seasons — return after the next harvest."
          action={
            <button type="button" onClick={() => navigate({ name: 'home' })} className="btn-primary">
              {t('common.backHome')}
            </button>
          }
        />
      ) : (
        <>
          {/* Featured story */}
          {featured && (
            <Reveal
              as="article"
              className="mt-12 grid items-center gap-10 border-b border-charcoal/10 pb-16 md:mt-16 lg:grid-cols-12"
            >
              <button
                type="button"
                onClick={() => open(featured.slug)}
                aria-label={titleOf(featured)}
                className="group relative block w-full cursor-pointer overflow-hidden focus-visible:outline-2 focus-visible:outline-gold lg:col-span-7"
              >
                <SmartImage
                  src={featured.image}
                  alt={titleOf(featured)}
                  ratio="wide"
                  priority
                  imgClassName="transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                />
              </button>
              <div className="lg:col-span-5">
                <p className="eyebrow text-gold">{t('stories.featured')}</p>
                <button
                  type="button"
                  onClick={() => open(featured.slug)}
                  className="mt-4 block cursor-pointer text-left font-display text-4xl leading-[1.1] tracking-tight text-charcoal transition-colors duration-300 hover:text-forest md:text-5xl"
                >
                  {titleOf(featured)}
                </button>
                <p className="mt-5 text-base leading-relaxed text-stone md:text-lg">{featured.excerpt}</p>
                <p className="mt-6 text-xs uppercase tracking-[0.22em] text-stone">
                  {featured.author} · {formatDate(featured.date)} · {featured.readTime} {t('stories.read')}
                </p>
                <button type="button" onClick={() => open(featured.slug)} className="btn-primary mt-8">
                  {t('common.readStory')}
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </Reveal>
          )}

          {/* Varying editorial rows */}
          <section aria-label={t('stories.all')}>
            {rest.map((story, i) => {
              const isLast = i === rest.length - 1;
              const title = titleOf(story);
              const border = !isLast ? 'border-b border-charcoal/10' : undefined;

              // Every third story — a wide cinematic banner.
              if (i % 3 === 2) {
                return (
                  <Reveal
                    key={story.id}
                    as="article"
                    className={cn('grid items-stretch gap-8 py-12 lg:grid-cols-12', border)}
                  >
                    <button
                      type="button"
                      onClick={() => open(story.slug)}
                      aria-label={title}
                      className="group relative block w-full cursor-pointer overflow-hidden focus-visible:outline-2 focus-visible:outline-gold lg:col-span-8"
                    >
                      <SmartImage
                        src={story.image}
                        alt={title}
                        ratio="tall"
                        className="w-full lg:aspect-[16/10]"
                        imgClassName="transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                      />
                    </button>
                    <div className="flex flex-col justify-center lg:col-span-4">
                      <p className="eyebrow text-terracotta">{story.category}</p>
                      <button
                        type="button"
                        onClick={() => open(story.slug)}
                        className="mt-3 cursor-pointer text-left font-display text-3xl leading-tight tracking-tight text-charcoal transition-colors duration-300 hover:text-forest"
                      >
                        {title}
                      </button>
                      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-stone md:text-base">
                        {story.excerpt}
                      </p>
                      <p className="mt-6 text-xs uppercase tracking-[0.22em] text-stone">
                        {story.author} · {formatDate(story.date)} · {story.readTime} {t('stories.read')}
                      </p>
                      <button
                        type="button"
                        onClick={() => open(story.slug)}
                        className="eyebrow mt-6 inline-flex cursor-pointer items-center gap-2 text-forest transition-colors duration-300 hover:text-terracotta"
                      >
                        {t('common.readStory')}
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </Reveal>
                );
              }

              // Standard alternating editorial row.
              const flip = i % 2 === 1;
              const ratio = i % 3 === 1 ? ('tall' as const) : ('landscape' as const);
              return (
                <Reveal
                  key={story.id}
                  as="article"
                  className={cn('grid items-center gap-8 py-12 lg:grid-cols-12', border)}
                >
                  <button
                    type="button"
                    onClick={() => open(story.slug)}
                    aria-label={title}
                    className={cn(
                      'group relative block w-full cursor-pointer overflow-hidden focus-visible:outline-2 focus-visible:outline-gold lg:col-span-5',
                      flip && 'lg:order-2',
                    )}
                  >
                    <SmartImage
                      src={story.image}
                      alt={title}
                      ratio={ratio}
                      imgClassName="transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                  </button>
                  <div className={cn('lg:col-span-7 lg:px-4', flip && 'lg:order-1')}>
                    <p className="eyebrow text-terracotta">{story.category}</p>
                    <button
                      type="button"
                      onClick={() => open(story.slug)}
                      className="mt-3 cursor-pointer text-left font-display text-3xl leading-tight tracking-tight text-charcoal transition-colors duration-300 hover:text-forest"
                    >
                      {title}
                    </button>
                    <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-stone md:text-base">
                      {story.excerpt}
                    </p>
                    <p className="mt-5 text-xs uppercase tracking-[0.22em] text-stone">
                      {story.author} · {formatDate(story.date)} · {story.readTime} {t('stories.read')}
                    </p>
                    <button
                      type="button"
                      onClick={() => open(story.slug)}
                      className="eyebrow mt-6 inline-flex cursor-pointer items-center gap-2 text-forest transition-colors duration-300 hover:text-terracotta"
                    >
                      {t('common.readStory')}
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                        strokeWidth={1.5}
                      />
                    </button>
                  </div>
                </Reveal>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}

// ─── Loading skeleton ────────────────────────────────────────────────────────

function StoriesSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="mt-12 grid items-center gap-10 border-b border-charcoal/10 pb-16 md:mt-16 lg:grid-cols-12">
        <div className="aspect-[16/9] animate-pulse bg-parchment lg:col-span-7" />
        <div className="space-y-4 lg:col-span-5">
          <div className="h-3 w-28 animate-pulse bg-parchment" />
          <div className="h-10 w-full animate-pulse bg-parchment" />
          <div className="h-10 w-2/3 animate-pulse bg-parchment" />
          <div className="h-3 w-48 animate-pulse bg-parchment" />
          <div className="h-12 w-44 animate-pulse bg-parchment" />
        </div>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="grid items-center gap-8 border-b border-charcoal/10 py-12 lg:grid-cols-12">
          <div
            className={cn('animate-pulse bg-parchment lg:col-span-5', i % 3 === 1 ? 'aspect-[3/4]' : 'aspect-[4/3]')}
          />
          <div className="space-y-3 lg:col-span-7">
            <div className="h-3 w-24 animate-pulse bg-parchment" />
            <div className="h-8 w-3/4 animate-pulse bg-parchment" />
            <div className="h-3 w-full animate-pulse bg-parchment" />
            <div className="h-3 w-2/3 animate-pulse bg-parchment" />
          </div>
        </div>
      ))}
    </div>
  );
}
