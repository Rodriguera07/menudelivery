import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCustomerSession } from '@/lib/auth';
import CartCheckout from './CartCheckout';

export default async function CarrinhoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await prisma.store.findUnique({
    where: { slug },
    include: {
      products: { where: { active: true } },
      coupons: { where: { active: true } },
      zones: { where: { active: true }, orderBy: { name: 'asc' } },
    },
  });
  if (!store) return notFound();

  const session = await getCustomerSession();
  if (!session) redirect(`/${slug}/entrar?next=/${slug}/carrinho`);

  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
    include: { addresses: { where: { isDefault: true }, take: 1 } },
  });
  if (!customer) redirect(`/${slug}/entrar`);

  const products = store.products.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    promoPrice: p.promoPrice !== null ? Number(p.promoPrice) : null,
  }));
  const coupons = store.coupons.map((c) => ({
    code: c.code,
    type: c.type,
    value: Number(c.value),
    minOrder: Number(c.minOrder),
  }));
  const defaultAddress = customer.addresses[0]
    ? {
        cep: customer.addresses[0].cep,
        street: customer.addresses[0].street,
        number: customer.addresses[0].number,
        complement: customer.addresses[0].complement ?? '',
        district: customer.addresses[0].district,
        city: customer.addresses[0].city,
        reference: customer.addresses[0].reference ?? '',
      }
    : null;

  return (
    <CartCheckout
      slug={slug}
      products={products}
      coupons={coupons}
      deliveryFee={Number(store.deliveryFee)}
      deliveryMode={store.deliveryMode}
      zones={store.zones.map((z) => ({ name: z.name, fee: Number(z.fee) }))}
      minOrder={Number(store.minOrder)}
      isOpen={store.isOpen}
      defaultAddress={defaultAddress}
    />
  );
}
