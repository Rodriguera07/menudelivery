import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateCouponSchema } from '@/lib/validation';
import { computeDiscount, describeCoupon } from '@/lib/coupon';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const parsed = validateCouponSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: parsed.error.issues[0].message });
  }
  const { code, subtotal } = parsed.data;

  const store = await prisma.store.findUnique({ where: { slug } });
  if (!store) return NextResponse.json({ error: 'Loja não encontrada.' }, { status: 404 });

  const coupon = await prisma.coupon.findFirst({
    where: { storeId: store.id, code: code.toUpperCase(), active: true },
  });
  if (!coupon) {
    return NextResponse.json({ ok: false, message: `Cupom "${code.toUpperCase()}" não existe ou está desativado.` });
  }
  const minOrder = Number(coupon.minOrder);
  if (subtotal < minOrder) {
    return NextResponse.json({
      ok: false,
      message: `${coupon.code} vale para pedidos a partir de ${minOrder.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`,
    });
  }

  const value = Number(coupon.value);
  const discount = computeDiscount({ type: coupon.type, value }, subtotal, Number(store.deliveryFee));

  return NextResponse.json({
    ok: true,
    code: coupon.code,
    discount,
    message: `${coupon.code} aplicado: ${describeCoupon({ type: coupon.type, value })}.`,
  });
}
