export type CouponLike = { type: 'PERCENT' | 'FIXED' | 'FREE_DELIVERY'; value: number };

export function computeDiscount(coupon: CouponLike, subtotal: number, deliveryFee: number) {
  if (coupon.type === 'PERCENT') return (subtotal * coupon.value) / 100;
  if (coupon.type === 'FIXED') return Math.min(coupon.value, subtotal);
  return deliveryFee;
}

export function describeCoupon(coupon: CouponLike) {
  if (coupon.type === 'PERCENT') return `${coupon.value}% de desconto`;
  if (coupon.type === 'FIXED') return `${coupon.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de desconto`;
  return 'Entrega grátis';
}

export function unitPrice(product: { price: number; promoPrice: number | null }) {
  return product.promoPrice !== null && product.promoPrice < product.price ? product.promoPrice : product.price;
}
