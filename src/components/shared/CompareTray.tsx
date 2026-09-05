'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Scale, X } from 'lucide-react';
import type { Product } from '@/lib/types';
import { fetchProducts } from '@/lib/api';
import { useLang } from '@/lib/stores/lang';
import { COMPARE_MAX, useCompareStore } from '@/lib/stores/compare';
import { SmartImage } from '@/components/shared/SmartImage';
import { CompareDialog } from '@/components/shared/CompareDialog';
import { formatPrice } from '@/components/shared/ProductCard';
import { cn } from '@/lib/utils';

// ─── Compare tray — floating selection bar for side-by-side comparison ───────

export function CompareTray() {
  const { t, lang } = useLang();
  const ids = useCompareStore((s) => s.ids);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [announced, setAnnounced] = useState(false);
  const announceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: products } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });

  const selected = useMemo(
    () =>
      ids
        .map((id) => products?.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [ids, products],
  );

  useEffect(
    () => () => {
      if (announceTimer.current) clearTimeout(announceTimer.current);
    },
    [],
  );

  if (selected.length === 0) return null;

  const canCompare = selected.length >= 2;

  return (
    <>
      {/* Screen-reader announcement when the selection changes */}
      <span aria-live="polite" className="sr-only">
        {announced
          ? `${selected.length} ${t('compare.selected')} — ${t('compare.hint')}`
          : undefined}
      </span>

      <aside
        aria-label={t('compare.title')}
        className="compare-tray fixed inset-x-0 bottom-0 z-40 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 print:hidden"
      >
        <div className="container-editorial">
          <div className="compare-tray-panel mx-auto flex max-w-3xl flex-col gap-3 border border-ivory/15 bg-forest-deep/95 p-3 shadow-[0_24px_60px_-24px_rgba(18,38,26,0.8)] backdrop-blur-md sm:flex-row sm:items-center sm:gap-4 sm:p-4">
            {/* Selection thumbnails */}
            <div className="flex flex-1 items-center gap-2.5 overflow-x-auto py-0.5">
              {selected.map((p) => (
                <div
                  key={p.id}
                  className="group relative h-14 w-14 shrink-0 border border-ivory/20 bg-forest"
                >
                  <SmartImage src={p.image} alt={p.name} ratio="none" className="h-full w-full" />
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    aria-label={`${t('compare.remove')}: ${lang === 'kh' && p.nameKh ? p.nameKh : p.name}`}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 cursor-pointer items-center justify-center bg-ivory text-charcoal shadow-sm transition-all duration-200 hover:scale-110 hover:bg-terracotta hover:text-ivory focus-visible:outline-2 focus-visible:outline-gold"
                  >
                    <X className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
                  </button>
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-forest-deep/85 px-1 py-0.5 text-center text-[8px] font-bold uppercase tracking-[0.1em] text-honey">
                    {formatPrice(p.price)}
                  </span>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: Math.max(COMPARE_MAX - selected.length, 0) }).map((_, i) => (
                <div
                  key={`slot-${i}`}
                  aria-hidden="true"
                  className="flex h-14 w-14 shrink-0 items-center justify-center border border-dashed border-ivory/25 text-ivory/30"
                >
                  <Scale className="h-4 w-4" strokeWidth={1.25} />
                </div>
              ))}

              <p className="ml-1 hidden min-w-0 text-[10px] font-semibold uppercase leading-relaxed tracking-[0.18em] text-ivory/60 lg:block">
                {selected.length}/{COMPARE_MAX} · {t('compare.hint')}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  clear();
                }}
                className="h-11 cursor-pointer px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ivory/70 transition-colors duration-300 hover:text-ivory focus-visible:outline-2 focus-visible:outline-gold"
              >
                {t('compare.clear')}
              </button>
              <button
                type="button"
                disabled={!canCompare}
                onClick={() => {
                  setDialogOpen(true);
                  setAnnounced(true);
                  if (announceTimer.current) clearTimeout(announceTimer.current);
                  announceTimer.current = setTimeout(() => setAnnounced(false), 1200);
                }}
                className={cn(
                  'btn-gold h-11 shrink-0 px-5 text-[10px]',
                  !canCompare && 'cursor-not-allowed opacity-40',
                )}
              >
                <Scale className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                {t('compare.button')} ({selected.length})
              </button>
            </div>
          </div>
        </div>
      </aside>

      <CompareDialog products={selected} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
