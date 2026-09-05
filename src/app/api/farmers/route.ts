import { NextResponse } from 'next/server';
import { farmers } from '@/lib/data/farmers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (slug) {
    const farmer = farmers.find((f) => f.slug === slug) ?? null;
    return NextResponse.json({ farmer });
  }

  return NextResponse.json({ farmers });
}
