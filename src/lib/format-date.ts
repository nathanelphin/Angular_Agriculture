// ─── Locale-safe date formatting ──────────────────────────────────────────────
// Headless browsers and some devices ship without full `km-KH` ICU data, which
// silently degrades Khmer dates to English. These helpers format dates manually
// so the Khmer locale always renders true Khmer months and numerals.

const KH_MONTHS = [
  'មករា', // January
  'កុម្ភៈ', // February
  'មីនា', // March
  'មេសា', // April
  'ឧសភា', // May
  'មិថុនា', // June
  'កក្កដា', // July
  'សីហា', // August
  'កញ្ញា', // September
  'តុលា', // October
  'វិច្ឆិកា', // November
  'ធ្នូ', // December
] as const;

const KH_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'] as const;

const EN_MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

const EN_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

/** Convert Latin digits to Khmer digits. */
function toKhmerDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => KH_DIGITS[Number(d)]);
}

function parse(iso: string): Date {
  // Date-only strings are parsed as UTC midnight — anchor to local time instead.
  const d = iso.length === 10 ? new Date(`${iso}T00:00:00`) : new Date(iso);
  return d;
}

/**
 * Long date: "5 March 2026" (en) · "៥ មីនា ២០២៦" (kh).
 */
export function formatDateLong(iso: string, lang: 'en' | 'kh'): string {
  const d = parse(iso);
  if (Number.isNaN(d.getTime())) return iso;
  if (lang === 'kh') {
    return toKhmerDigits(`${d.getDate()} ${KH_MONTHS[d.getMonth()]} ${d.getFullYear()}`);
  }
  return `${d.getDate()} ${EN_MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Short date: "Mar 5, 2026" (en) · "៥ មីនា ២០២៦" (kh).
 */
export function formatDateShort(iso: string, lang: 'en' | 'kh'): string {
  const d = parse(iso);
  if (Number.isNaN(d.getTime())) return iso;
  if (lang === 'kh') {
    return toKhmerDigits(`${d.getDate()} ${KH_MONTHS[d.getMonth()]} ${d.getFullYear()}`);
  }
  return `${EN_MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/**
 * Date + time: "Mar 5, 2026, 14:32" (en) · "៥ មីនា ២០២៦ ម៉ោង ១៤:៣២" (kh).
 */
export function formatDateTime(iso: string, lang: 'en' | 'kh'): string {
  const d = parse(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  if (lang === 'kh') {
    return `${formatDateShort(iso, 'kh')} ម៉ោង ${toKhmerDigits(`${hh}:${mm}`)}`;
  }
  return `${formatDateShort(iso, 'en')}, ${hh}:${mm}`;
}
