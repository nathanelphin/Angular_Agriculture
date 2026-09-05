import type { Product } from '@/lib/types';

// ─── SOVANN FARM — harvest season helpers ────────────────────────────────────
// A product may declare the months (1–12) when its harvest is actually gathered
// in the fields. Everything else — "in season now", the resting whisper, the
// month ledger — derives from that one honest list. Products without a list are
// year-round staples and simply stay out of the season conversation.

/** Short month letters for the ledger — J F M A M J J A S O N D. */
export const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'] as const;

const MONTH_NAMES_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const MONTH_NAMES_KH = [
  'មករា',
  'កុម្ភៈ',
  'មីនា',
  'មេសា',
  'ឧសភា',
  'មិថុនា',
  'កក្កដា',
  'សីហា',
  'កញ្ញា',
  'តុលា',
  'វិច្ឆិកា',
  'ធ្នូ',
] as const;

export type SeasonLang = 'en' | 'kh';

export function monthName(month: number, lang: SeasonLang = 'en'): string {
  const idx = Math.min(Math.max(month, 1), 12) - 1;
  return lang === 'kh' ? MONTH_NAMES_KH[idx] : MONTH_NAMES_EN[idx];
}

export function hasSeason(product: Product): boolean {
  return Array.isArray(product.harvestMonths) && product.harvestMonths.length > 0;
}

/** Is this harvest gathered in the given month (defaults to now)? */
export function isInSeason(product: Product, month: number = new Date().getMonth() + 1): boolean {
  return hasSeason(product) && product.harvestMonths!.includes(month);
}

/** Month number (1–12) when the harvest returns, for the resting whisper. */
export function nextSeasonMonth(product: Product, month: number = new Date().getMonth() + 1): number {
  const months = product.harvestMonths ?? [];
  for (let step = 1; step <= 12; step++) {
    const probe = ((month - 1 + step) % 12) + 1;
    if (months.includes(probe)) return probe;
  }
  return month;
}

/** Compact range label, e.g. "Feb – May" — a window that crosses the new year
 *  reads as one run: [Nov, Dec, Jan] → "Nov – Jan". */
export function seasonRangeLabel(product: Product, lang: SeasonLang = 'en'): string {
  const months = (product.harvestMonths ?? []).slice().sort((a, b) => a - b);
  if (months.length === 0) return '';
  const short = (m: number) => {
    const norm = ((m - 1) % 12) + 1;
    return lang === 'kh' ? monthName(norm, 'kh') : MONTH_NAMES_EN[norm - 1].slice(0, 3);
  };

  // Walk the circle: a run starts where its predecessor (mod 12) is absent,
  // so [11,12,1] reads as one run Nov – Jan instead of Jan · Nov – Dec.
  const set = new Set(months);
  if (set.size === 12) return `${short(1)} – ${short(12)}`; // every month, all year
  const parts: string[] = [];
  for (const startMonth of months) {
    const prev = ((startMonth - 2 + 12) % 12) + 1;
    if (set.has(prev)) continue; // inside a run — already emitted
    let end = startMonth;
    while (end - startMonth < 11 && set.has((end % 12) + 1)) end += 1;
    parts.push(startMonth === end ? short(startMonth) : `${short(startMonth)} – ${short(end)}`);
  }
  return parts.join(' · ');
}
