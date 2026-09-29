'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { OrderStatus } from '@prisma/client';
import { formatBRL } from '@/lib/format';
import { nextStatus, canCancel } from '@/lib/order-status';
import { Icon, I } from './pp-icons';

const FLUXO: Exclude<OrderStatus, 'CANCELLED'>[] = ['RECEIVED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const MINUTOS_ATRASO = 20;

const COLUNAS: Record<Exclude<OrderStatus, 'CANCELLED'>, { label: string; dot: string; badge: string; acao: string | null }> = {
  RECEIVED: { label: 'Novos', dot: 'bg-[#B54708]', badge: 'bg-[#FEF0E6] text-[#B54708]', acao: 'Aceitar e preparar' },
  PREPARING: { label: 'Em preparo', dot: 'bg-[#1D4ED8]', badge: 'bg-[#EAF1FF] text-[#1D4ED8]', acao: 'Saiu para entrega' },
  OUT_FOR_DELIVERY: { label: 'Saiu p/ entrega', dot: 'bg-[#6B3FD4]', badge: 'bg-[#F1ECFF] text-[#6B3FD4]', acao: 'Marcar entregue' },
  DELIVERED: { label: 'Entregues hoje', dot: 'bg-[#177245]', badge: 'bg-[#E7F6EE] text-[#177245]', acao: null },
};

const tempo = (m: number) => (m < 60 ? `há ${m} min` : `há ${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, '0') : ''}`);

export type PedidoCard = {
  id: string;
  number: number;
  status: OrderStatus;
  paymentMethod: 'PIX' | 'CREDIT' | 'DEBIT' | 'CASH';
  minutos: number;
  customerName: string;
  itemsSummary: string;
  addressLine: string;
  total: number;
  paid: boolean;
  paymentLabel: string;
  waLink: string;
};

export type Stats = {
  pedidosHoje: number;
  faturamento: number;
  ticketMedio: number;
  emAndamento: number;
  atrasados: number;
  cancelados: number;
};

const btnGhost =
  'h-10 px-3.5 rounded-[10px] border border-[#E4DFDA] bg-white text-sm font-medium text-[#1D1B1A] flex items-center gap-2 hover:bg-[#F1EEEB] transition-colors';

export default function PedidosBoard({ slug, pedidos, stats }: { slug: string; pedidos: PedidoCard[]; stats: Stats }) {
  const router = useRouter();
  const [confirmarId, setConfirmarId] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [erro, setErro] = useState('');

  async function mudarStatus(id: string, status: OrderStatus) {
    setConfirmarId(null);
    setBusyId(id);
    setErro('');
    try {
      const res = await fetch(`/api/store/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) router.refresh();
      else setErro('Não foi possível atualizar o pedido. Tente de novo.');
    } catch {
      setErro('Falha de conexão. Tente novamente.');
    } finally {
      setBusyId(null);
    }
  }

  async function marcarPixPago(id: string) {
    setBusyId(id);
    setErro('');
    try {
      const res = await fetch(`/api/store/orders/${id}/pix-paid`, { method: 'PATCH' });
      if (res.ok) router.refresh();
      else setErro('Não foi possível confirmar o Pix. Tente de novo.');
    } catch {
      setErro('Falha de conexão. Tente novamente.');
    } finally {
      setBusyId(null);
    }
  }

  const q = busca.trim().toLowerCase();
  const visiveis = q ? pedidos.filter((p) => String(p.number).includes(q) || p.customerName.toLowerCase().includes(q)) : pedidos;
  const porColuna = useMemo(
    () => FLUXO.map((st) => ({ st, lista: visiveis.filter((p) => p.status === st) })),
    [visiveis],
  );

  const storeUrl = typeof window !== 'undefined' ? `${window.location.origin}/${slug}` : `/${slug}`;

  return (
    <div className="flex flex-col gap-5">
      <section aria-label="Resumo de hoje" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Pedidos hoje" valor={String(stats.pedidosHoje)} />
        <Kpi label="Faturamento" valor={formatBRL(stats.faturamento)} />
        <Kpi label="Ticket médio" valor={formatBRL(stats.ticketMedio)} />
        <Kpi label="Em andamento" valor={String(stats.emAndamento)}>
          {stats.atrasados > 0 && (
            <span className="text-xs font-semibold text-[#B42318] bg-[#FEECEB] px-2 py-0.5 rounded-full">
              {stats.atrasados === 1 ? '1 atrasado' : `${stats.atrasados} atrasados`}
            </span>
          )}
        </Kpi>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="pp-display text-[22px] font-bold">Pedidos</h1>
        <span className="text-[13px] text-[#5E5A57]">Atualizado agora</span>
        <div className="flex-1" />
        <label className="h-10 w-full sm:w-[280px] px-3 rounded-[10px] border border-[#E4DFDA] bg-white flex items-center gap-2 text-[#6B6662] focus-within:ring-2 focus-within:ring-[#1D4ED8]">
          <Icon d={I.busca} size={16} />
          <span className="sr-only">Buscar pedido</span>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar nº do pedido ou cliente"
            className="flex-1 min-w-0 bg-transparent outline-none text-[#1D1B1A] text-sm"
          />
        </label>
        <span className={btnGhost}>
          Cancelados <span className="pp-mono text-xs text-[#5E5A57]">{stats.cancelados}</span>
        </span>
      </div>

      {erro && (
        <p role="alert" className="text-sm font-semibold text-[#7A1A12] bg-[#FEECEB] rounded-xl px-3.5 py-2.5">
          {erro}
        </p>
      )}

      {pedidos.length === 0 ? (
        <EstadoVazio storeUrl={storeUrl} />
      ) : (
        <section aria-label="Quadro de pedidos" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {porColuna.map(({ st, lista }) => {
            const col = COLUNAS[st];
            return (
              <div key={st} className="bg-[#EFEBE7] rounded-2xl flex flex-col">
                <div className="px-4 pt-3.5 pb-2.5 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-[3px] ${col.dot}`} />
                  <h2 className="text-sm font-bold">{col.label}</h2>
                  <span className={`ml-auto pp-mono text-xs font-semibold px-2 py-0.5 rounded-full ${col.badge}`}>{lista.length}</span>
                </div>
                <div className="px-2.5 pb-3 pt-1 flex flex-col gap-2.5">
                  {lista.length === 0 && (
                    <div className="border-[1.5px] border-dashed border-[#D6CFC8] rounded-xl py-5 text-center text-[13px] text-[#6B6662]">
                      Nenhum pedido aqui
                    </div>
                  )}
                  {lista.map((p) => (
                    <CartaoPedido
                      key={p.id}
                      pedido={p}
                      acao={col.acao}
                      busy={busyId === p.id}
                      confirmando={confirmarId === p.id}
                      onAvancar={() => {
                        const next = nextStatus(p.status);
                        if (next) mudarStatus(p.id, next);
                      }}
                      onPedirCancelar={() => setConfirmarId(p.id)}
                      onConfirmarCancelar={() => mudarStatus(p.id, 'CANCELLED')}
                      onManter={() => setConfirmarId(null)}
                      onMarcarPixPago={() => marcarPixPago(p.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

function Kpi({ label, valor, children }: { label: string; valor: string; children?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[14px] border border-[#ECE7E2] px-5 py-[18px] flex flex-col gap-1.5">
      <span className="text-[13px] text-[#5E5A57]">{label}</span>
      <div className="flex items-baseline gap-2.5 flex-wrap">
        <span className="pp-mono text-[26px] sm:text-[28px] font-semibold">{valor}</span>
        {children}
      </div>
    </div>
  );
}

function CartaoPedido({
  pedido: p,
  acao,
  busy,
  confirmando,
  onAvancar,
  onPedirCancelar,
  onConfirmarCancelar,
  onManter,
  onMarcarPixPago,
}: {
  pedido: PedidoCard;
  acao: string | null;
  busy: boolean;
  confirmando: boolean;
  onAvancar: () => void;
  onPedirCancelar: () => void;
  onConfirmarCancelar: () => void;
  onManter: () => void;
  onMarcarPixPago: () => void;
}) {
  const atrasado = p.status !== 'DELIVERED' && p.minutos > MINUTOS_ATRASO;
  const cancelavel = canCancel(p.status);
  const awaitingPix = p.paymentMethod === 'PIX' && !p.paid;
  return (
    <article
      className={`bg-white rounded-xl p-3.5 flex flex-col gap-2.5 border transition-[box-shadow,transform] duration-150 hover:shadow-[0_6px_18px_rgba(29,27,26,.08)] hover:-translate-y-px ${
        atrasado ? 'border-[#F4B8B2]' : 'border-[#ECE7E2]'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="pp-mono text-sm font-semibold">#{p.number}</span>
        <span className="text-xs text-[#6B6662]">{tempo(p.minutos)}</span>
        {atrasado && <span className="ml-auto text-[11px] font-bold text-[#B42318] bg-[#FEECEB] px-2 py-0.5 rounded-full">Atrasado</span>}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[15px] font-semibold">{p.customerName}</span>
        <span className="text-[13px] text-[#4A4643] leading-snug">{p.itemsSummary}</span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-[#5E5A57]">
        <Icon d={I.pin} size={14} /> {p.addressLine}
      </div>

      <div className="flex items-center gap-2 pt-2.5 border-t border-[#F0ECE8]">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${p.paid ? 'bg-[#E7F6EE] text-[#177245]' : 'bg-[#FFF4D6] text-[#8A5A00]'}`}>
          {p.paymentLabel}
        </span>
        <span className="ml-auto pp-mono text-[15px] font-semibold">{formatBRL(p.total)}</span>
      </div>

      {awaitingPix && !confirmando && (
        <button
          onClick={onMarcarPixPago}
          disabled={busy}
          className="h-9 rounded-[10px] bg-[#E7F6EE] text-[#177245] text-[13px] font-semibold hover:bg-[#d8f0e2] transition-colors disabled:opacity-60"
        >
          Marcar Pix como pago
        </button>
      )}

      {acao && !confirmando && (
        <div className="flex gap-2">
          <button
            onClick={onAvancar}
            disabled={busy}
            className="flex-1 h-10 rounded-[10px] bg-[#D0101F] hover:bg-[#A90D19] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
          >
            {busy ? '…' : acao} {!busy && <Icon d={I.seta} size={15} />}
          </button>
          {cancelavel && (
            <button
              onClick={onPedirCancelar}
              disabled={busy}
              aria-label="Cancelar pedido"
              className="w-10 h-10 rounded-[10px] border border-[#E4DFDA] bg-white text-[#5E5A57] grid place-items-center hover:bg-[#F1EEEB] disabled:opacity-60"
            >
              <Icon d={I.x} size={16} />
            </button>
          )}
          <a
            href={p.waLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ver mensagem do pedido no WhatsApp"
            className="w-10 h-10 rounded-[10px] border border-[#E4DFDA] bg-white text-[#177245] grid place-items-center hover:bg-[#F1EEEB]"
          >
            <Icon d={I.whats} size={16} />
          </a>
        </div>
      )}

      {confirmando && (
        <div className="bg-[#FEECEB] rounded-[10px] p-2.5 flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-[#7A1A12]">Cancelar o pedido #{p.number}?</span>
          <div className="flex gap-2">
            <button onClick={onConfirmarCancelar} className="flex-1 h-9 rounded-lg bg-[#B42318] text-white text-[13px] font-semibold">
              Sim, cancelar
            </button>
            <button onClick={onManter} className="flex-1 h-9 rounded-lg border border-[#E8C4C0] bg-white text-[13px] font-semibold">
              Manter
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function EstadoVazio({ storeUrl }: { storeUrl: string }) {
  async function copiar() {
    await navigator.clipboard.writeText(storeUrl);
  }
  const shareLink = `https://wa.me/?text=${encodeURIComponent(`Confira o cardápio da minha loja: ${storeUrl}`)}`;

  return (
    <section className="bg-white border border-[#ECE7E2] rounded-2xl flex flex-col items-center justify-center gap-3.5 text-center p-10 sm:p-16">
      <div className="w-[72px] h-[72px] rounded-[20px] bg-[#FEECEB] text-[#D0101F] grid place-items-center">
        <Icon d={I.pedidos} size={34} />
      </div>
      <h2 className="pp-display text-2xl font-bold">Nenhum pedido ainda hoje</h2>
      <p className="max-w-[420px] text-[15px] leading-relaxed text-[#5E5A57]">
        Quando um cliente fizer um pedido, ele aparece aqui na hora. Divulgue o link da sua
        loja pra receber os primeiros.
      </p>
      <div className="flex flex-wrap justify-center gap-2.5 mt-1.5">
        <a
          href={shareLink}
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 px-[18px] rounded-[10px] bg-[#D0101F] hover:bg-[#A90D19] text-white text-sm font-semibold flex items-center"
        >
          Compartilhar no WhatsApp
        </a>
        <button onClick={copiar} className={`${btnGhost} h-11 font-semibold`}>
          Copiar link da loja
        </button>
      </div>
    </section>
  );
}
