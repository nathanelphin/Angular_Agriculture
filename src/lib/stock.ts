import type { Product, ProductSize } from '@/lib/types';

// ─── SOVANN FARM — per-size stock helpers ────────────────────────────────────
// A size may carry an explicit `stock`; when it does not, one is derived
// deterministically from the product-level stock so the whole catalogue can
// talk about sizes without every product hand-listing numbers. Smaller sizes
// are packed more often, so they hold more units than large ones.

export const SIZE_LOW_THRESHOLD = 8;

/** Weight curve by size index — first size holds the most units. */
const SIZE_WEIGHTS = [1, 0.62, 0.38, 0.22, 0.14];

/**
 * Units currently on the shelf for one size. Explicit `size.stock` wins;
 * otherwise the product-level stock is distributed over the size list.
 */
export function sizeStock(product: Product, size: ProductSize): number {
  if (typeof size.stock === 'number') return Math.max(0, Math.round(size.stock));
  const index = product.sizes.findIndex((s) => s.label === size.label);
  const weights = product.sizes.map((_, i) => SIZE_WEIGHTS[Math.min(i, SIZE_WEIGHTS.length - 1)]);
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const share = (weights[Math.max(index, 0)] / total) * product.stock;
  return Math.max(0, Math.round(share));
}

export function isSizeSoldOut(product: Product, size: ProductSize): boolean {
  return sizeStock(product, size) <= 0;
}

/** The tightest in-shelf size — drives "only n left" storytelling. */
export function tightestSizeStock(product: Product): number {
  const live = product.sizes
    .map((s) => sizeStock(product, s))
    .filter((n) => n > 0);
  return live.length > 0 ? Math.min(...live) : 0;
}

export function isSizeLow(product: Product, size: ProductSize): boolean {
  const n = sizeStock(product, size);
  return n > 0 && n <= SIZE_LOW_THRESHOLD;
}

/**
 * Units on the shelf behind a cart line. Cart lines store a size *label*;
 * when the label matches a size the per-size stock applies, otherwise the
 * product-level shelf is the truth (covers size-less products and legacy
 * saved lines whose size names have since changed).
 */
export function shelfFor(product: Product, sizeLabel: string): number {
  const size = product.sizes.find((s) => s.label === sizeLabel);
  if (size) return sizeStock(product, size);
  return Math.max(0, product.stock);
}
