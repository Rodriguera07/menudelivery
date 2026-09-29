import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { getMerchantSession } from '@/lib/auth';

// Foto do produto — mesmo esquema da logo da loja (Vercel Blob, PNG/JPG/WEBP até 4 MB).

const MAX_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

async function ownedProduct(storeId: string, id: string) {
  return prisma.product.findFirst({ where: { id, storeId } });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const { id } = await params;
  const product = await ownedProduct(session.storeId, id);
  if (!product) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Envie um arquivo de imagem.' }, { status: 400 });

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) return NextResponse.json({ error: 'Formato inválido. Use PNG, JPG ou WEBP.' }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'A imagem precisa ter até 4 MB.' }, { status: 400 });

  const blob = await put(`produtos/${session.storeId}/${id}-${Date.now()}.${ext}`, file, { access: 'public' });
  await prisma.product.update({ where: { id }, data: { photoUrl: blob.url } });
  if (product.photoUrl) await del(product.photoUrl).catch(() => {});

  return NextResponse.json({ photoUrl: blob.url });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getMerchantSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const { id } = await params;
  const product = await ownedProduct(session.storeId, id);
  if (!product) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });

  if (product.photoUrl) await del(product.photoUrl).catch(() => {});
  await prisma.product.update({ where: { id }, data: { photoUrl: null } });
  return NextResponse.json({ ok: true });
}
