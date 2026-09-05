'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLang } from '@/lib/stores/lang';
import { useCompareStore } from '@/lib/stores/compare';
import { useUIStore } from '@/lib/stores/ui';
import { cn } from '@/lib/utils';

/**
 * Editorial back-to-top control — appears after the shopper scrolls past the
 * first viewport, glides the page back to the top. Fixed above the footer,
 * right-hand side, safe-area aware.
 */
export function BackToTop() {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  // The compare tray owns the bottom edge while active — yield to it.
  const trayActive = useCompareStore((s) => s.ids.length > 0);
  // …and so does the mobile sticky add-to-cart bar.
  const bottomBarActive = useUIStore((s) => s.bottomBarActive);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 640);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const shown = visible && !trayActive && !bottomBarActive;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={t('common.backToTop')}
      tabIndex={shown ? 0 : -1}
      className={cn(
        'fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center border border-charcoal/20 bg-ivory/95 text-charcoal shadow-[0_14px_34px_-18px_rgba(28,58,42,0.5)] backdrop-blur transition-all duration-500 hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-gold print:hidden',
        'pb-[env(safe-area-inset-bottom)]',
        shown
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      <ArrowUp className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}
