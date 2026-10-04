import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createMerchantSession, createPending2FASession } from '@/lib/auth';
import { merchantLoginSchema } from '@/lib/validation';
import { isLocked, registerFailedAttempt } from '@/lib/rate-limit';
import { generateTwoFactorCode, buildTwoFactorMessage, TWO_FACTOR_CODE_MINUTES } from '@/lib/two-factor';
import { sendText } from '@/lib/whatsapp-evolution';

export async function POST(req: NextRequest) {
  const parsed = merchantLoginSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const merchant = await prisma.merchant.findUnique({ where: { email }, include: { store: true } });

  // Mensagem genérica em toda falha (conta inexistente, bloqueada ou senha errada) — não dá
  // pra um atacante descobrir se o e-mail existe só pela resposta.
  const genericError = NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });

  if (!merchant) return genericError;

  const lock = isLocked(merchant.lockedUntil);
  if (lock.locked) {
    return NextResponse.json(
      { error: `Muitas tentativas. Tente novamente em ${lock.retryAfterMinutes} minuto(s).` },
      { status: 429 },
    );
  }

  const valid = await verifyPassword(password, merchant.passwordHash);
  if (!valid) {
    const next = registerFailedAttempt(merchant.failedLoginAttempts);
    await prisma.merchant.update({ where: { id: merchant.id }, data: next });
    return genericError;
  }

  // Senha certa: zera o contador de tentativas.
  if (merchant.failedLoginAttempts > 0) {
    await prisma.merchant.update({ where: { id: merchant.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });
  }

  if (!merchant.twoFactor) {
    await createMerchantSession({ merchantId: merchant.id, storeId: merchant.storeId });
    return NextResponse.json({ ok: true });
  }

  const code = generateTwoFactorCode();
  await prisma.merchant.update({
    where: { id: merchant.id },
    data: { twoFactorCode: code, twoFactorCodeExpiresAt: new Date(Date.now() + TWO_FACTOR_CODE_MINUTES * 60_000) },
  });
  const sent = await sendText(merchant.storeId, merchant.store.whatsapp, buildTwoFactorMessage(code));
  await createPending2FASession({ merchantId: merchant.id });

  return NextResponse.json({
    twoFactorRequired: true,
    whatsappSent: sent.ok,
  });
}
