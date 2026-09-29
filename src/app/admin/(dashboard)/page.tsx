import { requireMerchantSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatBRL } from '@/lib/format';
import { buildOrderMessage, buildWaLink } from '@/lib/whatsapp';
import PedidosBoard, { type PedidoCard } from './PedidosBoard';

const MINUTOS_ATRASO = 20;
const ACTIVE_STATUSES = ['RECEIVED', 'PREPARING', 'OUT_FOR_DELIVERY'] as const;

function paymentInfo(o: { paymentMethod: string; pixPaidAt: Date | null; changeFor: unknown }) {
  switch (o.paymentMethod) {
    case 'PIX':
      return { paid: o.pixPaidAt !== null, label: o.pixPaidAt ? 'Pix · pago' : 'Pix · aguardando' };
    case 'CREDIT':
      return { paid: false, label: 'Cartão de crédito na entrega' };
    case 'DEBIT':
      return { paid: false, label: 'Cartão de débito na entrega' };
    case 'CASH':
      return {
        paid: false,
        label: o.changeFor ? `Dinheiro · troco p/ ${formatBRL(Number(o.changeFor))}` : 'Dinheiro · sem troco',
      };
    default:
      return { paid: false, label: o.paymentMethod };
  }
}

export default async function PedidosPage() {
  const session = await requireMerchantSession();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [store, boardOrders, todayOrders, cancelledToday] = await Promise.all([
    prisma.store.findUnique({ where: { id: session.storeId } }),
    prisma.order.findMany({
      where: {
        storeId: session.storeId,
        OR: [
          { status: { in: [...ACTIVE_STATUSES] } },
          { status: 'DELIVERED', createdAt: { gte: startOfToday } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: { items: true, customer: true },
    }),
    prisma.order.findMany({
      where: { storeId: session.storeId, createdAt: { gte: startOfToday }, status: { not: 'CANCELLED' } },
      select: { total: true },
    }),
    prisma.order.count({
      where: { storeId: session.storeId, createdAt: { gte: startOfToday }, status: 'CANCELLED' },
    }),
  ]);

  if (!store) return null;

  const now = Date.now();
  const pedidos: PedidoCard[] = boardOrders.map((o) => {
    const address = JSON.parse(o.addressSnapshot) as {
      street: string;
      number: string;
      complement?: string;
      district: string;
      city: string;
      cep: string;
      reference?: string;
    };
    const addressLine = `${address.street}, ${address.number}${address.complement ? ' – ' + address.complement : ''}, ${address.district}, ${address.city}`;
    const { paid, label } = paymentInfo(o);

    const message = buildOrderMessage({
      number: o.number,
      customerName: o.customer.name,
      customerPhone: o.customer.phone,
      addressLine,
      reference: address.reference,
      items: o.items.map((i) => ({ name: i.name, qty: i.qty, price: Number(i.price) })),
      subtotal: Number(o.subtotal),
      discount: Number(o.discount),
      deliveryFee: Number(o.deliveryFee),
      total: Number(o.total),
      paymentMethod: o.paymentMethod,
      changeFor: o.changeFor !== null ? Number(o.changeFor) : null,
      notes: o.notes,
    });

    return {
      id: o.id,
      number: o.number,
      status: o.status,
      paymentMethod: o.paymentMethod,
      minutos: Math.max(0, Math.floor((now - o.createdAt.getTime()) / 60000)),
      customerName: o.customer.name,
      itemsSummary: o.items.map((i) => `${i.qty}× ${i.name}`).join(' · '),
      addressLine,
      total: Number(o.total),
      paid,
      paymentLabel: label,
      waLink: buildWaLink(store.whatsapp, message),
    };
  });

  const faturamento = todayOrders.reduce((s, o) => s + Number(o.total), 0);
  const pedidosHoje = todayOrders.length;
  const emAndamento = pedidos.filter((p) => (ACTIVE_STATUSES as readonly string[]).includes(p.status)).length;
  const atrasados = pedidos.filter(
    (p) => (ACTIVE_STATUSES as readonly string[]).includes(p.status) && p.minutos > MINUTOS_ATRASO,
  ).length;

  return (
    <PedidosBoard
      slug={store.slug}
      pedidos={pedidos}
      stats={{
        pedidosHoje,
        faturamento,
        ticketMedio: pedidosHoje ? faturamento / pedidosHoje : 0,
        emAndamento,
        atrasados,
        cancelados: cancelledToday,
      }}
    />
  );
}
