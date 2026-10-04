import { formatBRL } from '@/lib/format';
import { ORDER_STATUS_LABELS } from '@/lib/order-status';
import type { OrderStatus } from '@prisma/client';

const PAY_LABELS: Record<string, string> = {
  PIX: 'Pix',
  CREDIT: 'Cartão de crédito',
  DEBIT: 'Cartão de débito',
  CASH: 'Dinheiro',
};

export type WhatsAppOrder = {
  number: number;
  customerName: string;
  customerPhone: string;
  addressLine: string;
  reference?: string | null;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  discount: number;
  couponCode?: string | null;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  changeFor?: number | null;
  notes?: string | null;
};

export function buildOrderMessage(o: WhatsAppOrder) {
  const lines: string[] = [];
  lines.push(`*NOVO PEDIDO #${o.number}*`, '');
  lines.push(`*Cliente:* ${o.customerName}`, `*WhatsApp:* ${o.customerPhone}`);
  lines.push(`*Entrega:* ${o.addressLine}`);
  if (o.reference) lines.push(`*Referência:* ${o.reference}`);
  lines.push('', '*Itens*');
  o.items.forEach((i) => lines.push(`${i.qty}x ${i.name} — ${formatBRL(i.price * i.qty)}`));
  lines.push('', `Subtotal: ${formatBRL(o.subtotal)}`);
  if (o.discount) lines.push(`Cupom ${o.couponCode}: -${formatBRL(o.discount)}`);
  lines.push(`Taxa de entrega: ${formatBRL(o.deliveryFee)}`, `*TOTAL: ${formatBRL(o.total)}*`, '');
  let pay = `*Pagamento:* ${PAY_LABELS[o.paymentMethod] ?? o.paymentMethod}`;
  if (o.paymentMethod === 'CASH') pay += o.changeFor ? ` (troco para ${formatBRL(o.changeFor)})` : ' (sem troco)';
  if (o.paymentMethod === 'CREDIT' || o.paymentMethod === 'DEBIT') pay += ' — maquininha na entrega';
  if (o.paymentMethod === 'PIX') pay += ' — aguardando comprovante';
  lines.push(pay);
  if (o.notes) lines.push(`*Obs.:* ${o.notes}`);
  return lines.join('\n');
}

export function buildStatusMessage(storeName: string, orderNumber: number, status: OrderStatus, trackingUrl: string) {
  const lines = [
    `*${storeName}*`,
    `Seu pedido #${orderNumber} agora está: *${ORDER_STATUS_LABELS[status]}*`,
    '',
    `Acompanhe: ${trackingUrl}`,
  ];
  return lines.join('\n');
}

export function buildWaLink(whatsapp: string, message: string) {
  const digits = whatsapp.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
