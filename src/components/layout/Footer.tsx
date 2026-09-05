'use client';

import { Facebook, Instagram, Music2, Youtube } from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '@/components/shared/Logo';
import { KhmerOrnament, KhmerPatternBand } from '@/components/shared/KhmerOrnament';
import { useRouterStore } from '@/lib/stores/router';
import { useLang } from '@/lib/stores/lang';
import { categories } from '@/lib/data/categories';
import type { CategoryId } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FooterLink {
  label: string;
  go: () => void;
}

/**
 * Forest footer — brand column, shop/discover/about link columns,
 * social row (demo toasts), language toggle and demo disclaimer.
 */
export function Footer() {
  const { t, lang, setLang } = useLang();
  const navigate = useRouterStore((s) => s.navigate);

  // Category links reuse the catalogue data so labels localise in Khmer too.
  const categoryLink = (id: CategoryId, fallbackEn: string): FooterLink => {
    const category = categories.find((c) => c.id === id);
    return {
      label: category ? (lang === 'kh' ? category.nameKh : category.name) : fallbackEn,
      go: () => navigate({ name: 'shop', category: id }),
    };
  };

  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: t('footer.shop'),
      links: [
        { label: t('footer.allProducts'), go: () => navigate({ name: 'shop' }) },
        categoryLink('rice', 'Rice & Grains'),
        categoryLink('fruits', 'Fruits'),
        categoryLink('spices', 'Spices'),
        categoryLink('gifts', 'Gift Collections'),
      ],
    },
    {
      title: t('footer.discover'),
      links: [
        { label: t('nav.farmers'), go: () => navigate({ name: 'farmers' }) },
        { label: t('nav.stories'), go: () => navigate({ name: 'stories' }) },
        {
          label: t('nav.sustainability'),
          go: () => navigate({ name: 'about', anchor: 'sustainability' }),
        },
        { label: t('nav.cambodia'), go: () => navigate({ name: 'about' }) },
      ],
    },
    {
      title: t('footer.about'),
      links: [
        { label: t('footer.aboutUs'), go: () => navigate({ name: 'about' }) },
        { label: t('footer.wishlist'), go: () => navigate({ name: 'wishlist' }) },
        { label: t('nav.account'), go: () => navigate({ name: 'account' }) },
      ],
    },
  ];

  const socials = [
    { label: 'Sovann Farm on Instagram', icon: Instagram },
    { label: 'Sovann Farm on Facebook', icon: Facebook },
    { label: 'Sovann Farm on YouTube', icon: Youtube },
    { label: 'Sovann Farm on TikTok', icon: Music2 },
  ];

  const langBtn = (active: boolean) =>
    cn(
      'text-[10px] font-bold uppercase tracking-[0.14em] transition-all duration-300',
      active ? 'text-gold underline underline-offset-4' : 'text-ivory opacity-60 hover:opacity-100',
    );

  return (
    <footer className="mt-auto border-t border-gold/20 bg-forest text-ivory">
      {/* Subtle Khmer textile band */}
      <KhmerPatternBand className="opacity-70 [&_svg]:text-gold/10!" />

      <div className="container-editorial grid gap-12 py-16 md:grid-cols-2 md:py-20 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        {/* Brand */}
        <div className="max-w-sm">
          <Logo variant="light" />
          <p className="mt-6 font-display text-lg italic leading-relaxed text-ivory/80">
            {t('footer.note')}
          </p>
          <KhmerOrnament className="mt-7" />
          <p className="eyebrow mt-9 text-ivory/40">{t('footer.social')}</p>
          <div className="mt-4 flex gap-3">
            {socials.map((social) => (
              <button
                key={social.label}
                type="button"
                aria-label={social.label}
                onClick={() => toast(t('footer.socialToast'))}
                className="flex h-10 w-10 items-center justify-center border border-ivory/20 text-ivory/70 transition-colors duration-300 hover:border-gold hover:text-gold"
              >
                <social.icon className="h-[17px] w-[17px]" strokeWidth={1.5} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h3 className="eyebrow text-gold">{column.title}</h3>
            <ul className="mt-6 flex flex-col gap-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={link.go}
                    className="text-left text-sm text-ivory/70 transition-colors duration-300 hover:text-ivory"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-ivory/10">
        <div className="container-editorial flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <p className="text-center text-xs text-ivory/60 md:text-left">
            {t('footer.rights')}
            <span className="mx-2 text-ivory/30" aria-hidden="true">
              ·
            </span>
            <span className="font-display italic text-gold">{t('footer.tagline')}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
              className={langBtn(lang === 'en')}
            >
              EN
            </button>
            <span className="h-3 w-px bg-ivory opacity-30" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setLang('kh')}
              aria-pressed={lang === 'kh'}
              lang="kh"
              className={langBtn(lang === 'kh')}
            >
              ខ្មែរ
            </button>
          </div>
        </div>
        <p className="container-editorial pb-6 text-center text-[11px] text-ivory/40">
          {t('footer.demo')}
        </p>
      </div>
    </footer>
  );
}
