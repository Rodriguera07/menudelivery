import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMerchantSession } from '@/lib/auth';

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, select: { storeId: true, paymentMethod: true } });
  if (!order || order.storeId !== session.storeId) {
    return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
  }
  if (order.paymentMethod !== 'PIX') {
    return NextResponse.json({ error: 'Este pedido não é Pix.' }, { status: 400 });
  }

  await prisma.order.update({ where: { id }, data: { pixPaidAt: new Date() } });
  return NextResponse.json({ ok: true });
}
