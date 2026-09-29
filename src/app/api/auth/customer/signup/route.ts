import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createCustomerSession } from '@/lib/auth';
import { customerSignupSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  const parsed = customerSignupSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { name, phone, email, password } = parsed.data;

  const existing = await prisma.customer.findFirst({
    where: { OR: [{ phone }, ...(email ? [{ email }] : [])] },
  });
  if (existing) {
    return NextResponse.json(
      { error: 'Já existe uma conta com este WhatsApp ou e-mail.' },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);
  const customer = await prisma.customer.create({
    data: { name, phone, email: email || null, passwordHash },
  });

  await createCustomerSession({ customerId: customer.id });

  return NextResponse.json({ customer: { id: customer.id, name: customer.name } });
}
