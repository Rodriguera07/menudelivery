'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/useCart';
import { formatBRL } from '@/lib/format';
import { unitPrice } from '@/lib/coupon';
import { PAYMENT_METHODS } from '@/lib/validation';
import { findZone, type DeliveryModeValue } from '@/lib/delivery';
import { LjRoot, Svg, I, ljInput, ljBtnPrimary, ljCard } from '../ljTheme';

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

const PAYMENT_LABELS: Record<(typeof PAYMENT_METHODS)[number], { label: string; hint: string; icon: string[] }> = {
  PIX: { label: 'Pix', hint: 'QR Code após confirmar', icon: I.cadeado },
  CREDIT: { label: 'Crédito', hint: 'Maquininha na entrega', icon: I.cartao },
  DEBIT: { label: 'Débito', hint: 'Maquininha na entrega', icon: I.cartao },
  CASH: { label: 'Dinheiro', hint: 'Informe o troco', icon: I.dinheiro },
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
  const enderecoOrfao = porBairro && !!address.district && !zona;

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
    try {
      const res = await fetch(`/api/stores/${slug}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: value, subtotal }),
      });
      const data = await res.json().catch(() => ({}));
      setCouponResult(res.ok ? data : { ok: false, message: data.error ?? 'Não foi possível validar o cupom.' });
    } catch {
      setCouponResult({ ok: false, message: 'Falha de conexão. Tente novamente.' });
    } finally {
      setCheckingCoupon(false);
    }
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
    try {
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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error ?? 'Não foi possível enviar o pedido.');
      clear();
      router.push(`/${slug}/pedido/${data.order.id}`);
    } catch {
      setError('Falha de conexão. Verifique sua internet e tente enviar de novo.');
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <LjRoot className="flex items-center justify-center p-4">
        <div className="w-full max-w-md lj-fade text-center">
          <div className={`${ljCard} p-8 flex flex-col items-center gap-2.5`}>
            <span className="w-14 h-14 rounded-full bg-[#F1EEEB] text-[#6B6662] grid place-items-center">
              <Svg d={I.sacola} size={26} sw={1.5} />
            </span>
            <b className="lj-display text-lg">Sua sacola está vazia</b>
            <p className="text-[#5E5A57] text-sm">Adicione itens do cardápio pra continuar.</p>
          </div>
          <Link href={`/${slug}`} className={`${ljBtnPrimary} w-full mt-4`}>
            Ver cardápio
          </Link>
        </div>
      </LjRoot>
    );
  }

  return (
    <LjRoot>
      <main className="max-w-md mx-auto p-4 pb-8 space-y-4 lj-fade">
        <div className="flex items-center gap-2">
          <Link href={`/${slug}`} aria-label="Voltar ao cardápio" className="w-9 h-9 rounded-full bg-white border border-[#ECE7E2] grid place-items-center text-[#1D1B1A]">
            <Svg d={I.voltar} size={16} />
          </Link>
          <h2 className="lj-display text-lg font-extrabold">Seu pedido</h2>
        </div>

        {toMin > 0 && (
          <div className={`${ljCard} p-3 text-sm`}>
            <b>Faltam {formatBRL(toMin)}</b> para o pedido mínimo de {formatBRL(minOrder)}.
          </div>
        )}

        <div className={`${ljCard} p-4`}>
          <h4 className="font-semibold text-sm mb-2">Itens</h4>
          {items.map(({ product, qty }) => (
            <div key={product.id} className="flex items-center justify-between py-2 border-b border-[#F0ECE8] last:border-0">
              <div>
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-xs text-[#5E5A57] lj-mono">{qty} × {formatBRL(unitPrice(product))}</p>
              </div>
              <div className="flex items-center gap-0.5 border border-[#E4DFDA] rounded-[10px] h-9">
                <button onClick={() => dec(product.id)} className="w-[34px] h-[34px] grid place-items-center text-[#C4101D]" aria-label="Remover um">
                  <Svg d={I.menos} size={15} sw={2.4} />
                </button>
                <span className="lj-mono w-5 text-center text-sm font-semibold">{qty}</span>
                <button onClick={() => inc(product.id)} className="w-[34px] h-[34px] grid place-items-center text-[#C4101D]" aria-label="Adicionar um">
                  <Svg d={I.mais} size={15} sw={2.4} />
                </button>
              </div>
            </div>
          ))}
          <Link href={`/${slug}`} className="text-[#C4101D] text-sm font-semibold block mt-2">+ Adicionar mais itens</Link>
        </div>

        <div className={`${ljCard} p-4`}>
          <h4 className="font-semibold text-sm mb-2">Cupom de desconto</h4>
          <div className="flex gap-2">
            <input
              className={`${ljInput} lj-mono uppercase`}
              placeholder="Digite o cupom"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
            />
            <button onClick={() => applyCoupon()} disabled={checkingCoupon} className={`${ljBtnPrimary} shrink-0 h-12 px-5`}>
              {checkingCoupon ? '…' : 'Aplicar'}
            </button>
          </div>
          {couponResult && (
            <p className={`text-sm mt-2 font-medium ${couponResult.ok ? 'text-[#177245]' : 'text-[#B42318]'}`}>{couponResult.message}</p>
          )}
          {!couponResult && coupons.length > 0 && (
            <p className="text-xs text-[#5E5A57] mt-2">
              Disponíveis:{' '}
              {coupons.map((c, i) => (
                <span key={c.code}>
                  <button onClick={() => applyCoupon(c.code)} className="lj-mono text-[#C4101D] font-semibold">
                    {c.code}
                  </button>
                  {i < coupons.length - 1 ? ' · ' : ''}
                </span>
              ))}
            </p>
          )}
        </div>

        <div className={`${ljCard} p-4`}>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
            <Svg d={I.pin} size={15} className="text-[#5E5A57]" /> Entregar em
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <input className={`${ljInput} col-span-1`} placeholder="CEP" value={address.cep} onChange={(e) => setAddress({ ...address, cep: e.target.value })} />
            <input className={`${ljInput} col-span-1`} placeholder="Número" value={address.number} onChange={(e) => setAddress({ ...address, number: e.target.value })} />
            <input className={`${ljInput} col-span-2`} placeholder="Rua / Avenida" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
            <input className={`${ljInput} col-span-2`} placeholder="Complemento (opcional)" value={address.complement} onChange={(e) => setAddress({ ...address, complement: e.target.value })} />
            {porBairro ? (
              <select
                className={`${ljInput} col-span-1`}
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
              <input className={`${ljInput} col-span-1`} placeholder="Bairro" value={address.district} onChange={(e) => setAddress({ ...address, district: e.target.value })} />
            )}
            <input className={`${ljInput} col-span-1`} placeholder="Cidade" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
            <input className={`${ljInput} col-span-2`} placeholder="Ponto de referência (opcional)" value={address.reference} onChange={(e) => setAddress({ ...address, reference: e.target.value })} />
          </div>
          {enderecoOrfao && (
            <p className="text-xs font-semibold text-[#8A5A00] bg-[#FFF4D6] rounded-lg px-3 py-2 mt-2">
              O bairro salvo no seu endereço não é mais atendido pela loja — escolha outro na lista acima.
            </p>
          )}
        </div>

        <div className={`${ljCard} p-4`}>
          <h4 className="font-semibold text-sm mb-2">Forma de pagamento</h4>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`text-left p-3 rounded-xl border flex items-start gap-2 transition-colors ${paymentMethod === m ? 'border-[#D0101F] bg-[#FEECEB]' : 'border-[#E4DFDA] hover:border-[#C9C1B9]'}`}
              >
                <Svg d={PAYMENT_LABELS[m].icon} size={16} className="mt-0.5 text-[#5E5A57] shrink-0" />
                <span>
                  <b className="block text-sm">{PAYMENT_LABELS[m].label}</b>
                  <span className="text-xs text-[#5E5A57]">{PAYMENT_LABELS[m].hint}</span>
                </span>
              </button>
            ))}
          </div>
          {paymentMethod === 'CASH' && (
            <label className="block mt-3">
              <span className="block text-sm font-medium text-[#1D1B1A] mb-1">Troco para quanto?</span>
              <input
                className={ljInput}
                inputMode="decimal"
                placeholder="Ex.: 100 (deixe vazio se não precisar)"
                value={changeFor}
                onChange={(e) => setChangeFor(e.target.value)}
              />
            </label>
          )}
        </div>

        <div className={`${ljCard} p-4`}>
          <h4 className="font-semibold text-sm mb-2">Observações</h4>
          <textarea
            className={`${ljInput} h-auto py-2.5`}
            rows={2}
            placeholder="Ex.: interfone quebrado, ligar ao chegar"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className={`${ljCard} p-4`}>
          <div className="flex justify-between text-sm py-1 text-[#5E5A57]">
            <span>Subtotal</span>
            <span className="lj-mono">{formatBRL(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm py-1 text-[#177245]">
              <span>Cupom {couponResult?.code}</span>
              <span className="lj-mono">−{formatBRL(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm py-1 text-[#5E5A57]">
            <span>Taxa de entrega{porBairro && zona ? ` · ${zona.name}` : ''}</span>
            <span className="lj-mono">{porBairro && !zona ? 'escolha o bairro' : deliveryFee > 0 ? formatBRL(deliveryFee) : 'Grátis'}</span>
          </div>
          <div className="flex justify-between font-bold py-1 border-t border-dashed border-[#E4DFDA] mt-1 pt-2">
            <span>Total</span>
            <span className="lj-mono">{formatBRL(total)}</span>
          </div>
        </div>

        {!isOpen && <p className="text-sm text-[#B42318] font-semibold">A loja está fechada agora.</p>}
        {error && <p role="alert" className="text-sm text-[#B42318] font-semibold">{error}</p>}

        <button
          onClick={placeOrder}
          disabled={placing || toMin > 0 || !isOpen || (porBairro && !zona)}
          className={`${ljBtnPrimary} w-full`}
        >
          {placing ? 'Enviando pedido…' : `Enviar pedido · ${formatBRL(total)}`}
        </button>
        <p className="text-center text-xs text-[#5E5A57]">O pedido vai direto para o WhatsApp da loja.</p>
      </main>
    </LjRoot>
  );
}
