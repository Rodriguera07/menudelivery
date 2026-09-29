import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPending2FASession } from '@/lib/auth';
import { generateTwoFactorCode, buildTwoFactorMessage, TWO_FACTOR_CODE_MINUTES } from '@/lib/two-factor';
import { sendWhatsAppText } from '@/lib/whatsapp-cloud';

export async function POST() {
  const pending = await getPending2FASession();
  if (!pending) return NextResponse.json({ error: 'Sessão expirada. Faça login novamente.' }, { status: 401 });

  const merchant = await prisma.merchant.findUnique({ where: { id: pending.merchantId }, include: { store: true } });
  if (!merchant) return NextResponse.json({ error: 'Sessão expirada. Faça login novamente.' }, { status: 401 });

  const code = generateTwoFactorCode();
  await prisma.merchant.update({
    where: { id: merchant.id },
    data: { twoFactorCode: code, twoFactorCodeExpiresAt: new Date(Date.now() + TWO_FACTOR_CODE_MINUTES * 60_000) },
  });
  const sent = await sendWhatsAppText(merchant.store.whatsapp, buildTwoFactorMessage(code));

  return NextResponse.json({ whatsappSent: sent.ok });
}
