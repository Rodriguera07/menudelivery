import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import RedefinirSenhaForm from './RedefinirSenhaForm';

export default async function RedefinirSenhaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await prisma.store.findUnique({ where: { slug }, select: { id: true } });
  if (!store) return notFound();

  return <RedefinirSenhaForm slug={slug} />;
}
