import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createMerchantSession } from '@/lib/auth';
import { merchantSignupSchema } from '@/lib/validation';
import { slugify } from '@/lib/slug';

async function uniqueSlug(base: string) {
  const baseSlug = slugify(base);
  let slug = baseSlug;
  let n = 1;
  while (await prisma.store.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${baseSlug}-${n}`;
  }
  return slug;
}

export async function POST(req: NextRequest) {
  const parsed = merchantSignupSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { storeName, category, ownerName, whatsapp, email, password } = parsed.data;

  const existing = await prisma.merchant.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: 'Já existe uma loja cadastrada com este e-mail.' },
      { status: 409 },
    );
  }

  const slug = await uniqueSlug(storeName);
  const passwordHash = await hashPassword(password);

  const store = await prisma.store.create({
    data: {
      slug,
      name: storeName,
      category,
      whatsapp,
      merchant: {
        create: { ownerName, email, passwordHash },
      },
    },
    include: { merchant: true },
  });

  await createMerchantSession({ merchantId: store.merchant!.id, storeId: store.id });

  return NextResponse.json({ store: { id: store.id, slug: store.slug, name: store.name } });
}
