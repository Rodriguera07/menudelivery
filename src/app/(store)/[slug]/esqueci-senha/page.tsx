import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import EsqueciSenhaForm from './EsqueciSenhaForm';

export default async function EsqueciSenhaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await prisma.store.findUnique({ where: { slug }, select: { id: true } });
  if (!store) return notFound();

  return <EsqueciSenhaForm slug={slug} />;
}
