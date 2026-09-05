'use client';

import type { LucideIcon } from 'lucide-react';
import { Heart, ShoppingBag, User } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { Logo } from '@/components/shared/Logo';
import { KhmerOrnament } from '@/components/shared/KhmerOrnament';
import { useRouterStore } from '@/lib/stores/router';
import { useUIStore } from '@/lib/stores/ui';
import { useLang } from '@/lib/stores/lang';
import type { View } from '@/lib/types';
import { cn } from '@/lib/utils';

const PRIMARY_LINKS: { key: string; view: View }[] = [
  { key: 'nav.shop', view: { name: 'shop' } },
  { key: 'nav.farmers', view: { name: 'farmers' } },
  { key: 'nav.stories', view: { name: 'stories' } },
  { key: 'nav.cambodia', view: { name: 'about' } },
  { key: 'nav.sustainability', view: { name: 'about', anchor: 'sustainability' } },
];

/** Offcanvas drawer (mobile) — big serif navigation, secondary links, language. */
export function MobileMenu() {
  const { t, lang, setLang } = useLang();
  const view = useRouterStore((s) => s.view);
  const navigate = useRouterStore((s) => s.navigate);
  const menuOpen = useUIStore((s) => s.menuOpen);
  const setMenuOpen = useUIStore((s) => s.setMenuOpen);

  const go = (v: View) => {
    navigate(v);
    setMenuOpen(false);
  };

  const isActive = (v: View) => {
    if (v.name === 'about' && view.name === 'about') return v.anchor === view.anchor;
    return v.name === view.name;
  };

  const secondary: { label: string; icon: LucideIcon; view: View }[] = [
    { label: 'Wishlist', icon: Heart, view: { name: 'wishlist' } },
    { label: t('nav.account'), icon: User, view: { name: 'account' } },
    { label: t('nav.cart'), icon: ShoppingBag, view: { name: 'cart' } },
  ];

  const langBtn = (active: boolean) =>
    cn(
      'text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-300',
      active ? 'text-gold underline underline-offset-4' : 'text-charcoal opacity-60 hover:opacity-100',
    );

  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetContent side="right" className="w-full gap-0 border-l-0 bg-ivory p-0 sm:max-w-md">
        <SheetTitle className="sr-only">{t('nav.menu')}</SheetTitle>
        <SheetDescription className="sr-only">{t('footer.note')}</SheetDescription>

        <div className="flex h-full flex-col overflow-y-auto px-8 pb-10 pt-7">
          {/* Brand (built-in close button sits top-right) */}
          <div className="pr-10">
            <Logo />
          </div>

          {/* Primary — big serif links */}
          <nav aria-label="Mobile primary" className="mt-12 flex flex-col items-start gap-6">
            {PRIMARY_LINKS.map((link) => (
              <button
                key={link.key}
                type="button"
                onClick={() => go(link.view)}
                aria-current={isActive(link.view) ? 'page' : undefined}
                className={cn(
                  'text-left font-display text-3xl leading-snug transition-colors duration-300',
                  isActive(link.view) ? 'text-gold' : 'text-charcoal hover:text-forest',
                )}
              >
                {t(link.key)}
              </button>
            ))}
          </nav>

          <div className="my-9 h-px w-full bg-charcoal/10" aria-hidden="true" />

          {/* Secondary */}
          <div className="flex flex-col items-start gap-5">
            {secondary.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => go(item.view)}
                className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.24em] text-charcoal/70 transition-colors duration-300 hover:text-charcoal"
              >
                <item.icon className="h-4 w-4 text-gold" strokeWidth={1.5} aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Bottom — ornament, language, tagline */}
          <div className="mt-auto pt-12">
            <KhmerOrnament width={88} />
            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
                className={langBtn(lang === 'en')}
              >
                EN
              </button>
              <span className="h-3 w-px bg-charcoal opacity-30" aria-hidden="true" />
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
            <p className="mt-4 font-display text-sm italic text-stone">{t('footer.note')}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
