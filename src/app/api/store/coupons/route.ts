import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getMerchantSession } from '@/lib/auth';
import { couponSchema } from '@/lib/validation';

export async function GET() {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const coupons = await prisma.coupon.findMany({
    where: { storeId: session.storeId },
    orderBy: { code: 'asc' },
  });
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const parsed = couponSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { code, type, value, minOrder } = parsed.data;

  try {
    const coupon = await prisma.coupon.create({
      data: {
        storeId: session.storeId,
        code: code.toUpperCase(),
        type,
        value,
        minOrder: minOrder ?? 0,
      },
    });
    return NextResponse.json({ coupon });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'Já existe um cupom com este código.' }, { status: 409 });
    }
    throw err;
  }
}
