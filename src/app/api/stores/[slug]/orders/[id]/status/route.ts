import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCustomerSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const { slug, id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: { customerId: true, pixPaidAt: true, store: { select: { slug: true } } },
  });
  if (!order || order.store.slug !== slug || order.customerId !== session.customerId) {
    return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
  }

  return NextResponse.json({ paid: order.pixPaidAt !== null });
}
