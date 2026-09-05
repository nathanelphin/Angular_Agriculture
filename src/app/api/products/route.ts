import { NextResponse } from 'next/server';
import { products } from '@/lib/data/products';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (slug) {
    const product = products.find((p) => p.slug === slug) ?? null;
    return NextResponse.json({ product });
  }

  return NextResponse.json({ products });
}
