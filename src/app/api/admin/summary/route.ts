import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ─── GET /api/admin/summary — storekeeper's desk (demo back-of-house) ─────────
// One round-trip for the admin dashboard: commerce stats, recent orders and
// every community review awaiting moderation.

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

export async function GET() {
  try {
    const [orders, reviewRows, newsletterCount] = await Promise.all([
      db.order.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
      db.review.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
      db.newsletterSignup.count(),
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

    return NextResponse.json({
      stats: {
        orders: orders.length,
        revenue: Math.round(revenue * 100) / 100,
        giftOrders,
        newsletter: newsletterCount,
        reviews: reviewRows.length,
        avgReview: Math.round(avgReview * 10) / 10,
      },
      recentOrders,
      reviews,
    });
  } catch (e) {
    console.error('Admin summary failed', e);
    return NextResponse.json(
      {
        stats: { orders: 0, revenue: 0, giftOrders: 0, newsletter: 0, reviews: 0, avgReview: 0 },
        recentOrders: [],
        reviews: [],
      },
      { status: 500 },
    );
  }
}
