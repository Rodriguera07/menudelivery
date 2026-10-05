import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPending2FASession } from '@/lib/auth';
import { generateTwoFactorCode, buildTwoFactorMessage, TWO_FACTOR_CODE_MINUTES } from '@/lib/two-factor';
import { sendText } from '@/lib/whatsapp-evolution';

const RESEND_COOLDOWN_SECONDS = 30;

export async function POST() {
  const pending = await getPending2FASession();
  if (!pending) return NextResponse.json({ error: 'Sessão expirada. Faça login novamente.' }, { status: 401 });

  const merchant = await prisma.merchant.findUnique({ where: { id: pending.merchantId }, include: { store: true } });
  if (!merchant) return NextResponse.json({ error: 'Sessão expirada. Faça login novamente.' }, { status: 401 });

  // O código anterior ainda carrega o timestamp de quando foi emitido — usamos isso
  // pra impedir reenvio em loop (cada chamada manda uma mensagem real de WhatsApp).
  if (merchant.twoFactorCodeExpiresAt) {
    const msSinceIssued = TWO_FACTOR_CODE_MINUTES * 60_000 - (merchant.twoFactorCodeExpiresAt.getTime() - Date.now());
    if (msSinceIssued < RESEND_COOLDOWN_SECONDS * 1000) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_SECONDS * 1000 - msSinceIssued) / 1000);
      return NextResponse.json({ error: `Aguarde ${waitSeconds}s antes de pedir um novo código.` }, { status: 429 });
    }
  }

  const code = generateTwoFactorCode();
  await prisma.merchant.update({
    where: { id: merchant.id },
    data: { twoFactorCode: code, twoFactorCodeExpiresAt: new Date(Date.now() + TWO_FACTOR_CODE_MINUTES * 60_000) },
  });
  const sent = await sendText(merchant.storeId, merchant.store.whatsapp, buildTwoFactorMessage(code));

  return NextResponse.json({ whatsappSent: sent.ok });
}
