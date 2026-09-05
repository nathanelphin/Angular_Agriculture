'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StoredOrder } from '@/lib/types';

interface OrdersState {
  orders: StoredOrder[];
  add: (order: StoredOrder) => void;
  getById: (orderId: string) => StoredOrder | undefined;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      add: (order) => set({ orders: [order, ...get().orders].slice(0, 30) }),
      getById: (orderId) => get().orders.find((o) => o.id === orderId),
    }),
    { name: 'sovann-orders', storage: createJSONStorage(() => localStorage) },
  ),
);
