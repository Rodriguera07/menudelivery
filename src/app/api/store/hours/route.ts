import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMerchantSession } from '@/lib/auth';
import { storeHoursSchema } from '@/lib/validation';

export async function PUT(req: NextRequest) {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const parsed = storeHoursSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const hours = await prisma.$transaction(
    parsed.data.map((day) =>
      prisma.storeHours.upsert({
        where: { storeId_weekday: { storeId: session.storeId, weekday: day.weekday } },
        create: { storeId: session.storeId, ...day },
        update: { closed: day.closed, openTime: day.openTime, closeTime: day.closeTime },
      }),
    ),
  );

  return NextResponse.json({ hours });
}
