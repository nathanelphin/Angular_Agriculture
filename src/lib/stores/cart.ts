'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem } from '@/lib/types';

interface CartState {
  items: CartItem[];
  lastAddedAt: number; // timestamp used by navbar cart pulse
  promoCode: string | null; // canonical uppercase promo code, e.g. HARVEST10
  add: (productId: string, size?: string, qty?: number) => void;
  remove: (productId: string, size: string) => void;
  setQty: (productId: string, size: string, qty: number) => void;
  applyPromo: (code: string) => void;
  clearPromo: () => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      lastAddedAt: 0,
      promoCode: null,
      add: (productId, size = '', qty = 1) => {
        const items = [...get().items];
        const idx = items.findIndex((i) => i.productId === productId && i.size === size);
        if (idx >= 0) {
          items[idx] = { ...items[idx], qty: Math.min(items[idx].qty + qty, 99) };
        } else {
          items.push({ productId, size, qty });
        }
        set({ items, lastAddedAt: Date.now() });
      },
      remove: (productId, size) =>
        set({ items: get().items.filter((i) => !(i.productId === productId && i.size === size)) }),
      setQty: (productId, size, qty) => {
        if (qty <= 0) {
          get().remove(productId, size);
          return;
        }
        const items = get().items.map((i) =>
          i.productId === productId && i.size === size ? { ...i, qty: Math.min(qty, 99) } : i,
        );
        set({ items });
      },
      applyPromo: (code) => set({ promoCode: code.trim().toUpperCase() }),
      clearPromo: () => set({ promoCode: null }),
      clear: () => set({ items: [], lastAddedAt: 0, promoCode: null }),
    }),
    { name: 'sovann-cart', storage: createJSONStorage(() => localStorage) },
  ),
);

export function useCartCount(): number {
  return useCartStore((s) => s.items.reduce((acc, i) => acc + i.qty, 0));
}
