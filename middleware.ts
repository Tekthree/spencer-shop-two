import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const isLoginPage = req.nextUrl.pathname === '/admin/login';
  // Shallow check — only verifies cookie presence, not cryptographic validity.
  // Real auth gate is getSession() called in admin layout and each RSC.
  const hasSession = req.cookies.has('sg-admin-session');

  if (!hasSession && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
