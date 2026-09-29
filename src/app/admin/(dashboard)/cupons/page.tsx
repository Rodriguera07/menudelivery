import { requireMerchantSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CouponsManager from './CouponsManager';

export default async function CuponsPage() {
  const session = await requireMerchantSession();
  const coupons = await prisma.coupon.findMany({
    where: { storeId: session.storeId },
    orderBy: { code: 'asc' },
  });

  const initialCoupons = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    value: Number(c.value),
    minOrder: Number(c.minOrder),
    active: c.active,
    uses: c.uses,
  }));

  return <CouponsManager initialCoupons={initialCoupons} />;
}
