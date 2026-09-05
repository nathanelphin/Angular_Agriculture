'use client';

import { create } from 'zustand';
import type { CategoryId, ProvinceId, View } from '@/lib/types';

// ─── Client-side view router (single route `/` + URL hash sync) ──────────────

interface RouterState {
  view: View;
  history: View[];
  navigate: (v: View) => void;
  back: () => void;
  setFromHash: (hash: string) => void;
}

function viewToHash(v: View): string {
  switch (v.name) {
    case 'home':
      return '#/';
    case 'shop': {
      const params = new URLSearchParams();
      if (v.category) params.set('category', v.category);
      if (v.province) params.set('province', v.province);
      if (v.query) params.set('q', v.query);
      const qs = params.toString();
      return `#/shop${qs ? `?${qs}` : ''}`;
    }
    case 'product':
      return `#/product/${v.slug}`;
    case 'farmer':
      return `#/farmer/${v.slug}`;
    case 'story':
      return `#/stories/${v.slug}`;
    case 'confirmation':
      return `#/confirmation/${v.orderId}`;
    case 'track':
      return `#/track/${v.orderNumber}`;
    case 'about':
      return v.anchor ? `#/about?s=${v.anchor}` : '#/about';
    default:
      return `#/${v.name}`;
  }
}

function hashToView(hash: string): View {
  const clean = hash.replace(/^#/, '') || '/';
  const [pathPart, queryPart] = clean.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  const params = new URLSearchParams(queryPart ?? '');

  switch (segments[0]) {
    case undefined:
    case '':
    case 'home':
      return { name: 'home' };
    case 'shop':
      return {
        name: 'shop',
        category: (params.get('category') as CategoryId) || undefined,
        province: (params.get('province') as ProvinceId) || undefined,
        query: params.get('q') || undefined,
      };
    case 'product':
      return { name: 'product', slug: segments[1] ?? '' };
    case 'farmers':
      return { name: 'farmers' };
    case 'farmer':
      return { name: 'farmer', slug: segments[1] ?? '' };
    case 'stories':
      return segments[1] ? { name: 'story', slug: segments[1] } : { name: 'stories' };
    case 'about':
      return { name: 'about', anchor: params.get('s') || undefined };
    case 'cart':
      return { name: 'cart' };
    case 'checkout':
      return { name: 'checkout' };
    case 'confirmation':
      return { name: 'confirmation', orderId: segments[1] ?? '' };
    case 'track':
      return { name: 'track', orderNumber: segments[1] ?? '' };
    case 'wishlist':
      return { name: 'wishlist' };
    case 'account':
      return { name: 'account' };
    default:
      return { name: 'home' };
  }
}

export const useRouterStore = create<RouterState>((set, get) => ({
  view: { name: 'home' },
  history: [],
  navigate: (v) => {
    const current = get().view;
    if (JSON.stringify(current) === JSON.stringify(v)) return;
    if (typeof window !== 'undefined') {
      window.location.hash = viewToHash(v);
    }
    set({ view: v, history: [...get().history.slice(-20), current] });
  },
  back: () => {
    const { history, view } = get();
    const prev = history[history.length - 1];
    if (prev) {
      if (typeof window !== 'undefined') window.location.hash = viewToHash(prev);
      set({ view: prev, history: history.slice(0, -1) });
    } else {
      get().navigate({ name: 'home' });
    }
    void view;
  },
  setFromHash: (hash) => {
    set({ view: hashToView(hash) });
  },
}));

// Sync store with browser hash (called once by SiteShell on mount).
export function applyCurrentHash(): void {
  if (typeof window !== 'undefined' && window.location.hash) {
    useRouterStore.getState().setFromHash(window.location.hash);
  }
}

export function registerHashListener(): () => void {
  const handler = () => useRouterStore.getState().setFromHash(window.location.hash);
  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }
  return () => undefined;
}

export function scrollToTop(): void {
  if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
}
