import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { prisma } from '@/lib/prisma';
import { getCustomerSession } from '@/lib/auth';
import { formatBRL } from '@/lib/format';
import { buildOrderMessage, buildWaLink } from '@/lib/whatsapp';
import { buildPixPayload } from '@/lib/pix-brcode';
import { ORDER_STATUS_LABELS } from '@/lib/order-status';
import PixPayment from './PixPayment';

const PAYMENT_LABELS: Record<string, string> = {
  PIX: 'Pix',
  CREDIT: 'Cartão de crédito',
  DEBIT: 'Cartão de débito',
  CASH: 'Dinheiro',
};

const STATUS_BADGE: Record<string, string> = {
  RECEIVED: 'bg-blue-soft text-blue',
  PREPARING: 'bg-orange-soft text-orange',
  OUT_FOR_DELIVERY: 'bg-orange-soft text-orange',
  DELIVERED: 'bg-green-soft text-green',
  CANCELLED: 'bg-surface2 text-muted',
};

export default async function PedidoPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;

  const session = await getCustomerSession();
  if (!session) redirect(`/${slug}/entrar`);

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, store: true, customer: true },
  });
  if (!order || order.store.slug !== slug || order.customerId !== session.customerId) return notFound();

  const address = JSON.parse(order.addressSnapshot) as {
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    cep: string;
    reference?: string;
  };
  const addressLine = `${address.street}, ${address.number}${address.complement ? ' – ' + address.complement : ''}, ${address.district}, ${address.city} (CEP ${address.cep})`;

  const message = buildOrderMessage({
    number: order.number,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    addressLine,
    reference: address.reference,
    items: order.items.map((i) => ({ name: i.name, qty: i.qty, price: Number(i.price) })),
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    deliveryFee: Number(order.deliveryFee),
    total: Number(order.total),
    paymentMethod: order.paymentMethod,
    changeFor: order.changeFor !== null ? Number(order.changeFor) : null,
    notes: order.notes,
  });
  const waLink = buildWaLink(order.store.whatsapp, message);
  const autoSent = order.whatsappSentAt !== null;

  let pixQrDataUrl: string | null = null;
  let pixCode: string | null = null;
  if (order.paymentMethod === 'PIX' && order.store.pixKey) {
    pixCode = buildPixPayload({
      pixKey: order.store.pixKey,
      amount: Number(order.total),
      merchantName: order.store.name,
      txId: order.id,
    });
    pixQrDataUrl = await QRCode.toDataURL(pixCode, { margin: 1, width: 320 });
  }

  return (
    <main className="max-w-md mx-auto min-h-screen bg-bg p-4 space-y-4">
      <div className="bg-surface rounded-2xl p-4 text-center">
        <p className="text-muted text-sm">Número do pedido</p>
        <p className="font-display text-3xl font-extrabold">#{order.number}</p>
        <p className="text-sm text-muted mt-1">
          {order.items.reduce((a, i) => a + i.qty, 0)} itens · {formatBRL(Number(order.total))}
        </p>
        <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full ${STATUS_BADGE[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status].toUpperCase()}
        </span>
      </div>

      <div className="bg-surface rounded-2xl p-4">
        <h4 className="font-semibold text-sm mb-2">Itens</h4>
        {order.items.map((i) => (
          <div key={i.id} className="flex justify-between text-sm py-1">
            <span>{i.qty}× {i.name}</span>
            <span>{formatBRL(Number(i.price) * i.qty)}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold pt-2 mt-2 border-t border-line">
          <span>Total</span>
          <span>{formatBRL(Number(order.total))}</span>
        </div>
      </div>

      <div className="bg-surface rounded-2xl p-4 text-sm">
        <h4 className="font-semibold mb-2">Entrega</h4>
        <p>{addressLine}</p>
        <h4 className="font-semibold mt-3 mb-1">Pagamento</h4>
        <p>{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
      </div>

      {order.paymentMethod === 'PIX' && (
        pixQrDataUrl && pixCode ? (
          <PixPayment
            slug={slug}
            orderId={order.id}
            qrCodeDataUrl={pixQrDataUrl}
            pixCode={pixCode}
            initialPaid={order.pixPaidAt !== null}
          />
        ) : (
          <div className="bg-surface rounded-2xl p-4 text-center text-sm">
            Combine o pagamento Pix diretamente com {order.store.name} pelo WhatsApp.
          </div>
        )
      )}

      {autoSent ? (
        <div className="bg-green-soft text-green rounded-2xl p-4 text-center text-sm font-semibold">
          Pedido enviado automaticamente para {order.store.name} ✓
        </div>
      ) : (
        <>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full block text-center"
            style={{ backgroundColor: '#25D366' }}
          >
            Enviar pedido no WhatsApp
          </a>
          <p className="text-center text-xs text-muted">
            Confirme o envio para {order.store.name} garantir o preparo do seu pedido.
          </p>
        </>
      )}

      <Link href={`/${slug}`} className="block text-center text-brand font-semibold text-sm">
        Voltar ao cardápio
      </Link>
    </main>
  );
}
