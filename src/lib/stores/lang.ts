'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { translations, type Lang } from '@/lib/i18n/translations';

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set, get) => ({
      lang: 'en',
      setLang: (lang) => set({ lang }),
      toggle: () => set({ lang: get().lang === 'en' ? 'kh' : 'en' }),
    }),
    { name: 'sovann-lang', storage: createJSONStorage(() => localStorage) },
  ),
);

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

export function useLang(): { lang: Lang; setLang: (l: Lang) => void; toggle: () => void; t: TranslateFn } {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  const toggle = useLangStore((s) => s.toggle);

  const t: TranslateFn = (key, vars) => {
    let str = translations[lang][key] ?? translations.en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, String(v));
      }
    }
    return str;
  };

  return { lang, setLang, toggle, t };
}
