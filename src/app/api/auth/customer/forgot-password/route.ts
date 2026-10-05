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

  // Customer.email é opcional no cadastro — clientes sem e-mail salvo não têm como
  // receber o link e caem na mesma resposta genérica de "exista ou não a conta".
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer) return genericResponse;

  const rawToken = await createPasswordResetToken({ customerId: customer.id });
  if (!rawToken) return genericResponse;

  const resetUrl = `${req.nextUrl.origin}/redefinir-senha?token=${rawToken}`;
  await sendPasswordResetEmail(customer.email as string, resetUrl);

  return genericResponse;
}
