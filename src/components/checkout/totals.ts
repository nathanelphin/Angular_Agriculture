// ─── SOVANN FARM — shared commerce math (cart, checkout, order payloads) ─────

export const STANDARD_FEE = 3.5; // USD
export const EXPRESS_FEE = 6; // USD
export const FREE_SHIPPING_THRESHOLD = 35; // USD — standard delivery becomes free
export const HARVEST_DISCOUNT_THRESHOLD = 100; // USD — order subtotal that unlocks −5%
export const HARVEST_DISCOUNT_RATE = 0.05;

export type DeliveryId = 'standard' | 'express' | 'pickup';
export type PaymentId = 'card' | 'aba' | 'acleda' | 'wing' | 'cod';

// ─── Promo codes — demo campaign codes (case-insensitive) ────────────────────

export type PromoKind = 'percent' | 'amount' | 'freeship';

export interface PromoCode {
  code: string; // canonical uppercase form
  kind: PromoKind;
  value: number; // percent (0–100) or USD amount
  minSubtotal: number; // 0 = no minimum
  labelEn: string;
  labelKh: string;
}

export const PROMO_CODES: PromoCode[] = [
  {
    code: 'HARVEST10',
    kind: 'percent',
    value: 10,
    minSubtotal: 0,
    labelEn: 'Harvest Week −10%',
    labelKh: 'សប្តាហ៍រដូវចម្ការ −១០%',
  },
  {
    code: 'FREESHIP',
    kind: 'freeship',
    value: 0,
    minSubtotal: 0,
    labelEn: 'Complimentary delivery',
    labelKh: 'ដឹកជញ្ជូនឥតគិតថ្លៃ',
  },
  {
    code: 'SIEMREAP5',
    kind: 'amount',
    value: 5,
    minSubtotal: 30,
    labelEn: 'Siem Reap Launch −$5',
    labelKh: 'សៀមរាបបើកដំណើរ −$៥',
  },
];

/** Find a promo by raw user input. Returns undefined when unknown. */
export function findPromo(input: string): PromoCode | undefined {
  const code = input.trim().toUpperCase();
  if (!code) return undefined;
  return PROMO_CODES.find((p) => p.code === code);
}

export interface PromoResult {
  ok: boolean;
  reason?: 'unknown' | 'minimum';
  promo?: PromoCode;
  /** USD amount discounted from the subtotal (0 for freeship). */
  discount: number;
}

/** Validate a promo against the current subtotal and compute its discount. */
export function evaluatePromo(input: string, subtotal: number): PromoResult {
  const promo = findPromo(input);
  if (!promo) return { ok: false, reason: 'unknown', discount: 0 };
  if (subtotal < promo.minSubtotal) {
    return { ok: false, reason: 'minimum', promo, discount: 0 };
  }
  if (promo.kind === 'percent') {
    return { ok: true, promo, discount: Math.round(subtotal * (promo.value / 100) * 100) / 100 };
  }
  if (promo.kind === 'amount') {
    return { ok: true, promo, discount: promo.value };
  }
  return { ok: true, promo, discount: 0 };
}

/** Shipping fee for a delivery method, given the current order subtotal and promo. */
export function shippingFor(
  method: DeliveryId,
  subtotal: number,
  promo?: PromoCode,
): number {
  if (method === 'pickup') return 0;
  if (promo?.kind === 'freeship') return 0;
  if (method === 'express') return EXPRESS_FEE;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_FEE;
}

/** Harvest loyalty discount — −5% on orders of $100 or more. */
export function harvestDiscountFor(subtotal: number): number {
  return subtotal >= HARVEST_DISCOUNT_THRESHOLD
    ? Math.round(subtotal * HARVEST_DISCOUNT_RATE * 100) / 100
    : 0;
}

/** Human-readable delivery promise stored on the order. */
export function etaFor(method: DeliveryId): string {
  if (method === 'express') return '1–2 business days';
  if (method === 'pickup') return 'Ready in 1 business day';
  return '2–5 business days';
}
