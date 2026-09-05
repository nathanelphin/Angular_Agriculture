import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, message: 'Please provide a valid email address.' }, { status: 400 });
    }

    await db.newsletterSignup.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    return NextResponse.json({ ok: true, message: 'Subscribed.' });
  } catch {
    return NextResponse.json({ ok: false, message: 'Subscription failed. Please try again.' }, { status: 500 });
  }
}
