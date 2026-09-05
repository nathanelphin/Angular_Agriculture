'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Menu, Search, ShoppingBag, User } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { useRouterStore } from '@/lib/stores/router';
import { useCartCount, useCartStore } from '@/lib/stores/cart';
import { useUIStore } from '@/lib/stores/ui';
import { useLang } from '@/lib/stores/lang';
import { useMounted } from '@/lib/hooks';
import { cn } from '@/lib/utils';

// ─── Small building blocks (local to the navbar) ─────────────────────────────

function IconButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center transition-colors duration-300 hover:text-gold',
        className,
      )}
    >
      {children}
    </button>
  );
}

/** EN | ខ្មែរ toggle — active is gold + underline, inactive softened. */
function LanguageToggle() {
  const { lang, setLang } = useLang();
  const btnClass = (active: boolean) =>
    cn(
      'text-[10px] font-bold uppercase tracking-[0.14em] transition-all duration-300',
      active ? 'text-gold underline underline-offset-4' : 'opacity-60 hover:opacity-100',
    );

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        className={btnClass(lang === 'en')}
      >
        EN
      </button>
      <span className="h-3 w-px bg-current opacity-30" aria-hidden="true" />
      <button
        type="button"
        onClick={() => setLang('kh')}
        aria-pressed={lang === 'kh'}
        lang="kh"
        className={btnClass(lang === 'kh')}
      >
        ខ្មែរ
      </button>
    </div>
  );
}

/** Cart icon with gold count badge — pulses when an item is added. */
function CartButton() {
  const { t } = useLang();
  const navigate = useRouterStore((s) => s.navigate);
  const count = useCartCount();
  const lastAddedAt = useCartStore((s) => s.lastAddedAt);
  const mounted = useMounted();
  // Keying the badge by lastAddedAt remounts it (and replays the pulse) on each add.
  const pulseKey = mounted ? Math.floor(lastAddedAt / 1000) : 0;

  return (
    <IconButton
      label={`${t('nav.cart')}${mounted && count > 0 ? ` — ${count}` : ''}`}
      onClick={() => navigate({ name: 'cart' })}
    >
      <ShoppingBag className="h-[19px] w-[19px]" strokeWidth={1.5} />
      {mounted && count > 0 && (
        <span
          key={pulseKey}
          className="absolute right-0 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold leading-none text-charcoal animate-cart-pulse"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </IconButton>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────

/**
 * Sticky editorial navbar. On the home view it floats transparent with ivory
 * text over the hero (scrollY < 60), then settles onto an ivory bar.
 */
export function Navbar() {
  const { t } = useLang();
  const view = useRouterStore((s) => s.view);
  const navigate = useRouterStore((s) => s.navigate);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const setMenuOpen = useUIStore((s) => s.setMenuOpen);
  const [scrolled, setScrolled] = useState(false);

  // Passive scroll listener — transparent over the hero until 60px.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY >= 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const overHero = view.name === 'home' && !scrolled;
  const logoVariant = overHero ? 'light' : 'dark';

  const links: { key: string; go: () => void; active: boolean }[] = [
    { key: 'nav.shop', go: () => navigate({ name: 'shop' }), active: view.name === 'shop' },
    {
      key: 'nav.farmers',
      go: () => navigate({ name: 'farmers' }),
      active: view.name === 'farmers' || view.name === 'farmer',
    },
    {
      key: 'nav.stories',
      go: () => navigate({ name: 'stories' }),
      active: view.name === 'stories' || view.name === 'story',
    },
    {
      key: 'nav.cambodia',
      go: () => navigate({ name: 'about' }),
      active: view.name === 'about' && view.anchor !== 'sustainability',
    },
    {
      key: 'nav.sustainability',
      go: () => navigate({ name: 'about', anchor: 'sustainability' }),
      active: view.name === 'about' && view.anchor === 'sustainability',
    },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-all duration-500',
        overHero
          ? 'border-transparent bg-transparent text-ivory'
          : 'border-charcoal/10 bg-ivory/95 text-charcoal backdrop-blur-md',
      )}
    >
      <div className="container-editorial relative flex h-16 items-center justify-between gap-4 md:h-20">
        {/* Mobile — hamburger left */}
        <IconButton
          label={t('nav.menu')}
          onClick={() => setMenuOpen(true)}
          className="lg:hidden"
        >
          <Menu className="h-[22px] w-[22px]" strokeWidth={1.5} />
        </IconButton>

        {/* Desktop — logo left */}
        <button
          type="button"
          onClick={() => navigate({ name: 'home' })}
          aria-label={t('nav.home')}
          className="hidden lg:block"
        >
          <Logo variant={logoVariant} />
        </button>

        {/* Desktop — primary links centre */}
        <nav aria-label="Primary" className="hidden items-center gap-5 lg:flex xl:gap-8">
          {links.map((link) => (
            <button
              key={link.key}
              type="button"
              onClick={link.go}
              aria-current={link.active ? 'page' : undefined}
              className="group relative py-2 text-[13px] font-semibold uppercase tracking-[0.18em]"
            >
              {t(link.key)}
              <span
                aria-hidden="true"
                className={cn(
                  'absolute inset-x-0 -bottom-0.5 h-px origin-left transition-transform duration-300',
                  link.active
                    ? 'scale-x-100 bg-gold'
                    : 'scale-x-0 bg-current group-hover:scale-x-100',
                )}
              />
            </button>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center">
          {/* Desktop icons */}
          <div className="hidden items-center gap-0.5 lg:flex">
            <IconButton label={t('nav.search')} onClick={() => setSearchOpen(true)}>
              <Search className="h-[19px] w-[19px]" strokeWidth={1.5} />
            </IconButton>
            <IconButton label={t('nav.account')} onClick={() => navigate({ name: 'account' })}>
              <User className="h-[19px] w-[19px]" strokeWidth={1.5} />
            </IconButton>
            <span className="mx-2.5 h-4 w-px bg-current opacity-20" aria-hidden="true" />
            <LanguageToggle />
            <span className="mx-2.5 h-4 w-px bg-current opacity-20" aria-hidden="true" />
            <CartButton />
          </div>

          {/* Mobile — cart only */}
          <div className="lg:hidden">
            <CartButton />
          </div>
        </div>

        {/* Mobile — centred logo */}
        <button
          type="button"
          onClick={() => navigate({ name: 'home' })}
          aria-label={t('nav.home')}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:hidden"
        >
          <Logo variant={logoVariant} />
        </button>
      </div>
    </header>
  );
}
