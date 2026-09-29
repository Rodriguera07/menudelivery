import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMerchantSession } from '@/lib/auth';
import { productUpdateSchema } from '@/lib/validation';

async function findOwnedProduct(storeId: string, id: string) {
  return prisma.product.findFirst({ where: { id, storeId } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const { id } = await params;
  const existing = await findOwnedProduct(session.storeId, id);
  if (!existing) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });

  const parsed = productUpdateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { name, category, description, price, promoPrice, active } = parsed.data;

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(category !== undefined && { category }),
      ...(description !== undefined && { description: description || null }),
      ...(price !== undefined && { price }),
      ...(promoPrice !== undefined && { promoPrice }),
      ...(active !== undefined && { active }),
    },
  });

  return NextResponse.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const { id } = await params;
  const existing = await findOwnedProduct(session.storeId, id);
  if (!existing) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
