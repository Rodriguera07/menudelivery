import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createCustomerSession } from '@/lib/auth';
import { customerLoginSchema } from '@/lib/validation';
import { isLocked, registerFailedAttempt } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const parsed = customerLoginSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { identifier, password } = parsed.data;

  const customer = await prisma.customer.findFirst({
    where: { OR: [{ phone: identifier }, { email: identifier.toLowerCase() }] },
  });

  const genericError = NextResponse.json({ error: 'WhatsApp/e-mail ou senha incorretos.' }, { status: 401 });
  if (!customer) return genericError;

  const lock = isLocked(customer.lockedUntil);
  if (lock.locked) {
    return NextResponse.json(
      { error: `Muitas tentativas. Tente novamente em ${lock.retryAfterMinutes} minuto(s).` },
      { status: 429 },
    );
  }

  const valid = await verifyPassword(password, customer.passwordHash);
  if (!valid) {
    const next = registerFailedAttempt(customer.failedLoginAttempts);
    await prisma.customer.update({ where: { id: customer.id }, data: next });
    return genericError;
  }

  if (customer.failedLoginAttempts > 0) {
    await prisma.customer.update({ where: { id: customer.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });
  }

  await createCustomerSession({ customerId: customer.id });

  return NextResponse.json({ customer: { id: customer.id, name: customer.name } });
}
