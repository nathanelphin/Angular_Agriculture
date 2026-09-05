'use client';

import { useMemo, useState } from 'react';
import { Check, PenLine, Quote, Star } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/lib/types';
import { useLang } from '@/lib/stores/lang';
import { useMounted } from '@/lib/hooks';
import { RatingStars } from '@/components/shared/RatingStars';
import { Reveal } from '@/components/shared/Reveal';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ─── Product reviews — deterministic seeded reviews per product ──────────────
// Reviews are derived from the product's rating/review count so the section is
// stable across reloads without a review database (prototype scope).

interface Review {
  id: string;
  author: string;
  authorKh?: string;
  location: string;
  locationKh?: string;
  stars: number;
  date: string; // ISO
  title: string;
  titleKh?: string;
  body: string;
  bodyKh?: string;
  helpful: number;
  verified: boolean;
}

const AUTHORS = [
  { en: 'Sreymom Oeun', kh: 'ស្រីមុំ អឿន', locEn: 'Phnom Penh', locKh: 'ភ្នំពេញ' },
  { en: 'James Whitfield', kh: 'ជេមស៍ វិតហ្វៀលដ៍', locEn: 'London, UK', locKh: 'ឡុងដ៍' },
  { en: 'Chantha Seng', kh: 'ចន្ថា សេង', locEn: 'Siem Reap', locKh: 'សៀមរាប' },
  { en: 'Marie Lefevre', kh: 'ម៉ារី លើហ្វេវ', locEn: 'Lyon, France', locKh: 'ឡីយ៉ុង' },
  { en: 'Dara Nuon', kh: 'ដារា នួន', locEn: 'Battambang', locKh: 'បាត់ដំបង' },
  { en: 'Aiko Tanaka', kh: 'អាយកុូ តាណាកា', locEn: 'Osaka, Japan', locKh: 'អូសាកា' },
  { en: 'Sopheak Long', kh: 'សុភាក ឡុង', locEn: 'Kampot', locKh: 'កំពត' },
  { en: 'Elias Moreno', kh: 'អេលីអាស ម៉ូរេណូ', locEn: 'Barcelona, Spain', locKh: 'បារ៉ាសេឡូណា' },
];

const TITLES = [
  {
    en: 'Exactly as promised',
    kh: 'ដូចអ្វីដែលបានសន្យា',
    bodyEn: 'The packaging is beautiful and the product arrived fresh. You can taste the care that went into growing it.',
    bodyKh: 'ការខ្ចប់ត្រូវបានធ្វើយ៉ាងស្អាត ហើយទំនិញមកដល់ស្រស់។ អ្នកអាចញ៉ាំរសជាតិនៃការថែរក្សាដែលបានបញ្ចូល។',
  },
  {
    en: 'A staple in our kitchen now',
    kh: 'ក្លាយជាទំនៀមទម្លាប់ក្នុងផ្ទះបាយយើង',
    bodyEn: 'We have reordered three times. Knowing the farmer\u2019s name and province makes every meal feel more meaningful.',
    bodyKh: 'យើងបានទិញឡើងវិញបីដងហើយ។ ដឹងឈ្មោះកសិករ និងខេត្ត ធ្វើឱ្យអាហាររាល់ពេលមានអត្ថន័យ។',
  },
  {
    en: 'Bought as a gift — huge hit',
    kh: 'ទិញជាកាដូ — ពិតជាពិសេស',
    bodyEn: 'Gave this to my mother and she asked where I found it. The story card inside the box was a lovely touch.',
    bodyKh: 'បានផ្តល់ឱ្យមាតាខ្ញុំ ហើយនាងសួរថារកពីកន្លែងណា។ កាតរឿងរ៉ាវក្នុងប្រអប់ជាការរីករាយ។',
  },
  {
    en: 'Restaurant quality',
    kh: 'គុណភាពភោជនីយដ្ឋាន',
    bodyEn: 'I cook professionally and the aroma is exceptional — far better than anything available commercially here.',
    bodyKh: 'ខ្ញុំចម្អិតអាជីព ហើយក្លិនពិតជាល្អប្លុក — ល្អជាងរបស់ទីផ្សារទូទៅណាស់។',
  },
  {
    en: 'Worth every dollar',
    kh: 'សក្តិសមនឹងតម្លៃ',
    bodyEn: 'Slightly more than supermarket prices, but the difference is obvious from the first taste. Supporting real farmers matters.',
    bodyKh: 'ខ្ពស់ជាងតម្លៃផ្សារបន្តិច ប៉ុន្តែភាពខុសគ្នាច្បាស់នៅពេលទី១។ គាំទ្រកសិករពិតមានអត្ថន័យ។',
  },
];

/** Small deterministic string hash → stable pseudo-random per product. */
function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededReviews(product: Product): Review[] {
  const seed = hashSeed(product.id);
  const count = Math.min(4, Math.max(3, Math.floor(seed % 3) + 3));
  const baseStars = product.rating >= 4.8 ? 5 : 4;
  return Array.from({ length: count }, (_, i) => {
    const s = hashSeed(`${product.id}-r${i}`);
    const person = AUTHORS[(s + i * 3) % AUTHORS.length];
    const copy = TITLES[(s >>> 3) % TITLES.length];
    const stars = i === 0 ? baseStars : s % 7 === 0 ? Math.max(3, baseStars - 1) : baseStars;
    const daysAgo = 6 + ((s >>> 5) % 80);
    const date = new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10);
    return {
      id: `${product.id}-review-${i}`,
      author: person.en,
      authorKh: person.kh,
      location: person.locEn,
      locationKh: person.locKh,
      stars,
      date,
      title: copy.en,
      titleKh: copy.kh,
      body: copy.bodyEn,
      bodyKh: copy.bodyKh,
      helpful: 2 + ((s >>> 7) % 34),
      verified: s % 5 !== 0,
    };
  });
}

function breakdown(reviews: Review[], overall: number): { stars: number; pct: number }[] {
  const rows = [5, 4, 3, 2, 1].map((stars) => {
    const hits = reviews.filter((r) => r.stars === stars).length;
    return { stars, hits };
  });
  // Blend the derived rows toward the catalogue's overall rating so the bars
  // visually agree with the rating shown in the buy box.
  const total = rows.reduce((a, r) => a + r.hits, 0) || 1;
  return rows.map((r) => {
    const drift = Math.abs(r.stars - overall) < 0.75 ? 0.62 : 0.14;
    const pct = Math.round(((r.hits / total) * 0.45 + drift) * 100);
    return { stars: r.stars, pct: Math.min(r.stars >= Math.round(overall) ? Math.max(pct, r.stars === 5 ? 58 : 24) : pct, 92) };
  });
}

function formatDate(iso: string, lang: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === 'kh' ? 'km-KH' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function ProductReviews({ product }: { product: Product }) {
  const { t, lang } = useLang();
  const mounted = useMounted();
  const reviews = useMemo(() => seededReviews(product), [product]);
  const bars = useMemo(() => breakdown(reviews, product.rating), [reviews, product.rating]);
  const [helpfulIds, setHelpfulIds] = useState<string[]>([]);
  const [writeOpen, setWriteOpen] = useState(false);
  const [form, setForm] = useState({ name: '', rating: 5, title: '', body: '' });

  const tt = (en: string, kh: string) => (lang === 'kh' ? kh : en);

  const markHelpful = (id: string) => {
    setHelpfulIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setWriteOpen(false);
    setForm({ name: '', rating: 5, title: '', body: '' });
    toast.success(
      tt(
        'Thank you — your review is awaiting moderation. (Demo)',
        'អរគុណ — មតិយោបល់របស់អ្នកកំពុងរង់ចាំការផ្ទៀងផ្ទាត់។ (សាកល្បង)',
      ),
    );
  };

  return (
    <section aria-label={t('reviews.title')}>
      <div className="grid gap-12 lg:grid-cols-[300px_1fr] lg:gap-16">
        {/* ── Summary column ─────────────────────────────────────────────── */}
        <Reveal>
          <div>
            <p className="eyebrow text-terracotta">{t('reviews.title')}</p>
            <div className="mt-5 flex items-end gap-4">
              <p className="font-display text-6xl leading-none text-charcoal">
                {product.rating.toFixed(1)}
              </p>
              <div className="pb-1.5">
                <RatingStars value={product.rating} size="md" />
                <p className="mt-1.5 text-[11px] uppercase tracking-[0.2em] text-stone">
                  {product.reviews} {t('product.reviews')}
                </p>
              </div>
            </div>

            {/* Breakdown bars */}
            <dl className="mt-8 space-y-2.5" aria-label={t('reviews.breakdown')}>
              {bars.map(({ stars, pct }) => (
                <div key={stars} className="flex items-center gap-3">
                  <dt className="flex w-12 shrink-0 items-center gap-1 text-xs font-semibold text-charcoal">
                    {stars}
                    <Star className="h-3 w-3 fill-gold text-gold" aria-hidden="true" />
                  </dt>
                  <dd className="flex-1">
                    <div
                      role="presentation"
                      className="h-1.5 w-full bg-charcoal/8"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full bg-gold transition-[width] duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </dd>
                </div>
              ))}
            </dl>

            <button
              type="button"
              onClick={() => setWriteOpen(true)}
              className="btn-outline mt-9 w-full"
            >
              <PenLine className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              {t('reviews.write')}
            </button>
          </div>
        </Reveal>

        {/* ── Review cards ───────────────────────────────────────────────── */}
        <div className="space-y-5">
          {reviews.map((review, i) => {
            const marked = helpfulIds.includes(review.id);
            return (
              <Reveal key={review.id} delay={i * 70}>
                <article className="border border-charcoal/10 bg-white p-6 md:p-7">
                  <header className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <span
                        aria-hidden="true"
                        className="flex h-11 w-11 shrink-0 items-center justify-center border border-gold/40 bg-gold/10 font-display text-lg text-forest"
                      >
                        {(lang === 'kh' && review.authorKh ? review.authorKh : review.author).charAt(0)}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-charcoal">
                          {lang === 'kh' ? review.authorKh : review.author}
                        </p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-stone">
                          {lang === 'kh' ? review.locationKh : review.location} ·{' '}
                          {formatDate(review.date, lang)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {review.verified && (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-moss">
                          <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                          {t('reviews.verified')}
                        </span>
                      )}
                      <RatingStars value={review.stars} size="sm" />
                    </div>
                  </header>

                  <h3 className="mt-4 font-display text-xl leading-snug text-charcoal">
                    {lang === 'kh' ? review.titleKh : review.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone">
                    {lang === 'kh' ? review.bodyKh : review.body}
                  </p>

                  <footer className="mt-5 flex items-center justify-between border-t border-charcoal/8 pt-4">
                    <button
                      type="button"
                      onClick={() => markHelpful(review.id)}
                      disabled={marked}
                      aria-pressed={marked}
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-[0.2em] transition-colors',
                        marked
                          ? 'cursor-default text-moss'
                          : 'cursor-pointer text-stone hover:text-forest',
                      )}
                    >
                      {marked ? t('reviews.thanks') : t('reviews.helpful')}
                    </button>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-stone tabular-nums">
                      {review.helpful + (marked ? 1 : 0)} {t('reviews.found')}
                    </span>
                  </footer>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* ── Write a review (demo) ─────────────────────────────────────────── */}
      <Dialog open={writeOpen} onOpenChange={setWriteOpen}>
        <DialogContent className="max-w-lg rounded-none border-charcoal/15 bg-ivory p-8 sm:p-10">
          <DialogTitle className="font-display text-3xl text-charcoal">
            {t('reviews.writeTitle')}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-stone">
            {t('reviews.writeDesc')}
          </DialogDescription>

          <form onSubmit={submitReview} className="mt-7 space-y-5" noValidate={false}>
            <div>
              <label
                htmlFor="review-name"
                className="text-[10px] font-bold uppercase tracking-[0.24em] text-stone"
              >
                {t('reviews.yourName')}
              </label>
              <input
                id="review-name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input-editorial mt-2"
                autoComplete="name"
              />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-stone">
                {t('reviews.yourRating')}
              </span>
              <div className="mt-2 flex gap-1.5" role="radiogroup" aria-label={t('reviews.yourRating')}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={form.rating === n}
                    aria-label={`${n} ${t('reviews.stars')}`}
                    onClick={() => setForm((f) => ({ ...f, rating: n }))}
                    className="cursor-pointer p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        'h-6 w-6 transition-colors',
                        n <= form.rating ? 'fill-gold text-gold' : 'text-charcoal/25',
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="review-title"
                className="text-[10px] font-bold uppercase tracking-[0.24em] text-stone"
              >
                {t('reviews.yourTitle')}
              </label>
              <input
                id="review-title"
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="input-editorial mt-2"
              />
            </div>

            <div>
              <label
                htmlFor="review-body"
                className="text-[10px] font-bold uppercase tracking-[0.24em] text-stone"
              >
                {t('reviews.yourBody')}
              </label>
              <textarea
                id="review-body"
                required
                rows={4}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                className="input-editorial mt-2 resize-none"
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              <Quote className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              {t('reviews.submit')}
            </button>
            <p className="text-center text-[11px] italic text-stone">{t('reviews.demoNote')}</p>
          </form>
        </DialogContent>
      </Dialog>

      {/* mounted gate keeps hydration quiet for the helpful counters */}
      {!mounted && <span className="sr-only">{t('common.loading')}</span>}
    </section>
  );
}
