import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMerchantSession } from '@/lib/auth';
import { storeSettingsSchema } from '@/lib/validation';
import { normalizeDistrict } from '@/lib/delivery';

export async function GET() {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const store = await prisma.store.findUnique({
    where: { id: session.storeId },
    include: { hours: true, zones: { orderBy: { name: 'asc' } } },
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
  const { zones, ...data } = parsed.data;

  // Bairros: sem nomes repetidos (ignorando acento e maiúsculas).
  if (zones) {
    const vistos = new Set<string>();
    for (const z of zones) {
      const k = normalizeDistrict(z.name);
      if (vistos.has(k)) {
        return NextResponse.json({ error: `O bairro "${z.name}" aparece mais de uma vez.` }, { status: 400 });
      }
      vistos.add(k);
    }
  }
  if (data.deliveryMode === 'BY_DISTRICT') {
    const ativos = zones ?? (await prisma.deliveryZone.findMany({ where: { storeId: session.storeId } }));
    if (!ativos.some((z) => z.active !== false)) {
      return NextResponse.json({ error: 'Cadastre pelo menos um bairro ativo para cobrar entrega por bairro.' }, { status: 400 });
    }
  }

  const store = await prisma.$transaction(async (tx) => {
    if (zones) {
      // A lista enviada substitui a anterior inteira.
      await tx.deliveryZone.deleteMany({ where: { storeId: session.storeId } });
      if (zones.length) {
        await tx.deliveryZone.createMany({
          data: zones.map((z) => ({
            storeId: session.storeId,
            name: z.name.trim().replace(/\s+/g, ' '),
            fee: z.fee,
            active: z.active ?? true,
          })),
        });
      }
    }
    return tx.store.update({
      where: { id: session.storeId },
      data,
      include: { zones: { orderBy: { name: 'asc' } } },
    });
  });

  return NextResponse.json({ store });
}
