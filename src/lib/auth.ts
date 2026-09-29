import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MERCHANT_COOKIE, CUSTOMER_COOKIE, MERCHANT_2FA_PENDING_COOKIE } from '@/lib/cookies';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET não configurado no .env');

const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 dias
const PENDING_2FA_MAX_AGE = 60 * 10; // 10 minutos

export type MerchantSessionPayload = { merchantId: string; storeId: string };
export type CustomerSessionPayload = { customerId: string };
export type Pending2FAPayload = { merchantId: string };

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

function sign(payload: object, expiresIn: number) {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn });
}

function verify<T>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET as string) as T;
  } catch {
    return null;
  }
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE,
};

const pending2FACookieOptions = { ...cookieOptions, maxAge: PENDING_2FA_MAX_AGE };

export async function createMerchantSession(payload: MerchantSessionPayload) {
  (await cookies()).set(MERCHANT_COOKIE, sign(payload, SESSION_MAX_AGE), cookieOptions);
}

export async function destroyMerchantSession() {
  (await cookies()).delete(MERCHANT_COOKIE);
}

export async function getMerchantSession() {
  const token = (await cookies()).get(MERCHANT_COOKIE)?.value;
  return token ? verify<MerchantSessionPayload>(token) : null;
}

export async function requireMerchantSession() {
  const session = await getMerchantSession();
  if (!session) redirect('/admin/login');
  return session;
}

export async function createCustomerSession(payload: CustomerSessionPayload) {
  (await cookies()).set(CUSTOMER_COOKIE, sign(payload, SESSION_MAX_AGE), cookieOptions);
}

export async function destroyCustomerSession() {
  (await cookies()).delete(CUSTOMER_COOKIE);
}

export async function getCustomerSession() {
  const token = (await cookies()).get(CUSTOMER_COOKIE)?.value;
  return token ? verify<CustomerSessionPayload>(token) : null;
}

// Sessão curta emitida logo após a senha correta, quando a loja tem 2FA ativado — só
// autoriza a chamada de verificação do código, nunca acessa o painel diretamente.
export async function createPending2FASession(payload: Pending2FAPayload) {
  (await cookies()).set(MERCHANT_2FA_PENDING_COOKIE, sign(payload, PENDING_2FA_MAX_AGE), pending2FACookieOptions);
}

export async function getPending2FASession() {
  const token = (await cookies()).get(MERCHANT_2FA_PENDING_COOKIE)?.value;
  return token ? verify<Pending2FAPayload>(token) : null;
}

export async function destroyPending2FASession() {
  (await cookies()).delete(MERCHANT_2FA_PENDING_COOKIE);
}
