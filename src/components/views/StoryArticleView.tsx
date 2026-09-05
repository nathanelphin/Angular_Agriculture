'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Feather } from 'lucide-react';
import type { ViewProps } from '@/lib/types';
import { fetchProducts, fetchStories } from '@/lib/api';
import { useRouterStore } from '@/lib/stores/router';
import { useLang } from '@/lib/stores/lang';
import { formatDateLong } from '@/lib/format-date';
import { SmartImage } from '@/components/shared/SmartImage';
import { Reveal } from '@/components/shared/Reveal';
import { EmptyState } from '@/components/shared/EmptyState';
import { ReadingProgress } from '@/components/shared/ReadingProgress';
import { formatPrice } from '@/components/shared/ProductCard';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { useSeo } from '@/lib/useSeo';
import { cn } from '@/lib/utils';

// ─── Story article — long-form editorial reading view ────────────────────────

export default function StoryArticleView({ view }: ViewProps) {
  const slug = view.name === 'story' ? view.slug : '';
  const navigate = useRouterStore((s) => s.navigate);
  const { t, lang } = useLang();

  const { data: stories, isLoading } = useQuery({ queryKey: ['stories'], queryFn: fetchStories });
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });

  const story = (stories ?? []).find((s) => s.slug === slug);

  // SEO — story title + excerpt once the journal resolves.
  useSeo(
    story ? `${story.title} — Sovann Farm Journal` : undefined,
    story?.excerpt,
  );

  if (isLoading) return <ArticleSkeleton />;

  if (!story) {
    return (
      <div className="container-editorial">
        <EmptyState
          icon={<Feather className="h-7 w-7 text-moss" strokeWidth={1.25} />}
          title="Story not found"
          description="This page of the journal seems to have blown away with the monsoon — browse the other stories instead."
          action={
            <button type="button" onClick={() => navigate({ name: 'stories' })} className="btn-primary">
              {t('article.back')}
            </button>
          }
        />
      </div>
    );
  }

  const title = lang === 'kh' && story.titleKh ? story.titleKh : story.title;
  const relatedProduct = story.relatedProductSlug
    ? (products ?? []).find((p) => p.slug === story.relatedProductSlug)
    : undefined;
  const more = (stories ?? []).filter((s) => s.id !== story.id).slice(0, 2);

  // Prev / next by publication order (list order in the journal data).
  const all = stories ?? [];
  const idx = all.findIndex((s) => s.id === story.id);
  const prevStory = idx > 0 ? all[idx - 1] : undefined;
  const nextStory = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : undefined;
  const firstParagraph = story.content.findIndex((b) => b.type === 'paragraph');

  return (
    <article>
      {/* Reading progress — gold hairline at the very top of the viewport */}
      <ReadingProgress />

      {/* Back */}
      <div className="container-editorial pt-8 md:pt-10">
        <button
          type="button"
          onClick={() => navigate({ name: 'stories' })}
          className="eyebrow inline-flex cursor-pointer items-center gap-2 text-stone transition-colors duration-300 hover:text-forest"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          {t('article.back')}
        </button>
      </div>

      {/* Article header */}
      <header className="container-editorial max-w-3xl pt-10 text-center md:pt-14">
        <Reveal>
          <p className="eyebrow text-terracotta">{story.category}</p>
          <h1 className="mt-4 font-display text-4xl leading-[1.08] tracking-tight text-charcoal md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.22em] text-stone">
            <span>{story.author}</span>
            <span aria-hidden="true">·</span>
            <span>{formatDateLong(story.date, lang)}</span>
            <span aria-hidden="true">·</span>
            <span>
              {story.readTime} {t('stories.read')}
            </span>
          </p>
          <ShareButtons title={title} className="mt-6 justify-center" tone="light" />
        </Reveal>
      </header>

      {/* Hero image */}
      <Reveal delay={120} className="container-editorial mt-10">
        <SmartImage src={story.image} alt={title} ratio="wide" priority />
      </Reveal>

      {/* Content blocks */}
      <div className="container-editorial">
        <div className="mx-auto max-w-2xl space-y-8 py-16 md:py-20">
          {story.content.map((block, i) => {
            if (block.type === 'paragraph') {
              const lead = i === firstParagraph;
              return (
                <Reveal key={i}>
                  <p
                    className={
                      lead
                        ? cn(
                            'text-xl leading-loose text-charcoal/90',
                            // Magazine drop cap on the lead paragraph — Latin scripts only,
                            // Khmer combining marks render poorly with ::first-letter.
                            lang === 'en' && 'drop-cap',
                          )
                        : 'text-lg leading-loose text-charcoal/85'
                    }
                  >
                    {block.text}
                  </p>
                </Reveal>
              );
            }
            if (block.type === 'heading') {
              return (
                <Reveal key={i}>
                  <h2 className="mt-12 font-display text-3xl leading-snug tracking-tight text-charcoal">
                    {block.text}
                  </h2>
                </Reveal>
              );
            }
            if (block.type === 'quote') {
              return (
                <Reveal key={i}>
                  <blockquote className="my-10 border-l-2 border-gold pl-6">
                    <p className="font-display text-2xl italic leading-relaxed text-charcoal">
                      &ldquo;{block.text}&rdquo;
                    </p>
                    {block.caption && (
                      <p className="mt-3 text-xs uppercase tracking-[0.22em] text-stone">{block.caption}</p>
                    )}
                  </blockquote>
                </Reveal>
              );
            }
            // image block
            return (
              <Reveal key={i}>
                <figure className="my-10">
                  <SmartImage src={block.image} alt={block.caption ?? title} ratio="wide" />
                  {block.caption && (
                    <figcaption className="mt-2 text-center text-xs italic text-stone">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              </Reveal>
            );
          })}
        </div>

        {/* Shop-the-story CTA */}
        {relatedProduct && (
          <Reveal>
            <aside
              className="mt-8 flex flex-col items-center justify-between gap-6 bg-parchment p-8 md:flex-row md:p-12"
              aria-label={t('article.shopCta')}
            >
              <div className="flex flex-col items-center gap-5 text-center md:flex-row md:text-left">
                <SmartImage
                  src={relatedProduct.image}
                  alt={relatedProduct.name}
                  ratio="square"
                  className="w-20 shrink-0 md:w-24"
                />
                <div>
                  <p className="eyebrow text-terracotta">{relatedProduct.farmerName}</p>
                  <p className="mt-1.5 font-display text-2xl leading-snug text-charcoal">{relatedProduct.name}</p>
                  <p className="mt-1 text-sm text-stone">{formatPrice(relatedProduct.price)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate({ name: 'product', slug: relatedProduct.slug })}
                className="btn-primary shrink-0"
              >
                {t('article.shopCta')}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </aside>
          </Reveal>
        )}

        {/* Prev / next pagination */}
        {(prevStory || nextStory) && (
          <Reveal>
            <nav
              className="mt-16 grid border border-charcoal/10 bg-white sm:grid-cols-2"
              aria-label={t('article.prevStory')}
            >
              {prevStory ? (
                <button
                  type="button"
                  onClick={() => navigate({ name: 'story', slug: prevStory.slug })}
                  className="group flex cursor-pointer flex-col items-start gap-2 border-b border-charcoal/10 p-6 text-left transition-colors duration-300 hover:bg-parchment/50 sm:border-b-0 sm:border-r md:p-8"
                >
                  <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-stone transition-colors group-hover:text-terracotta">
                    <ArrowLeft className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                    {t('article.prevStory')}
                  </span>
                  <span className="line-clamp-2 font-display text-lg leading-snug text-charcoal transition-colors group-hover:text-forest">
                    {lang === 'kh' && prevStory.titleKh ? prevStory.titleKh : prevStory.title}
                  </span>
                </button>
              ) : (
                <span aria-hidden="true" className="hidden sm:block" />
              )}
              {nextStory && (
                <button
                  type="button"
                  onClick={() => navigate({ name: 'story', slug: nextStory.slug })}
                  className={cn(
                    'group flex cursor-pointer flex-col items-start gap-2 p-6 text-left transition-colors duration-300 hover:bg-parchment/50 sm:items-end sm:text-right md:p-8',
                    !prevStory && 'sm:col-span-2',
                  )}
                >
                  <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-stone transition-colors group-hover:text-terracotta">
                    {t('article.nextStory')}
                    <ArrowRight className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <span className="line-clamp-2 font-display text-lg leading-snug text-charcoal transition-colors group-hover:text-forest">
                    {lang === 'kh' && nextStory.titleKh ? nextStory.titleKh : nextStory.title}
                  </span>
                </button>
              )}
            </nav>
          </Reveal>
        )}

        {/* Continue reading */}
        {more.length > 0 && (
          <nav className="mt-16 pb-24 md:mt-20 md:pb-32" aria-label={t('article.related')}>
            <p className="eyebrow flex items-center gap-3 text-terracotta">
              <span className="inline-block h-px w-10 bg-current opacity-60" aria-hidden="true" />
              {t('article.related')}
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {more.map((s, i) => {
                const sTitle = lang === 'kh' && s.titleKh ? s.titleKh : s.title;
                return (
                  <Reveal key={s.id} delay={i * 80} className="h-full">
                    <button
                      type="button"
                      onClick={() => navigate({ name: 'story', slug: s.slug })}
                      className="group flex h-full w-full cursor-pointer items-center gap-5 border border-charcoal/10 bg-white p-4 text-left transition-colors duration-300 hover:border-charcoal/25"
                    >
                      <SmartImage
                        src={s.image}
                        alt={sTitle}
                        ratio="square"
                        className="w-20 shrink-0 md:w-24"
                        imgClassName="transition-transform duration-700 group-hover:scale-105"
                      />
                      <span className="min-w-0">
                        <span className="eyebrow block text-terracotta">{s.category}</span>
                        <span className="mt-1.5 block font-display text-xl leading-snug text-charcoal transition-colors duration-300 group-hover:text-forest">
                          {sTitle}
                        </span>
                        <span className="mt-1.5 block text-xs uppercase tracking-[0.2em] text-stone">
                          {s.author} · {s.readTime} {t('stories.read')}
                        </span>
                      </span>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </article>
  );
}

// ─── Loading skeleton ────────────────────────────────────────────────────────

function ArticleSkeleton() {
  return (
    <div className="container-editorial py-16" aria-hidden="true">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <div className="mx-auto h-3 w-24 animate-pulse bg-parchment" />
        <div className="mx-auto h-12 w-3/4 animate-pulse bg-parchment" />
        <div className="mx-auto h-3 w-48 animate-pulse bg-parchment" />
      </div>
      <div className="mt-10 aspect-[16/9] animate-pulse bg-parchment" />
      <div className="mx-auto mt-12 max-w-2xl space-y-4">
        <div className="h-3 w-full animate-pulse bg-parchment" />
        <div className="h-3 w-11/12 animate-pulse bg-parchment" />
        <div className="h-3 w-4/5 animate-pulse bg-parchment" />
        <div className="h-3 w-full animate-pulse bg-parchment" />
      </div>
    </div>
  );
}
