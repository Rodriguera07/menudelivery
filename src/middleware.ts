import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { MERCHANT_COOKIE } from '@/lib/cookies';

// Roda em runtime Node.js (não Edge) porque `jsonwebtoken` precisa do módulo
// `crypto` do Node para verificar a assinatura — checar só se o cookie existe
// deixava passar qualquer valor adulterado/expirado até a rota re-validar.
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET não configurado no .env');

const PUBLIC_PATHS = ['/admin/login', '/admin/esqueci-senha', '/admin/redefinir-senha'];

export function middleware(req: NextRequest) {
  if (PUBLIC_PATHS.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }
  const token = req.cookies.get(MERCHANT_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
  try {
    jwt.verify(token, JWT_SECRET as string, { algorithms: ['HS256'] });
  } catch {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
