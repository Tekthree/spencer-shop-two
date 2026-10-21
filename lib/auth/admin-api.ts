import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

function isTrustedMutation(request: NextRequest) {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && !['same-origin', 'none'].includes(fetchSite)) {
    return false;
  }

  const origin = request.headers.get('origin');
  if (!origin) return true;

  const allowedOrigins = new Set([
    'https://www.spencergreyart.com',
    'https://spencergreyart.com',
  ]);
  if (process.env.VERCEL_ENV !== 'production') {
    allowedOrigins.add(request.nextUrl.origin);
  }
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredOrigin) {
    try {
      allowedOrigins.add(new URL(configuredOrigin).origin);
    } catch {
      // A malformed optional URL must not weaken the fixed production allowlist.
    }
  }

  return allowedOrigins.has(origin);
}

export async function requireAdminApi(request?: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request && !isTrustedMutation(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null;
}
