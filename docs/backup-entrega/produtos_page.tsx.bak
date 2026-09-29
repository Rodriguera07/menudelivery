import { requireMerchantSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProductsManager from './ProductsManager';

export default async function ProdutosPage() {
  const session = await requireMerchantSession();
  const products = await prisma.product.findMany({
    where: { storeId: session.storeId },
    orderBy: { createdAt: 'desc' },
  });

  const initialProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    description: p.description,
    price: Number(p.price),
    promoPrice: p.promoPrice !== null ? Number(p.promoPrice) : null,
    active: p.active,
    sold: p.sold,
  }));

  return <ProductsManager initialProducts={initialProducts} />;
}
