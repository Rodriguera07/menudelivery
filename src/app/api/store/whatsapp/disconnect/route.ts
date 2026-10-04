import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMerchantSession } from '@/lib/auth';
import { logoutInstance } from '@/lib/whatsapp-evolution';

export async function POST() {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const res = await logoutInstance(session.storeId);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });

  await prisma.store.update({ where: { id: session.storeId }, data: { waConnected: false } });
  return NextResponse.json({ connected: false });
}
