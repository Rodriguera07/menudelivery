import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resetPasswordSchema } from '@/lib/validation';
import { consumePasswordResetToken } from '@/lib/password-reset';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const parsed = resetPasswordSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { token, password } = parsed.data;

  const account = await consumePasswordResetToken(token);
  if (!account || !('merchantId' in account)) {
    return NextResponse.json({ error: 'Link inválido ou expirado. Peça um novo.' }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  await prisma.merchant.update({
    where: { id: account.merchantId },
    data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
  });

  return NextResponse.json({ ok: true });
}
