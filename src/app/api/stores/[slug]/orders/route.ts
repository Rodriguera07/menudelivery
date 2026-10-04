import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCustomerSession } from '@/lib/auth';
import { checkoutSchema } from '@/lib/validation';
import { computeDiscount, unitPrice } from '@/lib/coupon';
import { buildOrderMessage } from '@/lib/whatsapp';
import { sendText } from '@/lib/whatsapp-evolution';
import { resolveDeliveryFee } from '@/lib/delivery';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: 'Faça login para finalizar o pedido.' }, { status: 401 });

  const { slug } = await params;
  const parsed = checkoutSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { items, couponCode, address, paymentMethod, changeFor, notes } = parsed.data;

  const store = await prisma.store.findUnique({ where: { slug }, include: { zones: true } });
  if (!store) return NextResponse.json({ error: 'Loja não encontrada.' }, { status: 404 });
  if (!store.isOpen) return NextResponse.json({ error: 'A loja está fechada agora.' }, { status: 400 });

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, storeId: store.id, active: true },
  });
  if (products.length !== productIds.length) {
    return NextResponse.json({ error: 'Um ou mais itens não estão mais disponíveis.' }, { status: 400 });
  }

  const productById = new Map(products.map((p) => [p.id, p]));
  const orderItems = items.map((i) => {
    const product = productById.get(i.productId)!;
    const price = unitPrice({ price: Number(product.price), promoPrice: product.promoPrice !== null ? Number(product.promoPrice) : null });
    return { productId: product.id, name: product.name, qty: i.qty, price };
  });
  const subtotal = orderItems.reduce((a, i) => a + i.price * i.qty, 0);

  const minOrder = Number(store.minOrder);
  if (subtotal < minOrder) {
    return NextResponse.json(
      { error: `Pedido mínimo de ${minOrder.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.` },
      { status: 400 },
    );
  }

  // Taxa calculada aqui no servidor: única ou pelo bairro do endereço.
  const entrega = resolveDeliveryFee(
    { deliveryMode: store.deliveryMode, deliveryFee: Number(store.deliveryFee) },
    store.zones.map((z) => ({ name: z.name, fee: Number(z.fee), active: z.active })),
    address.district,
  );
  if (!entrega.ok) return NextResponse.json({ error: entrega.error }, { status: 400 });
  const deliveryFee = entrega.fee;
  let discount = 0;
  let coupon = null as Awaited<ReturnType<typeof prisma.coupon.findFirst>> | null;
  if (couponCode) {
    coupon = await prisma.coupon.findFirst({
      where: { storeId: store.id, code: couponCode.toUpperCase(), active: true },
    });
    if (!coupon) {
      return NextResponse.json({ error: `Cupom "${couponCode.toUpperCase()}" não existe ou está desativado.` }, { status: 400 });
    }
    const couponMinOrder = Number(coupon.minOrder);
    if (subtotal < couponMinOrder) {
      return NextResponse.json(
        { error: `${coupon.code} vale para pedidos a partir de ${couponMinOrder.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.` },
        { status: 400 },
      );
    }
    discount = computeDiscount({ type: coupon.type, value: Number(coupon.value) }, subtotal, deliveryFee);
  }

  const total = Math.max(0, subtotal + deliveryFee - discount);

  const order = await prisma.$transaction(async (tx) => {
    const last = await tx.order.findFirst({
      where: { storeId: store.id },
      orderBy: { number: 'desc' },
      select: { number: true },
    });
    const number = (last?.number ?? 0) + 1;

    const created = await tx.order.create({
      data: {
        number,
        storeId: store.id,
        customerId: session.customerId,
        addressSnapshot: JSON.stringify(address),
        subtotal,
        discount,
        deliveryFee,
        total,
        paymentMethod,
        changeFor: paymentMethod === 'CASH' ? changeFor ?? null : null,
        notes: notes || null,
        items: { create: orderItems },
      },
      include: { items: true, customer: true },
    });

    for (const item of orderItems) {
      await tx.product.update({ where: { id: item.productId }, data: { sold: { increment: item.qty } } });
    }
    if (coupon) {
      await tx.coupon.update({ where: { id: coupon.id }, data: { uses: { increment: 1 } } });
    }

    const existingAddress = await tx.address.findFirst({
      where: { customerId: session.customerId, isDefault: true },
    });
    if (existingAddress) {
      await tx.address.update({ where: { id: existingAddress.id }, data: address });
    } else {
      await tx.address.create({ data: { ...address, customerId: session.customerId, isDefault: true } });
    }

    return created;
  });

  const addressLine = `${address.street}, ${address.number}${address.complement ? ' – ' + address.complement : ''}, ${address.district}, ${address.city} (CEP ${address.cep})`;
  const message = buildOrderMessage({
    number: order.number,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    addressLine,
    reference: address.reference,
    items: orderItems.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
    subtotal,
    discount,
    couponCode: coupon?.code,
    deliveryFee,
    total,
    paymentMethod,
    changeFor: paymentMethod === 'CASH' ? changeFor ?? null : null,
    notes,
  });
  const sent = await sendText(store.id, store.whatsapp, message);
  if (sent.ok) {
    await prisma.order.update({ where: { id: order.id }, data: { whatsappSentAt: new Date() } });
  }

  return NextResponse.json({ order: { id: order.id, number: order.number } });
}
