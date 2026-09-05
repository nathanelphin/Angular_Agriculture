import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { OrderItem, StoredOrder } from '@/lib/types';

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
}

function generateOrderNumber(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `SF-2026-0${num}`;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as OrderPayload;

    if (!payload.items?.length || !payload.customer?.name || !payload.customer?.email) {
      return NextResponse.json({ ok: false, message: 'Invalid order payload.' }, { status: 400 });
    }

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
        deliveryMethod: payload.delivery ?? 'standard',
        paymentMethod: payload.payment ?? 'cod',
        items: JSON.stringify(payload.items),
        subtotal: payload.subtotal ?? 0,
        shipping: payload.shipping ?? 0,
        discount: payload.discount ?? 0,
        total: payload.total ?? 0,
        farmersSupported: payload.farmersSupported ?? 0,
        giftWrap: payload.giftWrap ?? false,
        giftNote: payload.giftNote ?? null,
      },
    });

    const order: StoredOrder = {
      id: saved.id,
      orderNumber: saved.orderNumber,
      createdAt: saved.createdAt.toISOString(),
      items: payload.items,
      subtotal: payload.subtotal,
      shipping: payload.shipping,
      discount: payload.discount,
      promoCode: payload.promoCode,
      promoDiscount: payload.promoDiscount,
      total: payload.total,
      customer: payload.customer,
      delivery: payload.delivery,
      payment: payload.payment,
      farmersSupported: payload.farmersSupported,
      eta: payload.eta,
      giftWrap: payload.giftWrap,
      giftNote: payload.giftNote,
    };

    return NextResponse.json({ ok: true, order });
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
    return NextResponse.json({ orders: rows });
  } catch {
    return NextResponse.json({ orders: [] });
  }
}
