import { requireMerchantSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '../ui';
import StoreSettingsForm from './StoreSettingsForm';
import StoreHoursEditor from './StoreHoursEditor';
import TwoFactorToggle from './TwoFactorToggle';

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

export default async function LojaPage() {
  const session = await requireMerchantSession();
  const store = await prisma.store.findUnique({
    where: { id: session.storeId },
    include: { hours: true, merchant: true },
  });
  if (!store) return null;

  const hoursByWeekday = new Map(store.hours.map((h) => [h.weekday, h]));
  const hours = WEEKDAYS.map((weekday) => {
    const existing = hoursByWeekday.get(weekday);
    return {
      weekday,
      closed: existing?.closed ?? false,
      openTime: existing?.openTime ?? '09:00',
      closeTime: existing?.closeTime ?? '18:00',
    };
  });

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <PageHeader title="Loja" subtitle="Identidade, entrega, pagamento, horário e segurança — tudo num só lugar." />
      <StoreSettingsForm
        store={{
          name: store.name,
          tagline: store.tagline,
          logoUrl: store.logoUrl,
          isOpen: store.isOpen,
          whatsapp: store.whatsapp,
          pixKey: store.pixKey ?? '',
          deliveryFee: Number(store.deliveryFee),
          minOrder: Number(store.minOrder),
          slug: store.slug,
          commissionPct: Number(store.commissionPct),
        }}
      >
        <StoreHoursEditor initialHours={hours} />
        <TwoFactorToggle enabled={store.merchant?.twoFactor ?? false} />
      </StoreSettingsForm>
    </div>
  );
}
