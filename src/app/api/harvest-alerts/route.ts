import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/data/products';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * "Notify me at harvest" — shoppers leave their email while a harvest is
 * resting; the desk one day writes to them the moment the fields gather it
 * again. One row per (product, email); re-subscribing is a quiet no-op.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { productId?: string; email?: string };
    const productId = body.productId?.trim();
    const email = body.email?.trim().toLowerCase();

    if (!productId || !products.some((p) => p.id === productId)) {
      return NextResponse.json({ ok: false, message: 'Unknown harvest.' }, { status: 400 });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { ok: false, message: 'Please provide a valid email address.' },
        { status: 400 },
      );
    }

    const existing = await db.harvestAlert.findUnique({
      where: { productId_email: { productId, email } },
    });
    if (!existing) {
      await db.harvestAlert.create({ data: { productId, email } });
    }

    const watchers = await db.harvestAlert.count({ where: { productId } });
    return NextResponse.json({
      ok: true,
      already: Boolean(existing),
      watchers,
      message: 'We\u2019ll write when the harvest returns.',
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Could not save that. Please try again.' },
      { status: 500 },
    );
  }
}

/** Watcher count for a harvest — keeps the ledger honest on revisits. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  if (!productId) return NextResponse.json({ watchers: 0 });
  try {
    const watchers = await db.harvestAlert.count({ where: { productId } });
    return NextResponse.json({ watchers });
  } catch {
    return NextResponse.json({ watchers: 0 });
  }
}
