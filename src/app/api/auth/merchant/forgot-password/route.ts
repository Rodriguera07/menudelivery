import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { forgotPasswordSchema } from '@/lib/validation';
import { createPasswordResetToken } from '@/lib/password-reset';
import { sendPasswordResetEmail } from '@/lib/email';

// Sempre responde {ok:true}, exista ou não a conta — do contrário dá pra descobrir
// quais e-mails estão cadastrados só testando este endpoint (enumeração de contas).
const genericResponse = NextResponse.json({ ok: true });

export async function POST(req: NextRequest) {
  const parsed = forgotPasswordSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { email } = parsed.data;

  const merchant = await prisma.merchant.findUnique({ where: { email } });
  if (!merchant) return genericResponse;

  const rawToken = await createPasswordResetToken({ merchantId: merchant.id });
  if (!rawToken) return genericResponse;

  const resetUrl = `${req.nextUrl.origin}/admin/redefinir-senha?token=${rawToken}`;
  await sendPasswordResetEmail(merchant.email, resetUrl);

  return genericResponse;
}
