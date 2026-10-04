import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getMerchantSession } from '@/lib/auth';

const schema = z.object({ enabled: z.boolean() });

export async function PATCH(req: NextRequest) {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  if (parsed.data.enabled) {
    const store = await prisma.store.findUnique({ where: { id: session.storeId }, select: { waConnected: true } });
    if (!store?.waConnected) {
      return NextResponse.json(
        { error: 'Conecte o WhatsApp da loja em Loja > WhatsApp antes de ativar o 2FA — sem ele o código não chega.' },
        { status: 400 },
      );
    }
  }

  await prisma.merchant.update({ where: { id: session.merchantId }, data: { twoFactor: parsed.data.enabled } });
  return NextResponse.json({ twoFactor: parsed.data.enabled });
}
