import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/data/products';
import { hasSeason, isInSeason } from '@/lib/season';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** An honest ceiling — a reservation is a hold, not a wholesale order. */
const MAX_RESERVE_QTY = 12;

/**
 * "Reserve next harvest" — a real hold on a resting harvest. The shopper
 * picks a size and quantity, leaves an email, and the desk writes the moment
 * the fields gather it again. Reserved at today's price; payment only when
 * the harvest leaves the fields. One row per (product, email, size) —
 * reserving again quietly updates the held quantity.
 *
 * A reservation implies "wake me at harvest": the email is also subscribed
 * to the product's harvest alerts, so both ledgers tell the same story.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      productId?: string;
      email?: string;
      sizeLabel?: string;
      qty?: number;
    };
    const productId = body.productId?.trim() ?? '';
    const email = body.email?.trim().toLowerCase() ?? '';
    const sizeLabel = body.sizeLabel?.trim() ?? '';
    const qty = Math.floor(Number(body.qty ?? 1));

    const product = products.find((p) => p.id === productId);
    if (!product) {
      return NextResponse.json({ ok: false, message: 'Unknown harvest.' }, { status: 400 });
    }
    // Only a resting harvest can be reserved — an in-season harvest belongs
    // in the basket, and a year-round staple never rests.
    if (!hasSeason(product) || isInSeason(product)) {
      return NextResponse.json(
        { ok: false, message: 'This harvest is on the shelf now — add it to your basket.' },
        { status: 400 },
      );
    }
    if (!product.sizes.some((s) => s.label === sizeLabel)) {
      return NextResponse.json({ ok: false, message: 'Choose a size first.' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { ok: false, message: 'Please provide a valid email address.' },
        { status: 400 },
      );
    }
    if (!Number.isFinite(qty) || qty < 1 || qty > MAX_RESERVE_QTY) {
      return NextResponse.json(
        { ok: false, message: `Reservations hold between 1 and ${MAX_RESERVE_QTY} units.` },
        { status: 400 },
      );
    }

    const uniqueKey = { productId_email_sizeLabel: { productId, email, sizeLabel } };
    const existing = await db.harvestReservation.findUnique({ where: uniqueKey });
    await db.harvestReservation.upsert({
      where: uniqueKey,
      create: { productId, email, sizeLabel, qty },
      update: { qty },
    });

    // A reservation implies "wake me at harvest" — one thread, two ledgers.
    const alertExists = await db.harvestAlert.findUnique({
      where: { productId_email: { productId, email } },
    });
    if (!alertExists) {
      await db.harvestAlert.create({ data: { productId, email } });
    }

    const [holds, watchers] = await Promise.all([
      db.harvestReservation.count({ where: { productId } }),
      db.harvestAlert.count({ where: { productId } }),
    ]);

    return NextResponse.json({
      ok: true,
      already: Boolean(existing) && existing.qty === qty,
      held: qty,
      sizeLabel,
      holds,
      watchers,
      message: 'Reservation held. We\u2019ll write when the harvest leaves the fields.',
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Could not hold that reservation. Please try again.' },
      { status: 500 },
    );
  }
}

/** How many reservations already hold this harvest — keeps the ledger honest. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  if (!productId) return NextResponse.json({ holds: 0, qty: 0 });
  try {
    const rows = await db.harvestReservation.findMany({ where: { productId } });
    return NextResponse.json({
      holds: rows.length,
      qty: rows.reduce((sum, r) => sum + r.qty, 0),
    });
  } catch {
    return NextResponse.json({ holds: 0, qty: 0 });
  }
}
