import { NextResponse } from 'next/server';
import { getMerchantSession } from '@/lib/auth';
import { createInstance, fetchQrCode } from '@/lib/whatsapp-evolution';

export async function POST() {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const created = await createInstance(session.storeId);
  if (!created.ok) return NextResponse.json({ error: created.error }, { status: 400 });

  const qr = await fetchQrCode(session.storeId);
  if (!qr.ok) return NextResponse.json({ error: qr.error }, { status: 400 });

  return NextResponse.json({ qrCode: qr.data });
}
