import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMerchantSession } from '@/lib/auth';
import { couponUpdateSchema } from '@/lib/validation';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.coupon.findFirst({ where: { id, storeId: session.storeId } });
  if (!existing) return NextResponse.json({ error: 'Cupom não encontrado.' }, { status: 404 });

  const parsed = couponUpdateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const coupon = await prisma.coupon.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ coupon });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.coupon.findFirst({ where: { id, storeId: session.storeId } });
  if (!existing) return NextResponse.json({ error: 'Cupom não encontrado.' }, { status: 404 });

  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
