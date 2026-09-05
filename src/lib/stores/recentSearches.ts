'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── Recent searches — persisted, deduped, most-recent-first (max 6) ─────────

interface RecentSearchesState {
  terms: string[];
  add: (term: string) => void;
  clear: () => void;
}

const MAX_RECENT = 6;

export const useRecentSearchesStore = create<RecentSearchesState>()(
  persist(
    (set, get) => ({
      terms: [],
      add: (term) => {
        const clean = term.trim();
        if (!clean) return;
        const next = [clean, ...get().terms.filter((t) => t.toLowerCase() !== clean.toLowerCase())];
        set({ terms: next.slice(0, MAX_RECENT) });
      },
      clear: () => set({ terms: [] }),
    }),
    { name: 'sovann-recent-searches', storage: createJSONStorage(() => localStorage) },
  ),
);
