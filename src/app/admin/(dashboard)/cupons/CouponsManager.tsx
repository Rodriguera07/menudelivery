'use client';

import { useMemo, useState } from 'react';
import { formatBRL, parseBRL } from '@/lib/format';
import { COUPON_TYPES } from '@/lib/validation';
import { Icon, I } from '../pp-icons';
import { PageHeader, Stat, card, input, label, hint, btnPrimary, btnIcon } from '../ui';
import { Switch, useToast, ConfirmButton, useCopy } from '../ui-client';

type CouponType = (typeof COUPON_TYPES)[number];

type Coupon = {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrder: number;
  active: boolean;
  uses: number;
};

const TIPOS: Record<CouponType, { titulo: string; sub: string; icon: string[] }> = {
  PERCENT: { titulo: '% de desconto', sub: 'Ex.: 10% off', icon: I.porcento },
  FIXED: { titulo: 'Valor fixo', sub: 'Ex.: R$ 5 off', icon: I.dinheiro },
  FREE_DELIVERY: { titulo: 'Entrega grátis', sub: 'Zera a taxa', icon: I.moto },
};

const SUGESTOES = ['BEMVINDO10', 'SEXTOU15', 'PRIMEIRACOMPRA', 'FRETEGRATIS', 'VOLTEI5', 'FDS10'];

function oQueDa(type: CouponType, value: number) {
  if (type === 'PERCENT') return `${value.toLocaleString('pt-BR')}% OFF`;
  if (type === 'FIXED') return `${formatBRL(value)} OFF`;
  return 'Entrega grátis';
}

function regra(minOrder: number) {
  return minOrder > 0 ? `em pedidos a partir de ${formatBRL(minOrder)}` : 'em qualquer pedido';
}

const limpaCodigo = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 30);

export default function CouponsManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [form, setForm] = useState({ code: '', type: 'PERCENT' as CouponType, value: '', minOrder: '' });
  const [tentou, setTentou] = useState(false);
  const [erroServidor, setErroServidor] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { copy, copied } = useCopy();

  const valor = form.type === 'FREE_DELIVERY' ? 0 : form.value.trim() ? parseBRL(form.value) : NaN;
  const minimo = form.minOrder.trim() ? parseBRL(form.minOrder) : 0;
  const codigoExiste = coupons.some((c) => c.code === form.code);

  const erros = {
    code: form.code.length < 2 ? 'Use pelo menos 2 letras ou números.' : codigoExiste ? 'Você já tem um cupom com esse código.' : '',
    value:
      form.type === 'FREE_DELIVERY'
        ? ''
        : !(valor > 0)
          ? 'Informe o valor do desconto.'
          : form.type === 'PERCENT' && valor > 100
            ? 'O desconto em % vai até 100.'
            : '',
    minOrder: Number.isNaN(minimo) || minimo < 0 ? 'Valor mínimo inválido.' : '',
  };
  const valido = !Object.values(erros).some(Boolean);

  const ativos = coupons.filter((c) => c.active).length;
  const usos = coupons.reduce((s, c) => s + c.uses, 0);
  const ordenados = useMemo(() => [...coupons].sort((a, b) => Number(b.active) - Number(a.active) || b.uses - a.uses), [coupons]);

  async function addCoupon(e: React.FormEvent) {
    e.preventDefault();
    setTentou(true);
    setErroServidor('');
    if (!valido) return;
    setLoading(true);
    try {
      const res = await fetch('/api/store/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: form.code, type: form.type, value: form.type === 'FREE_DELIVERY' ? 0 : valor, minOrder: minimo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setErroServidor(data.error ?? 'Não foi possível criar o cupom.');
      setCoupons((prev) => [{ ...data.coupon, value: Number(data.coupon.value), minOrder: Number(data.coupon.minOrder) }, ...prev]);
      setForm({ code: '', type: form.type, value: '', minOrder: '' });
      setTentou(false);
      toast.show(`Cupom ${data.coupon.code} criado`);
    } catch {
      setErroServidor('Falha de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(c: Coupon, next: boolean) {
    setCoupons((prev) => prev.map((x) => (x.id === c.id ? { ...x, active: next } : x)));
    try {
      const res = await fetch(`/api/store/coupons/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: next }),
      });
      if (!res.ok) throw new Error();
      toast.show(next ? `${c.code} ativado` : `${c.code} desativado — não vale mais no carrinho`);
    } catch {
      setCoupons((prev) => prev.map((x) => (x.id === c.id ? { ...x, active: !next } : x)));
      toast.show('Não foi possível alterar o cupom.', 'erro');
    }
  }

  async function removeCoupon(c: Coupon) {
    try {
      const res = await fetch(`/api/store/coupons/${c.id}`, { method: 'DELETE' });
      if (!res.ok) return toast.show('Não foi possível remover o cupom.', 'erro');
      setCoupons((prev) => prev.filter((x) => x.id !== c.id));
      toast.show(`Cupom ${c.code} removido`);
    } catch {
      toast.show('Falha de conexão. Tente novamente.', 'erro');
    }
  }

  const err = (k: keyof typeof erros) => tentou && erros[k];
  const sugestao = SUGESTOES.find((s) => !coupons.some((c) => c.code === s));

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader title="Cupons" subtitle="Crie códigos de desconto para o cliente digitar no carrinho." />

      <div className="grid lg:grid-cols-[400px_minmax(0,1fr)] gap-5 items-start">
        {/* ---------- Criar ---------- */}
        <form onSubmit={addCoupon} noValidate className={`${card} p-5 sm:p-6 flex flex-col gap-5 lg:sticky lg:top-4`}>
          <h2 className="pp-display text-[17px] font-bold">Criar cupom</h2>

          <fieldset>
            <legend className={label}>Tipo de desconto</legend>
            <div className="grid grid-cols-3 gap-2">
              {COUPON_TYPES.map((t) => {
                const on = form.type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setForm({ ...form, type: t })}
                    className={`rounded-xl border-[1.5px] p-3 flex flex-col items-start gap-1.5 text-left transition-colors ${
                      on ? 'border-[#1D1B1A] bg-[#1D1B1A] text-white' : 'border-[#E4DFDA] bg-white hover:border-[#C9C1B9]'
                    }`}
                  >
                    <Icon d={TIPOS[t].icon} size={18} />
                    <span className="text-[13px] font-bold leading-tight">{TIPOS[t].titulo}</span>
                    <span className={`text-[11px] ${on ? 'text-white/70' : 'text-[#6B6662]'}`}>{TIPOS[t].sub}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="cp-code" className={label}>Código</label>
            <input
              id="cp-code"
              className={`${input} pp-mono uppercase tracking-wider ${err('code') || codigoExiste ? 'border-[#E8A39C]' : ''}`}
              placeholder="SEXTOU15"
              autoComplete="off"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: limpaCodigo(e.target.value) })}
            />
            {err('code') || codigoExiste ? (
              <p className="text-xs text-[#B42318] mt-1.5">{erros.code}</p>
            ) : (
              <p className={hint}>
                Só letras e números.{' '}
                {sugestao && !form.code && (
                  <>
                    Sugestão:{' '}
                    <button type="button" className="pp-mono font-semibold text-[#C4101D] hover:underline" onClick={() => setForm({ ...form, code: sugestao })}>
                      {sugestao}
                    </button>
                  </>
                )}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {form.type !== 'FREE_DELIVERY' && (
              <div>
                <label htmlFor="cp-valor" className={label}>Desconto</label>
                <div className={`${input} flex items-center gap-1.5 px-3 ${err('value') ? 'border-[#E8A39C]' : ''}`}>
                  {form.type === 'FIXED' && <span className="text-sm text-[#6B6662]">R$</span>}
                  <input
                    id="cp-valor"
                    inputMode="decimal"
                    className="w-full bg-transparent outline-none pp-mono"
                    placeholder={form.type === 'PERCENT' ? '15' : '10,00'}
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                  />
                  {form.type === 'PERCENT' && <span className="text-sm text-[#6B6662]">%</span>}
                </div>
                {err('value') && <p className="text-xs text-[#B42318] mt-1.5">{erros.value}</p>}
              </div>
            )}
            <div className={form.type === 'FREE_DELIVERY' ? 'col-span-2' : ''}>
              <label htmlFor="cp-min" className={label}>
                Pedido mínimo <span className="font-normal text-[#6B6662]">(opcional)</span>
              </label>
              <div className={`${input} flex items-center gap-1.5 px-3`}>
                <span className="text-sm text-[#6B6662]">R$</span>
                <input
                  id="cp-min"
                  inputMode="decimal"
                  className="w-full bg-transparent outline-none pp-mono"
                  placeholder="0,00"
                  value={form.minOrder}
                  onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                />
              </div>
              {err('minOrder') && <p className="text-xs text-[#B42318] mt-1.5">{erros.minOrder}</p>}
            </div>
          </div>

          {/* Prévia ao vivo */}
          <div>
            <p className="text-xs font-semibold text-[#6B6662] mb-2">Prévia</p>
            <Ticket
              code={form.code || 'SEUCUPOM'}
              titulo={form.type === 'FREE_DELIVERY' ? oQueDa('FREE_DELIVERY', 0) : valor > 0 ? oQueDa(form.type, valor) : form.type === 'PERCENT' ? '__% OFF' : 'R$ __ OFF'}
              detalhe={regra(minimo > 0 ? minimo : 0)}
              apagado={!form.code}
            />
          </div>

          {erroServidor && <p role="alert" className="text-sm text-[#7A1A12] bg-[#FEECEB] rounded-xl px-3.5 py-2.5">{erroServidor}</p>}

          <button disabled={loading} className={btnPrimary}>
            {loading ? 'Criando…' : (
              <>
                <Icon d={I.mais} size={16} /> Criar cupom
              </>
            )}
          </button>
        </form>

        {/* ---------- Lista ---------- */}
        <div className="flex flex-col gap-4 min-w-0">
          <section aria-label="Resumo" className="grid grid-cols-3 gap-3">
            <Stat label="Cupons" value={coupons.length} />
            <Stat label="Ativos" value={ativos} />
            <Stat label="Usos no total" value={usos} />
          </section>

          {coupons.length === 0 ? (
            <div className={`${card} p-6 sm:p-8`}>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#FEECEB] text-[#D0101F] grid place-items-center shrink-0">
                  <Icon d={I.cupom} size={20} />
                </div>
                <div>
                  <h2 className="pp-display text-lg font-bold">Nenhum cupom ainda</h2>
                  <p className="text-sm text-[#5E5A57] mt-1">Cupom é uma forma simples de trazer cliente de volta. Algumas ideias para começar:</p>
                </div>
              </div>
              <ul className="mt-5 grid sm:grid-cols-3 gap-3">
                {(
                  [
                    ['BEMVINDO10', 'PERCENT', '10', '', '10% na primeira compra'],
                    ['FRETEGRATIS', 'FREE_DELIVERY', '', '40,00', 'Frete grátis acima de R$ 40'],
                    ['VOLTEI5', 'FIXED', '5,00', '30,00', 'R$ 5 para quem volta'],
                  ] as const
                ).map(([code, type, value, minOrder, texto]) => (
                  <li key={code}>
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ code, type, value, minOrder });
                        document.getElementById('cp-code')?.focus();
                      }}
                      className="w-full h-full text-left rounded-xl border border-dashed border-[#D6CFC8] p-4 hover:border-[#1D1B1A] hover:bg-[#FBFAF8] transition-colors"
                    >
                      <span className="pp-mono text-sm font-semibold">{code}</span>
                      <span className="block text-[13px] text-[#5E5A57] mt-1">{texto}</span>
                      <span className="block text-xs font-semibold text-[#C4101D] mt-2">Usar este modelo →</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul className="grid sm:grid-cols-2 gap-3">
              {ordenados.map((c) => (
                <li key={c.id}>
                  <Ticket
                    code={c.code}
                    titulo={oQueDa(c.type, c.value)}
                    detalhe={regra(c.minOrder)}
                    apagado={!c.active}
                    rodape={
                      <>
                        <span className="pp-mono text-xs text-[#5E5A57]">
                          {c.uses} {c.uses === 1 ? 'uso' : 'usos'}
                        </span>
                        <div className="ml-auto flex items-center gap-1">
                          <button
                            type="button"
                            className={btnIcon}
                            onClick={async () => {
                              if (await copy(c.code)) toast.show(`${c.code} copiado`);
                            }}
                            aria-label={`Copiar código ${c.code}`}
                            title="Copiar código"
                          >
                            <Icon d={copied === c.code ? I.check : I.copiar} size={15} />
                          </button>
                          <ConfirmButton compact label={`Remover cupom ${c.code}`} question="Remover?" onConfirm={() => removeCoupon(c)} />
                          <span className="w-px h-5 bg-[#ECE7E2] mx-1" />
                          <Switch checked={c.active} label={c.active ? `Desativar ${c.code}` : `Ativar ${c.code}`} onChange={(v) => toggleActive(c, v)} size="sm" />
                        </div>
                      </>
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {toast.node}
    </div>
  );
}

/** Cupom desenhado como um tíquete destacável. */
function Ticket({
  code,
  titulo,
  detalhe,
  apagado,
  rodape,
}: {
  code: string;
  titulo: string;
  detalhe: string;
  apagado?: boolean;
  rodape?: React.ReactNode;
}) {
  return (
    <div className={`relative rounded-2xl bg-white border border-[#ECE7E2] overflow-hidden transition-opacity ${apagado ? 'opacity-60' : ''}`}>
      <div className={`px-4 pt-4 pb-3.5 ${apagado ? 'bg-[#F1EEEB]' : 'bg-[#FEECEB]'}`}>
        <div className="flex items-center gap-2">
          <span className={`pp-display text-xl font-bold leading-tight ${apagado ? 'text-[#5E5A57]' : 'text-[#C4101D]'}`}>{titulo}</span>
          {apagado && rodape && <span className="ml-auto text-[11px] font-bold text-[#5E5A57] bg-white px-2 py-0.5 rounded-full">Desativado</span>}
        </div>
        <p className="text-[13px] text-[#5E5A57] mt-0.5">{detalhe}</p>
      </div>
      {/* picote */}
      <div className="relative h-0 border-t-2 border-dashed border-[#E4DFDA]">
        <span className="absolute -left-2.5 -top-2.5 w-5 h-5 rounded-full bg-[#F6F4F2] border border-[#ECE7E2]" />
        <span className="absolute -right-2.5 -top-2.5 w-5 h-5 rounded-full bg-[#F6F4F2] border border-[#ECE7E2]" />
      </div>
      <div className="px-4 py-3 flex items-center gap-2 min-h-[56px]">
        <span className="pp-mono text-[15px] font-semibold tracking-wider text-[#1D1B1A] truncate">{code}</span>
        {rodape && <div className="flex-1 flex items-center">{rodape}</div>}
      </div>
    </div>
  );
}
