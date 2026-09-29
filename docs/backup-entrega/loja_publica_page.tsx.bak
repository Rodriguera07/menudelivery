import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getCustomerSession } from '@/lib/auth';
import { unitPrice } from '@/lib/coupon';
import LojaCardapio, { type Loja, type Produto } from './LojaCardapio';

// Cardápio público do cliente — aberto a partir do link do WhatsApp: cardapiozap.app/[slug]
export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await prisma.store.findUnique({
    where: { slug },
    include: { products: { where: { active: true }, orderBy: { createdAt: 'asc' } } },
  });

  if (!store) return notFound();

  const session = await getCustomerSession();
  const customer = session ? await prisma.customer.findUnique({ where: { id: session.customerId } }) : null;

  const bestSellerIds = new Set(
    store.products
      .filter((p) => p.sold > 0)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 3)
      .map((p) => p.id),
  );

  const produtos: Produto[] = store.products.map((p) => {
    const price = Number(p.price);
    const promoPrice = p.promoPrice !== null ? Number(p.promoPrice) : null;
    const preco = unitPrice({ price, promoPrice });
    return {
      id: p.id,
      categoria: p.category,
      nome: p.name,
      descricao: p.description ?? undefined,
      precoCentavos: Math.round(preco * 100),
      precoOriginalCentavos: preco < price ? Math.round(price * 100) : undefined,
      imagemUrl: p.photoUrl ?? undefined,
      destaque: bestSellerIds.has(p.id),
    };
  });

  const categoriasUnicas = [...new Set(produtos.map((p) => p.categoria))];

  const loja: Loja = {
    nome: store.name,
    subtitulo: store.tagline ?? (categoriasUnicas.length ? categoriasUnicas.slice(0, 3).join(' · ') : undefined),
    logoUrl: store.logoUrl ?? undefined,
    aberta: store.isOpen,
    taxaEntregaCentavos: Math.round(Number(store.deliveryFee) * 100),
    pedidoMinimoCentavos: Math.round(Number(store.minOrder) * 100),
  };

  return <LojaCardapio slug={slug} loja={loja} produtos={produtos} customerName={customer?.name ?? null} />;
}
