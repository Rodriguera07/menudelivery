import type { OrderStatus } from '@prisma/client';

export const ORDER_STATUS_FLOW: OrderStatus[] = ['RECEIVED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  RECEIVED: 'Recebido',
  PREPARING: 'Preparando',
  OUT_FOR_DELIVERY: 'Saiu para entrega',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

export function nextStatus(current: OrderStatus): OrderStatus | null {
  const idx = ORDER_STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx === ORDER_STATUS_FLOW.length - 1) return null;
  return ORDER_STATUS_FLOW[idx + 1];
}

export function canCancel(current: OrderStatus): boolean {
  return current !== 'DELIVERED' && current !== 'CANCELLED';
}

export function isValidTransition(current: OrderStatus, target: OrderStatus): boolean {
  if (target === 'CANCELLED') return canCancel(current);
  return nextStatus(current) === target;
}
