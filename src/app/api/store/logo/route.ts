import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { getMerchantSession } from '@/lib/auth';

const MAX_SIZE = 4 * 1024 * 1024; // 4MB
const ALLOWED_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export async function POST(req: NextRequest) {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Envie um arquivo de imagem.' }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: 'Formato inválido. Use PNG, JPG ou WEBP.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'A imagem precisa ter até 4MB.' }, { status: 400 });
  }

  const store = await prisma.store.findUnique({ where: { id: session.storeId } });
  if (!store) return NextResponse.json({ error: 'Loja não encontrada.' }, { status: 404 });

  const blob = await put(`logos/${session.storeId}-${Date.now()}.${ext}`, file, {
    access: 'public',
  });

  await prisma.store.update({ where: { id: session.storeId }, data: { logoUrl: blob.url } });

  if (store.logoUrl) {
    await del(store.logoUrl).catch(() => {});
  }

  return NextResponse.json({ logoUrl: blob.url });
}

export async function DELETE() {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const store = await prisma.store.findUnique({ where: { id: session.storeId } });
  if (!store) return NextResponse.json({ error: 'Loja não encontrada.' }, { status: 404 });

  if (store.logoUrl) {
    await del(store.logoUrl).catch(() => {});
  }
  await prisma.store.update({ where: { id: session.storeId }, data: { logoUrl: null } });

  return NextResponse.json({ ok: true });
}
