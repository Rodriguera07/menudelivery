import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { getMerchantSession } from '@/lib/auth';

// Banner (capa) da loja — aparece no topo do cardápio. Mesmo esquema da logo.

const MAX_SIZE = 6 * 1024 * 1024; // 6MB — banner costuma ser maior que a logo
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
  if (!(file instanceof File)) return NextResponse.json({ error: 'Envie um arquivo de imagem.' }, { status: 400 });

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) return NextResponse.json({ error: 'Formato inválido. Use PNG, JPG ou WEBP.' }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'A imagem precisa ter até 6 MB.' }, { status: 400 });

  const store = await prisma.store.findUnique({ where: { id: session.storeId } });
  if (!store) return NextResponse.json({ error: 'Loja não encontrada.' }, { status: 404 });

  const blob = await put(`banners/${session.storeId}-${Date.now()}.${ext}`, file, { access: 'public' });
  await prisma.store.update({ where: { id: session.storeId }, data: { bannerUrl: blob.url } });
  if (store.bannerUrl) await del(store.bannerUrl).catch(() => {});

  return NextResponse.json({ bannerUrl: blob.url });
}

export async function DELETE() {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const store = await prisma.store.findUnique({ where: { id: session.storeId } });
  if (!store) return NextResponse.json({ error: 'Loja não encontrada.' }, { status: 404 });

  if (store.bannerUrl) await del(store.bannerUrl).catch(() => {});
  await prisma.store.update({ where: { id: session.storeId }, data: { bannerUrl: null } });
  return NextResponse.json({ ok: true });
}
