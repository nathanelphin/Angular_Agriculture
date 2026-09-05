import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/data/products';
import { hasSeason, isInSeason } from '@/lib/season';

// ─── GET /api/admin/summary — storekeeper's desk (demo back-of-house) ─────────
// One round-trip for the admin dashboard: commerce stats, recent orders, every
// community review awaiting moderation, and the waiting book — everyone who
// asked to hear from a resting harvest (alerts + reservations, per product).

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  province: string;
  itemsCount: number;
  total: number;
  giftWrap: boolean;
  deliveryMethod: string;
  paymentMethod: string;
  createdAt: string;
}

export interface AdminWaitingRow {
  productId: string;
  inSeason: boolean;
  alerts: { email: string; createdAt: string }[];
  reservations: { email: string; sizeLabel: string; qty: number; createdAt: string }[];
}

export async function GET() {
  try {
    const [orders, reviewRows, newsletterCount, alertRows, reservationRows] = await Promise.all([
      db.order.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
      db.review.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
      db.newsletterSignup.count(),
      db.harvestAlert.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
      db.harvestReservation.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
    ]);

    const revenue = orders.reduce((sum, o) => sum + o.total, 0);
    const giftOrders = orders.filter((o) => o.giftWrap).length;
    const avgReview =
      reviewRows.length > 0
        ? reviewRows.reduce((sum, r) => sum + r.rating, 0) / reviewRows.length
        : 0;

    const recentOrders: AdminOrderRow[] = orders.slice(0, 8).map((o) => {
      let itemsCount = 0;
      try {
        const parsed = JSON.parse(o.items) as { qty: number }[];
        itemsCount = parsed.reduce((n, item) => n + (item.qty ?? 1), 0);
      } catch {
        itemsCount = 0;
      }
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        province: o.province,
        itemsCount,
        total: o.total,
        giftWrap: o.giftWrap,
        deliveryMethod: o.deliveryMethod,
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt.toISOString(),
      };
    });

    const reviews = reviewRows.map((r) => ({
      id: r.id,
      productId: r.productId,
      name: r.name,
      location: r.location ?? undefined,
      rating: r.rating,
      title: r.title,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
    }));

    // ── The waiting book — alerts + reservations grouped per product ──
    const productIds = new Set<string>([
      ...alertRows.map((a) => a.productId),
      ...reservationRows.map((r) => r.productId),
    ]);
    const waiting: AdminWaitingRow[] = [...productIds].map((productId) => ({
      productId,
      inSeason: (() => {
        const p = products.find((x) => x.id === productId);
        return p ? hasSeason(p) && isInSeason(p) : false;
      })(),
      alerts: alertRows
        .filter((a) => a.productId === productId)
        .map((a) => ({ email: a.email, createdAt: a.createdAt.toISOString() })),
      reservations: reservationRows
        .filter((r) => r.productId === productId)
        .map((r) => ({
          email: r.email,
          sizeLabel: r.sizeLabel,
          qty: r.qty,
          createdAt: r.createdAt.toISOString(),
        })),
    }));

    return NextResponse.json({
      stats: {
        orders: orders.length,
        revenue: Math.round(revenue * 100) / 100,
        giftOrders,
        newsletter: newsletterCount,
        reviews: reviewRows.length,
        avgReview: Math.round(avgReview * 10) / 10,
        waiting: alertRows.length,
      },
      recentOrders,
      // Full order book (up to 20) — feeds the CSV export on the desk.
      orders: orders.map((o) => {
        const row = recentOrders.find((r) => r.id === o.id);
        if (row) return row;
        let itemsCount = 0;
        try {
          const parsed = JSON.parse(o.items) as { qty: number }[];
          itemsCount = parsed.reduce((n, item) => n + (item.qty ?? 1), 0);
        } catch {
          itemsCount = 0;
        }
        return {
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          province: o.province,
          itemsCount,
          total: o.total,
          giftWrap: o.giftWrap,
          deliveryMethod: o.deliveryMethod,
          paymentMethod: o.paymentMethod,
          createdAt: o.createdAt.toISOString(),
        } satisfies AdminOrderRow;
      }),
      reviews,
      waiting,
    });
  } catch (e) {
    console.error('Admin summary failed', e);
    return NextResponse.json(
      {
        stats: { orders: 0, revenue: 0, giftOrders: 0, newsletter: 0, reviews: 0, avgReview: 0, waiting: 0 },
        recentOrders: [],
        orders: [],
        reviews: [],
        waiting: [],
      },
      { status: 500 },
    );
  }
}
