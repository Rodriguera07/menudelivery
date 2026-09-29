import { NextRequest, NextResponse } from 'next/server';
import { MERCHANT_COOKIE } from '@/lib/cookies';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }
  const hasSession = req.cookies.has(MERCHANT_COOKIE);
  if (!hasSession) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
