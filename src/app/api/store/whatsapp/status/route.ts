import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMerchantSession } from '@/lib/auth';
import { fetchConnectionState } from '@/lib/whatsapp-evolution';

export async function GET() {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const state = await fetchConnectionState(session.storeId);
  if (!state.ok) return NextResponse.json({ error: state.error }, { status: 400 });

  const connected = state.data === 'open';
  if (connected) {
    await prisma.store.updateMany({
      where: { id: session.storeId, waConnected: false },
      data: { waConnected: true, waConnectedAt: new Date() },
    });
  } else {
    await prisma.store.updateMany({
      where: { id: session.storeId, waConnected: true },
      data: { waConnected: false },
    });
  }

  return NextResponse.json({ connected });
}
