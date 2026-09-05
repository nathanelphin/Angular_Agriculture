import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { OrderAdjustment, OrderItem, StoredOrder } from '@/lib/types';
import { products } from '@/lib/data/products';
import { shelfFor } from '@/lib/stock';
import {
  etaFor,
  findPromo,
  GIFT_WRAP_FEE,
  harvestDiscountFor,
  shippingFor,
  type DeliveryId,
  type PaymentId,
} from '@/components/checkout/totals';

interface OrderPayload {
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  promoCode?: string;
  promoDiscount?: number;
  total: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    province: string;
    district?: string;
    instructions?: string;
  };
  delivery: string;
  payment: string;
  farmersSupported: number;
  eta: string;
  giftWrap?: boolean;
  giftNote?: string;
  /** Lines the client already trimmed to the shelf — merged with the server's
   *  own ledger so the order's honest record is complete. */
  adjustments?: OrderAdjustment[];
}

function generateOrderNumber(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `SF-2026-0${num}`;
}

/**
 * Shelf hard-guard — server side. Even if the client is honest, the order can
 * never promise more than the shelf holds: every line is re-priced from the
 * catalogue and clamped to its shelf, over-shelf / unknown lines are trimmed
 * or dropped, and the money math is recomputed from the trusted numbers.
 * Every trim is written down — the order carries its own honest ledger.
 */
function clampItems(items: OrderItem[]): {
  items: OrderItem[];
  adjusted: boolean;
  adjustments: OrderAdjustment[];
} {
  let adjusted = false;
  const adjustments: OrderAdjustment[] = [];

  const clamped = items.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      adjusted = true; // unknown product — the line cannot be honoured
      adjustments.push({
        productId: item.productId,
        name: item.name,
        size: item.size,
        requestedQty: item.qty,
        storedQty: 0,
      });
      return [];
    }
    const size = product.sizes.find((s) => s.label === item.size);
    const unitPrice = size?.price ?? product.price;
    const shelf = shelfFor(product, item.size);
    const qty = Math.min(item.qty, shelf);
    if (qty <= 0) {
      adjusted = true; // nothing on the shelf — the line is dropped
      adjustments.push({
        productId: item.productId,
        name: item.name,
        size: item.size,
        requestedQty: item.qty,
        storedQty: 0,
      });
      return [];
    }
    if (qty !== item.qty || unitPrice !== item.unitPrice) {
      adjusted = true;
    }
    if (qty !== item.qty) {
      adjustments.push({
        productId: item.productId,
        name: item.name,
        size: item.size,
        requestedQty: item.qty,
        storedQty: qty,
      });
    }
    return [{ ...item, qty, unitPrice }];
  });

  return { items: clamped, adjusted, adjustments };
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as OrderPayload;

    if (!payload.items?.length || !payload.customer?.name || !payload.customer?.email) {
      return NextResponse.json({ ok: false, message: 'Invalid order payload.' }, { status: 400 });
    }

    // ── Shelf hard-guard + trusted re-pricing ────────────────────────────────
    const { items: safeItems, adjusted: shelfAdjusted, adjustments } = clampItems(payload.items);
    // Merge the client's own trims with the server's — the server's word wins
    // for the same line, client-only trims are kept so nothing is lost.
    const merged = new Map<string, OrderAdjustment>();
    for (const a of payload.adjustments ?? []) {
      if (a && a.productId) merged.set(`${a.productId}|${a.size}`, { ...a });
    }
    for (const a of adjustments) {
      merged.set(`${a.productId}|${a.size}`, a);
    }
    const allAdjustments = [...merged.values()];
    if (safeItems.length === 0) {
      return NextResponse.json(
        { ok: false, message: 'Nothing in this order is still on the shelf.' },
        { status: 409 },
      );
    }

    const subtotal = safeItems.reduce((acc, i) => acc + i.unitPrice * i.qty, 0);
    const promo = payload.promoCode ? findPromo(payload.promoCode) : undefined;
    const promoOk = Boolean(promo && subtotal >= promo.minSubtotal);
    const delivery = (['standard', 'express', 'pickup'].includes(payload.delivery)
      ? payload.delivery
      : 'standard') as DeliveryId;
    const shipping = shippingFor(delivery, subtotal, promoOk ? promo : undefined);
    const discount = harvestDiscountFor(subtotal);
    const giftFee = payload.giftWrap ? GIFT_WRAP_FEE : 0;
    const promoDiscount = promoOk
      ? promo!.kind === 'percent'
        ? Math.round(subtotal * (promo!.value / 100) * 100) / 100
        : promo!.kind === 'amount'
          ? promo!.value
          : 0
      : 0;
    const total = subtotal + shipping + giftFee - discount - promoDiscount;
    const farmersSupported = new Set(safeItems.map((i) => i.farmerName).filter(Boolean)).size;

    const orderNumber = generateOrderNumber();

    const saved = await db.order.create({
      data: {
        orderNumber,
        customerName: payload.customer.name,
        email: payload.customer.email.toLowerCase(),
        phone: payload.customer.phone ?? '',
        address: payload.customer.address ?? '',
        province: payload.customer.province ?? '',
        district: payload.customer.district ?? null,
        instructions: payload.customer.instructions ?? null,
        deliveryMethod: delivery,
        paymentMethod: payload.payment ?? 'cod',
        items: JSON.stringify(safeItems),
        adjustments: allAdjustments.length > 0 ? JSON.stringify(allAdjustments) : null,
        subtotal,
        shipping,
        discount,
        total,
        farmersSupported,
        giftWrap: payload.giftWrap ?? false,
        giftNote: payload.giftNote ?? null,
      },
    });

    const order: StoredOrder = {
      id: saved.id,
      orderNumber: saved.orderNumber,
      createdAt: saved.createdAt.toISOString(),
      items: safeItems,
      subtotal,
      shipping,
      discount,
      promoCode: promoOk ? promo!.code : undefined,
      promoDiscount: promoOk && promoDiscount > 0 ? promoDiscount : undefined,
      total,
      customer: payload.customer,
      delivery,
      payment: payload.payment,
      farmersSupported,
      eta: etaFor(delivery),
      giftWrap: payload.giftWrap,
      giftNote: payload.giftNote,
      adjustments: allAdjustments.length > 0 ? allAdjustments : undefined,
    };

    return NextResponse.json({ ok: true, order, adjusted: shelfAdjusted });
  } catch (e) {
    console.error('Order creation failed', e);
    return NextResponse.json({ ok: false, message: 'Could not save the order.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  try {
    const rows = await db.order.findMany({
      where: email ? { email: email.toLowerCase() } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return NextResponse.json({
      orders: rows.map((row) => ({
        ...row,
        adjustments: row.adjustments ? JSON.parse(row.adjustments) : null,
      })),
    });
  } catch {
    return NextResponse.json({ orders: [] });
  }
}
