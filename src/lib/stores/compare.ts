'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const COMPARE_MAX = 3;

interface CompareState {
  ids: string[]; // product ids, selection order
  toggle: (id: string) => 'added' | 'removed' | 'full';
  replaceAll: (ids: string[]) => number; // bulk set (e.g. wishlist hand-off), returns stored count
  remove: (id: string) => void;
  clear: () => void;
}

/** Product comparison tray — select up to 3 harvests and compare them side by
 *  side. Persisted so a half-built selection survives navigation. */
export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const { ids } = get();
        if (ids.includes(id)) {
          set({ ids: ids.filter((x) => x !== id) });
          return 'removed';
        }
        if (ids.length >= COMPARE_MAX) return 'full';
        set({ ids: [...ids, id] });
        return 'added';
      },
      replaceAll: (next) => {
        const unique = [...new Set(next)].slice(0, COMPARE_MAX);
        set({ ids: unique });
        return unique.length;
      },
      remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),
      clear: () => set({ ids: [] }),
    }),
    { name: 'sovann-compare', storage: createJSONStorage(() => localStorage) },
  ),
);
