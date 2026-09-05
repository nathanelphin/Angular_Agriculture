// ─── SOVANN FARM — shared commerce math (cart, checkout, order payloads) ─────

export const STANDARD_FEE = 3.5; // USD
export const EXPRESS_FEE = 6; // USD
export const FREE_SHIPPING_THRESHOLD = 35; // USD — standard delivery becomes free
export const HARVEST_DISCOUNT_THRESHOLD = 100; // USD — order subtotal that unlocks −5%
export const HARVEST_DISCOUNT_RATE = 0.05;

export type DeliveryId = 'standard' | 'express' | 'pickup';
export type PaymentId = 'card' | 'aba' | 'acleda' | 'wing' | 'cod';

/** Shipping fee for a delivery method, given the current order subtotal. */
export function shippingFor(method: DeliveryId, subtotal: number): number {
  if (method === 'pickup') return 0;
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
