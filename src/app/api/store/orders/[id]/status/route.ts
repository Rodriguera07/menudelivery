import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMerchantSession } from '@/lib/auth';
import { orderStatusUpdateSchema } from '@/lib/validation';
import { isValidTransition } from '@/lib/order-status';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const parsed = orderStatusUpdateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, select: { storeId: true, status: true } });
  if (!order || order.storeId !== session.storeId) {
    return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
  }
  if (!isValidTransition(order.status, parsed.data.status)) {
    return NextResponse.json({ error: 'Transição de status inválida.' }, { status: 400 });
  }

  const updated = await prisma.order.update({ where: { id }, data: { status: parsed.data.status } });
  return NextResponse.json({ order: { id: updated.id, status: updated.status } });
}
