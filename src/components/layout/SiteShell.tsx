'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouterStore, applyCurrentHash, registerHashListener, scrollToTop } from '@/lib/stores/router';
import type { View } from '@/lib/types';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SearchOverlay } from '@/components/layout/SearchOverlay';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { BackToTop } from '@/components/shared/BackToTop';
import { CompareTray } from '@/components/shared/CompareTray';
import { Toaster } from '@/components/ui/sonner';

const BRAND = 'Sovann Farm';

/** Sensible SEO base titles per view; product/story views refine after load. */
function baseTitle(view: View): string {
  switch (view.name) {
    case 'home':
      return `${BRAND} — From Cambodian Soil, To Your Table`;
    case 'shop':
      return `Shop the Harvest — ${BRAND}`;
    case 'product':
      return `${BRAND}`;
    case 'farmers':
      return `Our Farmers — ${BRAND}`;
    case 'farmer':
      return `Meet the Farmer — ${BRAND}`;
    case 'stories':
      return `Stories from the Soil — ${BRAND}`;
    case 'story':
      return `Journal — ${BRAND}`;
    case 'about':
      return `Rooted in Cambodia — ${BRAND}`;
    case 'cart':
      return `Your Harvest — ${BRAND}`;
    case 'checkout':
      return `Secure Checkout — ${BRAND}`;
    case 'confirmation':
      return `Order Confirmed — ${BRAND}`;
    case 'wishlist':
      return `Your Wishlist — ${BRAND}`;
    case 'account':
      return `Your Account — ${BRAND}`;
    case 'track':
      return `Track Your Order — ${BRAND}`;
  }
}

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

  // Reset the document title for the incoming view; data-driven views
  // (product / story) refine it once their content resolves.
  useEffect(() => {
    document.title = baseTitle(view);
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
      <CompareTray />
      <Toaster position="top-center" richColors />
    </div>
  );
}
