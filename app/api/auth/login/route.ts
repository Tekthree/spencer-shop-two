import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth/session';
import { createHash } from 'node:crypto';
import sql from '@/lib/db/client';

function getLoginIdentifier(req: NextRequest) {
  const forwarded = req.headers.get('x-vercel-forwarded-for') || req.headers.get('x-forwarded-for') || 'unknown';
  const ip = forwarded.split(',')[0].trim();
  return createHash('sha256')
    .update(`${process.env.SESSION_SECRET || 'missing-session-secret'}:${ip}`)
    .digest('hex');
}

export async function POST(req: NextRequest) {
  const identifier = getLoginIdentifier(req);
  try {
    const rateLimitRows = await sql`
      SELECT * FROM check_admin_login_rate_limit(${identifier})
    `;
    const rateLimit = rateLimitRows[0] as { allowed: boolean; retry_after_seconds: number };
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Try again in 15 minutes.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retry_after_seconds) } }
      );
    }

    const { email, password } = await req.json();
    await signIn(email, password);
    await sql`SELECT clear_admin_login_failures(${identifier})`;
    return NextResponse.json({ success: true });
  } catch {
    try {
      await sql`SELECT record_admin_login_failure(${identifier})`;
    } catch (rateLimitError) {
      console.error('Failed to record admin login attempt:', rateLimitError);
    }
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }
}
