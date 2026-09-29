import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMerchantSession } from '@/lib/auth';
import { storeSettingsSchema } from '@/lib/validation';

export async function GET() {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const store = await prisma.store.findUnique({
    where: { id: session.storeId },
    include: { hours: true },
  });
  return NextResponse.json({ store });
}

export async function PATCH(req: NextRequest) {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const parsed = storeSettingsSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const store = await prisma.store.update({
    where: { id: session.storeId },
    data: parsed.data,
  });
  return NextResponse.json({ store });
}
