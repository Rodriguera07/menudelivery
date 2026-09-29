import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCustomerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EntrarForm from './EntrarForm';

export default async function EntrarPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { slug } = await params;
  const { next } = await searchParams;
  const store = await prisma.store.findUnique({ where: { slug } });
  if (!store) return notFound();

  // Só aceita redirecionar dentro da própria loja — nunca um destino externo vindo da URL.
  const safeNext = next && next.startsWith(`/${slug}`) ? next : `/${slug}`;

  const session = await getCustomerSession();
  if (session) redirect(safeNext);

  return <EntrarForm slug={slug} storeName={store.name} storeTagline={store.tagline ?? ''} next={safeNext} />;
}
