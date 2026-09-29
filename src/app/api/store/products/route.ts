import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMerchantSession } from '@/lib/auth';
import { productSchema } from '@/lib/validation';

export async function GET() {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const products = await prisma.product.findMany({
    where: { storeId: session.storeId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const parsed = productSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { name, category, description, price, promoPrice } = parsed.data;

  const product = await prisma.product.create({
    data: {
      storeId: session.storeId,
      name,
      category,
      description: description || null,
      price,
      promoPrice: promoPrice ?? null,
    },
  });

  return NextResponse.json({ product });
}
