import { NextResponse } from 'next/server';
import { provinces } from '@/lib/data/provinces';

export async function GET() {
  return NextResponse.json({ provinces });
}
