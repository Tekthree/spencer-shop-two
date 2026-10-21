import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db/client';

type RateLimitRow = { allowed: boolean; retry_after_seconds: number };

function clientIdentifier(request: NextRequest) {
  const forwarded = request.headers.get('x-vercel-forwarded-for')
    || request.headers.get('x-forwarded-for')
    || 'unknown';
  const ip = forwarded.split(',')[0].trim();
  return createHash('sha256')
    .update(`${process.env.SESSION_SECRET || 'missing-session-secret'}:${ip}`)
    .digest('hex');
}

export async function enforceRateLimit(
  request: NextRequest,
  scope: string,
  maxRequests: number,
  windowSeconds: number,
) {
  const rows = await sql`
    SELECT * FROM consume_api_rate_limit(
      ${scope}, ${clientIdentifier(request)}, ${maxRequests}, ${windowSeconds}
    )
  `;
  const result = rows[0] as RateLimitRow;
  if (result.allowed) return null;

  return NextResponse.json(
    { error: 'Too many requests. Please wait a few minutes and try again.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retry_after_seconds),
        'Cache-Control': 'no-store',
      },
    },
  );
}
