import { NextResponse } from 'next/server';
import { stories } from '@/lib/data/stories';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (slug) {
    const story = stories.find((s) => s.slug === slug) ?? null;
    return NextResponse.json({ story });
  }

  return NextResponse.json({ stories });
}
