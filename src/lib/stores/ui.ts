'use client';

import { create } from 'zustand';

interface UIState {
  searchOpen: boolean;
  menuOpen: boolean;
  /** A fixed bottom bar (mobile sticky add-to-cart) occupies the bottom edge. */
  bottomBarActive: boolean;
  setSearchOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  setBottomBarActive: (active: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  searchOpen: false,
  menuOpen: false,
  bottomBarActive: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
  setMenuOpen: (open) => set({ menuOpen: open }),
  setBottomBarActive: (active) => set({ bottomBarActive: active }),
}));
