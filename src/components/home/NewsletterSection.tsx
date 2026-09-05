'use client';

import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { subscribeNewsletter } from '@/lib/api';
import { useLang } from '@/lib/stores/lang';
import { Reveal } from '@/components/shared/Reveal';
import { KhmerOrnament } from '@/components/shared/KhmerOrnament';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Newsletter — forest-green closing chapter with ornament, big serif
 * invitation and a validated subscribe form (sonner feedback).
 */
export function NewsletterSection() {
  const { t } = useLang();
  const [email, setEmail] = useState('');

  const mutation = useMutation({ mutationFn: subscribeNewsletter });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      toast.error(t('newsletter.error'));
      return;
    }
    mutation.mutate(value, {
      onSuccess: (res) => {
        if (res.ok) {
          toast.success(t('newsletter.success'));
          setEmail('');
        } else {
          toast.error(t('newsletter.error'));
        }
      },
      onError: () => toast.error(t('newsletter.error')),
    });
  };

  return (
    <section
      aria-label="Newsletter"
      className="relative overflow-hidden bg-forest py-20 text-ivory"
    >
      {/* decorative ornaments */}
      <KhmerOrnament className="absolute right-8 top-8 opacity-20" width={140} />
      <KhmerOrnament className="absolute bottom-8 left-8 rotate-180 opacity-10" width={140} />

      <div className="container-editorial">
        <Reveal className="mx-auto max-w-xl text-center">
          <KhmerOrnament className="mx-auto opacity-70" width={96} />
          <h2 className="mt-6 font-display text-3xl leading-[1.08] tracking-tight md:text-5xl">
            {t('newsletter.title')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ivory/70">
            {t('newsletter.subtitle')}
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-10 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('newsletter.placeholder')}
              aria-label={t('field.email')}
              disabled={mutation.isPending}
              className="h-12 flex-1 border border-ivory/30 bg-transparent px-4 text-sm text-ivory outline-none transition-colors duration-300 placeholder:text-ivory/40 focus:border-gold disabled:opacity-60"
            />
            <button
              type="submit"
              className="btn-gold disabled:opacity-60"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? t('common.loading') : t('newsletter.cta')}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
