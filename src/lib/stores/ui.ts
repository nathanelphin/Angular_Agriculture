'use client';

import { create } from 'zustand';

interface UIState {
  searchOpen: boolean;
  menuOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  searchOpen: false,
  menuOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
  setMenuOpen: (open) => set({ menuOpen: open }),
}));
