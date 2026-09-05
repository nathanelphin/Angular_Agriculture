import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Public review shape returned to the client.
export interface ReviewDto {
  id: string;
  productId: string;
  name: string;
  location?: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  verified: boolean; // true when reviewer email matches a delivered order (demo: always false for guests)
}

const MAX_LEN = { name: 60, location: 60, title: 90, body: 1200 };

function sanitize(input: unknown, max: number): string {
  return typeof input === 'string'
    ? input.replace(/<[^>]*>/g, '').trim().slice(0, max)
    : '';
}

/** GET /api/reviews?productId=p-kampot-black-pepper */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  try {
    const rows = await db.review.findMany({
      where: productId ? { productId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const reviews: ReviewDto[] = rows.map((r) => ({
      id: r.id,
      productId: r.productId,
      name: r.name,
      location: r.location ?? undefined,
      rating: r.rating,
      title: r.title,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
      verified: false,
    }));

    return NextResponse.json({ reviews });
  } catch (e) {
    console.error('Fetch reviews failed', e);
    return NextResponse.json({ reviews: [] });
  }
}

/** POST /api/reviews — persist a customer review from the product page. */
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;

    const productId = sanitize(payload.productId, 80);
    const name = sanitize(payload.name, MAX_LEN.name);
    const location = sanitize(payload.location, MAX_LEN.location);
    const title = sanitize(payload.title, MAX_LEN.title);
    const body = sanitize(payload.body, MAX_LEN.body);
    const rating = Math.round(Number(payload.rating));

    if (!productId || !name || !title || !body) {
      return NextResponse.json(
        { ok: false, message: 'Missing required review fields.' },
        { status: 400 },
      );
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { ok: false, message: 'Rating must be between 1 and 5.' },
        { status: 400 },
      );
    }

    const saved = await db.review.create({
      data: {
        productId,
        name,
        location: location || null,
        rating,
        title,
        body,
      },
    });

    const review: ReviewDto = {
      id: saved.id,
      productId: saved.productId,
      name: saved.name,
      location: saved.location ?? undefined,
      rating: saved.rating,
      title: saved.title,
      body: saved.body,
      createdAt: saved.createdAt.toISOString(),
      verified: false,
    };

    return NextResponse.json({ ok: true, review });
  } catch (e) {
    console.error('Create review failed', e);
    return NextResponse.json(
      { ok: false, message: 'Could not save the review.' },
      { status: 500 },
    );
  }
}

/** DELETE /api/reviews?id=… — moderation removal (storekeeper's desk). */
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { ok: false, message: 'Missing review id.' },
      { status: 400 },
    );
  }

  try {
    const deleted = await db.review.delete({ where: { id } });
    return NextResponse.json({ ok: true, id: deleted.id });
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Review not found.' },
      { status: 404 },
    );
  }
}
