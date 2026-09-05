'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const MAX_RECENT = 8;

interface RecentState {
  slugs: string[]; // most recent first
  record: (slug: string) => void;
  clear: () => void;
}

/** Recently viewed products (product slugs, most recent first) — powers the
 *  "Recently viewed" strip on the product page. */
export const useRecentStore = create<RecentState>()(
  persist(
    (set, get) => ({
      slugs: [],
      record: (slug) => {
        if (!slug) return;
        const next = [slug, ...get().slugs.filter((s) => s !== slug)].slice(0, MAX_RECENT);
        set({ slugs: next });
      },
      clear: () => set({ slugs: [] }),
    }),
    { name: 'sovann-recent', storage: createJSONStorage(() => localStorage) },
  ),
);
