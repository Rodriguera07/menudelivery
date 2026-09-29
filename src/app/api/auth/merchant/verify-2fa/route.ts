import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getPending2FASession, createMerchantSession, destroyPending2FASession } from '@/lib/auth';
import { isLocked, registerFailedAttempt } from '@/lib/rate-limit';

const schema = z.object({ code: z.string().trim().length(6, 'Informe o código de 6 dígitos') });

export async function POST(req: NextRequest) {
  const pending = await getPending2FASession();
  if (!pending) return NextResponse.json({ error: 'Sessão expirada. Faça login novamente.' }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const merchant = await prisma.merchant.findUnique({ where: { id: pending.merchantId } });
  if (!merchant) return NextResponse.json({ error: 'Sessão expirada. Faça login novamente.' }, { status: 401 });

  const lock = isLocked(merchant.lockedUntil);
  if (lock.locked) {
    return NextResponse.json(
      { error: `Muitas tentativas. Tente novamente em ${lock.retryAfterMinutes} minuto(s).` },
      { status: 429 },
    );
  }

  const expired = !merchant.twoFactorCodeExpiresAt || merchant.twoFactorCodeExpiresAt.getTime() < Date.now();
  const matches = merchant.twoFactorCode === parsed.data.code;

  if (expired || !matches) {
    const next = registerFailedAttempt(merchant.failedLoginAttempts);
    await prisma.merchant.update({ where: { id: merchant.id }, data: next });
    return NextResponse.json({ error: expired ? 'Código expirado. Peça um novo.' : 'Código incorreto.' }, { status: 401 });
  }

  await prisma.merchant.update({
    where: { id: merchant.id },
    data: { failedLoginAttempts: 0, lockedUntil: null, twoFactorCode: null, twoFactorCodeExpiresAt: null },
  });
  await destroyPending2FASession();
  await createMerchantSession({ merchantId: merchant.id, storeId: merchant.storeId });

  return NextResponse.json({ ok: true });
}
