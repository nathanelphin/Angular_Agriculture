'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouterStore, applyCurrentHash, registerHashListener, scrollToTop } from '@/lib/stores/router';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SearchOverlay } from '@/components/layout/SearchOverlay';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { BackToTop } from '@/components/shared/BackToTop';
import { Toaster } from '@/components/ui/sonner';

/**
 * Global chrome: announcement bar, navbar, page content, footer, overlays.
 * Handles hash-routing sync and scroll-to-top on navigation.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  const view = useRouterStore((s) => s.view);

  // Hash router bootstrap + listener
  useEffect(() => {
    applyCurrentHash();
    const unsubscribe = registerHashListener();
    return unsubscribe;
  }, []);

  // Scroll to top whenever the view changes (except in-view anchors)
  useEffect(() => {
    if (view.name === 'about' && view.anchor) return;
    scrollToTop();
  }, [view]);

  // Anchor scroll for #sustainability etc.
  useEffect(() => {
    if (view.name === 'about' && view.anchor) {
      const el = document.getElementById(view.anchor);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [view]);

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <SearchOverlay />
      <MobileMenu />
      <BackToTop />
      <Toaster position="top-center" richColors />
    </div>
  );
}
