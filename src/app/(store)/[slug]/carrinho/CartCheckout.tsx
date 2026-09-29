'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/useCart';
import { formatBRL } from '@/lib/format';
import { unitPrice } from '@/lib/coupon';
import { PAYMENT_METHODS } from '@/lib/validation';
import { findZone, type DeliveryModeValue } from '@/lib/delivery';

type Product = { id: string; name: string; price: number; promoPrice: number | null };
type Coupon = { code: string; type: 'PERCENT' | 'FIXED' | 'FREE_DELIVERY'; value: number; minOrder: number };
type Address = {
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  reference: string;
};

const PAYMENT_LABELS: Record<(typeof PAYMENT_METHODS)[number], { label: string; hint: string }> = {
  PIX: { label: 'Pix', hint: 'QR Code após confirmar' },
  CREDIT: { label: 'Crédito', hint: 'Maquininha na entrega' },
  DEBIT: { label: 'Débito', hint: 'Maquininha na entrega' },
  CASH: { label: 'Dinheiro', hint: 'Informe o troco' },
};

const EMPTY_ADDRESS: Address = { cep: '', street: '', number: '', complement: '', district: '', city: '', reference: '' };

export default function CartCheckout({
  slug,
  products,
  coupons,
  deliveryFee: taxaUnica,
  deliveryMode = 'FIXED',
  zones = [],
  minOrder,
  isOpen,
  defaultAddress,
}: {
  slug: string;
  products: Product[];
  coupons: Coupon[];
  deliveryFee: number;
  deliveryMode?: DeliveryModeValue;
  zones?: { name: string; fee: number }[];
  minOrder: number;
  isOpen: boolean;
  defaultAddress: Address | null;
}) {
  const router = useRouter();
  const { cart, inc, dec, clear } = useCart(slug);
  const productById = new Map(products.map((p) => [p.id, p]));

  const items = Object.entries(cart)
    .map(([productId, qty]) => ({ product: productById.get(productId), qty }))
    .filter((i): i is { product: Product; qty: number } => !!i.product && i.qty > 0);

  const subtotal = items.reduce((sum, i) => sum + unitPrice(i.product) * i.qty, 0);
  const toMin = Math.max(0, minOrder - subtotal);

  const [couponInput, setCouponInput] = useState('');
  const [couponResult, setCouponResult] = useState<{ ok: boolean; message: string; discount?: number; code?: string } | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const [address, setAddress] = useState<Address>(defaultAddress ?? EMPTY_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]>('PIX');
  const [changeFor, setChangeFor] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  // Entrega por bairro: a taxa depende do bairro escolhido (o servidor confere de novo).
  const porBairro = deliveryMode === 'BY_DISTRICT';
  const zona = porBairro ? findZone(zones, address.district) : null;
  const deliveryFee = porBairro ? zona?.fee ?? 0 : taxaUnica;

  const cupomUsado = couponResult?.ok ? coupons.find((c) => c.code === couponResult.code) : undefined;
  const discount = !couponResult?.ok
    ? 0
    : cupomUsado?.type === 'FREE_DELIVERY'
      ? deliveryFee
      : couponResult.discount ?? 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  async function applyCoupon(code?: string) {
    const value = (code ?? couponInput).trim();
    if (!value) return;
    setCouponInput(value);
    setCheckingCoupon(true);
    const res = await fetch(`/api/stores/${slug}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: value, subtotal }),
    });
    const data = await res.json();
    setCheckingCoupon(false);
    setCouponResult(data);
  }

  async function placeOrder() {
    setError('');
    if (!address.cep || !address.street || !address.number || !address.district || !address.city) {
      return setError('Preencha o endereço de entrega.');
    }
    if (porBairro && !zona) return setError('Escolha um dos bairros atendidos pela loja.');
    if (toMin > 0) return setError(`Pedido mínimo de ${formatBRL(minOrder)}.`);
    if (!isOpen) return setError('A loja está fechada agora.');

    setPlacing(true);
    const res = await fetch(`/api/stores/${slug}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.product.id, qty: i.qty })),
        couponCode: couponResult?.ok ? couponResult.code : '',
        address,
        paymentMethod,
        changeFor: paymentMethod === 'CASH' && changeFor ? Number(changeFor.replace(',', '.')) : null,
        notes,
      }),
    });
    const data = await res.json();
    setPlacing(false);
    if (!res.ok) return setError(data.error ?? 'Não foi possível enviar o pedido.');
    clear();
    router.push(`/${slug}/pedido/${data.order.id}`);
  }

  if (items.length === 0) {
    return (
      <main className="max-w-md mx-auto min-h-screen bg-bg p-4">
        <h2 className="font-display text-lg font-extrabold mb-4">Seu carrinho</h2>
        <div className="bg-surface rounded-2xl p-6 text-center">
          <b>Carrinho vazio.</b>
          <p className="text-muted text-sm mt-1">Adicione itens no cardápio.</p>
        </div>
        <Link href={`/${slug}`} className="btn-primary w-full mt-4 block text-center">
          Ver cardápio
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto min-h-screen bg-bg p-4 pb-8 space-y-4">
      <div className="flex items-center gap-2">
        <Link href={`/${slug}`} className="text-brand font-bold">←</Link>
        <h2 className="font-display text-lg font-extrabold">Seu pedido</h2>
      </div>

      {toMin > 0 && (
        <div className="bg-surface rounded-2xl p-3 text-sm">
          <b>Faltam {formatBRL(toMin)}</b> para o pedido mínimo de {formatBRL(minOrder)}.
        </div>
      )}

      <div className="bg-surface rounded-2xl p-4">
        <h4 className="font-semibold text-sm mb-2">Itens</h4>
        {items.map(({ product, qty }) => (
          <div key={product.id} className="flex items-center justify-between py-2 border-b border-line last:border-0">
            <div>
              <p className="text-sm font-medium">{product.name}</p>
              <p className="text-xs text-muted">{qty} × {formatBRL(unitPrice(product))}</p>
            </div>
            <div className="flex items-center gap-2 bg-surface2 rounded-full px-2 py-1">
              <button onClick={() => dec(product.id)} className="w-6 h-6 font-bold" aria-label="Remover um">−</button>
              <span className="w-4 text-center text-sm font-semibold">{qty}</span>
              <button onClick={() => inc(product.id)} className="w-6 h-6 font-bold" aria-label="Adicionar um">+</button>
            </div>
          </div>
        ))}
        <Link href={`/${slug}`} className="text-brand text-sm font-semibold block mt-2">+ Adicionar mais itens</Link>
      </div>

      <div className="bg-surface rounded-2xl p-4">
        <h4 className="font-semibold text-sm mb-2">Cupom de desconto</h4>
        <div className="flex gap-2">
          <input
            className="input font-mono uppercase"
            placeholder="Digite o cupom"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
          />
          <button onClick={() => applyCoupon()} disabled={checkingCoupon} className="btn-primary shrink-0">
            {checkingCoupon ? '…' : 'Aplicar'}
          </button>
        </div>
        {couponResult && (
          <p className={`text-sm mt-2 ${couponResult.ok ? 'text-green' : 'text-brand'}`}>{couponResult.message}</p>
        )}
        {!couponResult && coupons.length > 0 && (
          <p className="text-xs text-muted mt-2">
            Disponíveis:{' '}
            {coupons.map((c, i) => (
              <span key={c.code}>
                <button onClick={() => applyCoupon(c.code)} className="font-mono text-brand font-semibold">
                  {c.code}
                </button>
                {i < coupons.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </p>
        )}
      </div>

      <div className="bg-surface rounded-2xl p-4">
        <h4 className="font-semibold text-sm mb-2">Entregar em</h4>
        <div className="grid grid-cols-2 gap-2">
          <input className="input col-span-1" placeholder="CEP" value={address.cep} onChange={(e) => setAddress({ ...address, cep: e.target.value })} />
          <input className="input col-span-1" placeholder="Número" value={address.number} onChange={(e) => setAddress({ ...address, number: e.target.value })} />
          <input className="input col-span-2" placeholder="Rua / Avenida" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
          <input className="input col-span-2" placeholder="Complemento (opcional)" value={address.complement} onChange={(e) => setAddress({ ...address, complement: e.target.value })} />
          {porBairro ? (
            <select
              className="input col-span-1"
              aria-label="Bairro"
              value={zona?.name ?? ''}
              onChange={(e) => setAddress({ ...address, district: e.target.value })}
            >
              <option value="" disabled>
                Bairro
              </option>
              {zones.map((z) => (
                <option key={z.name} value={z.name}>
                  {z.name} · {z.fee > 0 ? formatBRL(z.fee) : 'grátis'}
                </option>
              ))}
            </select>
          ) : (
            <input className="input col-span-1" placeholder="Bairro" value={address.district} onChange={(e) => setAddress({ ...address, district: e.target.value })} />
          )}
          <input className="input col-span-1" placeholder="Cidade" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
          <input className="input col-span-2" placeholder="Ponto de referência (opcional)" value={address.reference} onChange={(e) => setAddress({ ...address, reference: e.target.value })} />
        </div>
      </div>

      <div className="bg-surface rounded-2xl p-4">
        <h4 className="font-semibold text-sm mb-2">Forma de pagamento</h4>
        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m}
              onClick={() => setPaymentMethod(m)}
              className={`text-left p-3 rounded-xl border ${paymentMethod === m ? 'border-brand bg-brand-soft' : 'border-line'}`}
            >
              <b className="block text-sm">{PAYMENT_LABELS[m].label}</b>
              <span className="text-xs text-muted">{PAYMENT_LABELS[m].hint}</span>
            </button>
          ))}
        </div>
        {paymentMethod === 'CASH' && (
          <label className="block mt-3">
            <span className="block text-sm font-medium text-ink mb-1">Troco para quanto?</span>
            <input
              className="input"
              inputMode="decimal"
              placeholder="Ex.: 100 (deixe vazio se não precisar)"
              value={changeFor}
              onChange={(e) => setChangeFor(e.target.value)}
            />
          </label>
        )}
      </div>

      <div className="bg-surface rounded-2xl p-4">
        <h4 className="font-semibold text-sm mb-2">Observações</h4>
        <textarea
          className="input"
          rows={2}
          placeholder="Ex.: interfone quebrado, ligar ao chegar"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="bg-surface rounded-2xl p-4">
        <div className="flex justify-between text-sm py-1">
          <span>Subtotal</span>
          <span>{formatBRL(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm py-1 text-green">
            <span>Cupom {couponResult?.code}</span>
            <span>−{formatBRL(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm py-1">
          <span>Taxa de entrega{porBairro && zona ? ` · ${zona.name}` : ''}</span>
          <span>{porBairro && !zona ? 'escolha o bairro' : deliveryFee > 0 ? formatBRL(deliveryFee) : 'Grátis'}</span>
        </div>
        <div className="flex justify-between font-bold py-1 border-t border-line mt-1 pt-2">
          <span>Total</span>
          <span>{formatBRL(total)}</span>
        </div>
      </div>

      {!isOpen && <p className="text-sm text-brand font-semibold">A loja está fechada agora.</p>}
      {error && <p className="text-sm text-brand font-semibold">{error}</p>}

      <button
        onClick={placeOrder}
        disabled={placing || toMin > 0 || !isOpen || (porBairro && !zona)}
        className="btn-primary w-full"
      >
        {placing ? 'Enviando pedido…' : `Enviar pedido · ${formatBRL(total)}`}
      </button>
      <p className="text-center text-xs text-muted">O pedido vai direto para o WhatsApp da loja.</p>
    </main>
  );
}
