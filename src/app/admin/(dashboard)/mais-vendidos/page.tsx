import Link from 'next/link';
import { requireMerchantSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatBRL } from '@/lib/format';
import { Icon, I } from '../pp-icons';
import { PageHeader, Stat, card } from '../ui';

// Relatório de vendas: faturamento por dia, ranking de produtos e formas de pagamento.
// Datas agrupadas no fuso de São Paulo (antes usava UTC e um pedido das 22h caía no dia seguinte).

const TZ = 'America/Sao_Paulo';
const PERIODOS = [7, 15, 30] as const;
type Periodo = (typeof PERIODOS)[number];

const DIA_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const PAGAMENTO: Record<string, { label: string; icon: string[] }> = {
  PIX: { label: 'Pix', icon: I.pix },
  CREDIT: { label: 'Crédito', icon: I.cartao },
  DEBIT: { label: 'Débito', icon: I.cartao },
  CASH: { label: 'Dinheiro', icon: I.dinheiro },
};

/** "2026-09-29" no fuso de São Paulo. */
function diaSP(d: Date) {
  return d.toLocaleDateString('en-CA', { timeZone: TZ });
}

function variacao(atual: number, anterior: number) {
  if (anterior === 0) return atual > 0 ? null : 0;
  return ((atual - anterior) / anterior) * 100;
}

function Delta({ atual, anterior }: { atual: number; anterior: number }) {
  const v = variacao(atual, anterior);
  if (v === null) return <span className="text-xs font-semibold text-[#177245] bg-[#E7F6EE] px-2 py-0.5 rounded-full">novo</span>;
  if (Math.abs(v) < 0.5) return <span className="text-xs font-semibold text-[#5E5A57]">= período anterior</span>;
  const sobe = v > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
        sobe ? 'text-[#177245] bg-[#E7F6EE]' : 'text-[#B42318] bg-[#FEECEB]'
      }`}
      title="Comparado ao período anterior de mesmo tamanho"
    >
      <Icon d={sobe ? I.sobe : I.desce} size={12} />
      {Math.abs(v).toFixed(0)}%
    </span>
  );
}

export default async function MaisVendidosPage({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  const session = await requireMerchantSession();
  const sp = await searchParams;
  const dias: Periodo = (PERIODOS as readonly number[]).includes(Number(sp.dias)) ? (Number(sp.dias) as Periodo) : 7;

  // Dias do período (hoje incluído) e do período anterior, como chaves de data em SP.
  const hoje = new Date();
  const chaves = Array.from({ length: dias * 2 }, (_, i) => {
    const d = new Date(hoje.getTime() - (dias * 2 - 1 - i) * 86_400_000);
    return { key: diaSP(d), date: d };
  });
  const anteriores = new Set(chaves.slice(0, dias).map((c) => c.key));
  const atuais = chaves.slice(dias);
  const desde = new Date(hoje.getTime() - (dias * 2 + 1) * 86_400_000);

  const [pedidos, store] = await Promise.all([
    prisma.order.findMany({
      where: { storeId: session.storeId, createdAt: { gte: desde }, status: { not: 'CANCELLED' } },
      select: {
        total: true,
        createdAt: true,
        paymentMethod: true,
        items: { select: { productId: true, name: true, qty: true, price: true } },
      },
    }),
    prisma.store.findUnique({ where: { id: session.storeId }, select: { slug: true } }),
  ]);

  const porDia = new Map<string, { receita: number; pedidos: number }>();
  let receitaAnt = 0;
  let pedidosAnt = 0;
  const produtos = new Map<string, { nome: string; qtd: number; receita: number }>();
  const pagamentos = new Map<string, { pedidos: number; receita: number }>();

  for (const p of pedidos) {
    const k = diaSP(p.createdAt);
    const total = Number(p.total);
    if (anteriores.has(k)) {
      receitaAnt += total;
      pedidosAnt += 1;
      continue;
    }
    if (!atuais.some((a) => a.key === k)) continue;

    const dia = porDia.get(k) ?? { receita: 0, pedidos: 0 };
    dia.receita += total;
    dia.pedidos += 1;
    porDia.set(k, dia);

    const pg = pagamentos.get(p.paymentMethod) ?? { pedidos: 0, receita: 0 };
    pg.pedidos += 1;
    pg.receita += total;
    pagamentos.set(p.paymentMethod, pg);

    for (const it of p.items) {
      const pr = produtos.get(it.productId) ?? { nome: it.name, qtd: 0, receita: 0 };
      pr.qtd += it.qty;
      pr.receita += it.qty * Number(it.price);
      produtos.set(it.productId, pr);
    }
  }

  const serie = atuais.map(({ key, date }) => {
    const d = porDia.get(key);
    const [, m, dd] = key.split('-');
    const wd = new Date(date.toLocaleString('en-US', { timeZone: TZ })).getDay();
    return { key, receita: d?.receita ?? 0, pedidos: d?.pedidos ?? 0, curto: DIA_SEMANA[wd], data: `${dd}/${m}` };
  });

  const receita = serie.reduce((s, d) => s + d.receita, 0);
  const qtdPedidos = serie.reduce((s, d) => s + d.pedidos, 0);
  const ticket = qtdPedidos ? receita / qtdPedidos : 0;
  const ticketAnt = pedidosAnt ? receitaAnt / pedidosAnt : 0;
  const melhor = serie.reduce((a, b) => (b.receita > a.receita ? b : a), serie[0]);

  const ranking = [...produtos.values()].sort((a, b) => b.qtd - a.qtd || b.receita - a.receita).slice(0, 10);
  const maxQtd = Math.max(1, ...ranking.map((r) => r.qtd));
  const itensVendidos = [...produtos.values()].reduce((s, r) => s + r.qtd, 0);

  const pags = [...pagamentos.entries()].sort((a, b) => b[1].receita - a[1].receita);

  const semVendas = qtdPedidos === 0;

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader title="Mais vendidos" subtitle="Como sua loja está vendendo — faturamento, produtos campeões e formas de pagamento.">
        <nav aria-label="Período" className="inline-flex p-1 rounded-xl bg-white border border-[#ECE7E2]">
          {PERIODOS.map((p) => (
            <Link
              key={p}
              href={`/admin/mais-vendidos?dias=${p}`}
              aria-current={p === dias ? 'page' : undefined}
              className={`h-9 px-3.5 rounded-lg text-sm font-semibold grid place-items-center transition-colors ${
                p === dias ? 'bg-[#1D1B1A] text-white' : 'text-[#5E5A57] hover:text-[#1D1B1A]'
              }`}
            >
              {p} dias
            </Link>
          ))}
        </nav>
      </PageHeader>

      {/* ---------- Resumo ---------- */}
      <section aria-label="Resumo do período" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Stat label="Faturamento" value={formatBRL(receita)}>
          <Delta atual={receita} anterior={receitaAnt} />
        </Stat>
        <Stat label="Pedidos" value={qtdPedidos}>
          <Delta atual={qtdPedidos} anterior={pedidosAnt} />
        </Stat>
        <Stat label="Ticket médio" value={formatBRL(ticket)}>
          {qtdPedidos > 0 && <Delta atual={ticket} anterior={ticketAnt} />}
        </Stat>
        <Stat label="Itens vendidos" value={itensVendidos} />
      </section>

      {/* ---------- Gráfico ---------- */}
      <section className={`${card} mt-4 p-5 sm:p-6`}>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="pp-display text-[17px] font-bold">Faturamento por dia</h2>
          {!semVendas && melhor.receita > 0 && (
            <p className="text-sm text-[#5E5A57]">
              Melhor dia: <b className="text-[#1D1B1A]">{melhor.curto} {melhor.data}</b> ·{' '}
              <span className="pp-mono">{formatBRL(melhor.receita)}</span>
            </p>
          )}
        </div>
        <BarChart serie={serie} destaque={semVendas ? null : melhor.key} vazio={semVendas} />
        {semVendas && (
          <p className="mt-2 text-center text-sm text-[#5E5A57]">
            Nenhum pedido nos últimos {dias} dias.{' '}
            {store && (
              <a href={`/${store.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#C4101D] hover:underline">
                Divulgue o link da sua loja
              </a>
            )}{' '}
            para receber os primeiros.
          </p>
        )}
      </section>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4 mt-4 items-start">
        {/* ---------- Ranking ---------- */}
        <section className={`${card} p-5 sm:p-6`}>
          <div className="flex items-center gap-2">
            <Icon d={I.trofeu} size={18} className="text-[#8A5A00]" />
            <h2 className="pp-display text-[17px] font-bold">Produtos campeões</h2>
            <span className="ml-auto text-xs text-[#6B6662]">últimos {dias} dias</span>
          </div>

          {ranking.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-[#5E5A57]">Quando os pedidos chegarem, os produtos que mais vendem aparecem aqui.</p>
              <Link href="/admin/produtos" className="inline-block mt-3 text-sm font-semibold text-[#C4101D] hover:underline">
                Revisar meu cardápio →
              </Link>
            </div>
          ) : (
            <ol className="mt-4 flex flex-col gap-3.5">
              {ranking.map((r, i) => (
                <li key={r.nome + i} className="flex items-center gap-3">
                  <span
                    className={`pp-mono w-7 h-7 shrink-0 rounded-lg grid place-items-center text-xs font-semibold ${
                      i === 0 ? 'bg-[#FFF4D6] text-[#8A5A00]' : 'bg-[#F1EEEB] text-[#5E5A57]'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3">
                      <span className="text-sm font-semibold truncate">{r.nome}</span>
                      <span className="ml-auto pp-mono text-xs text-[#5E5A57] shrink-0">{formatBRL(r.receita)}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-[#F1EEEB] overflow-hidden">
                        <div className="h-full rounded-full bg-[#3B6FE0]" style={{ width: `${(r.qtd / maxQtd) * 100}%` }} />
                      </div>
                      <span className="pp-mono text-xs font-semibold text-[#1D1B1A] w-14 text-right shrink-0">{r.qtd} un.</span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* ---------- Pagamentos ---------- */}
        <section className={`${card} p-5 sm:p-6`}>
          <h2 className="pp-display text-[17px] font-bold">Formas de pagamento</h2>
          {pags.length === 0 ? (
            <p className="text-sm text-[#5E5A57] mt-4">Sem pagamentos no período.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-4">
              {pags.map(([metodo, v]) => {
                const info = PAGAMENTO[metodo] ?? { label: metodo, icon: I.dinheiro };
                const pct = receita ? (v.receita / receita) * 100 : 0;
                return (
                  <li key={metodo}>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-8 h-8 rounded-lg bg-[#F1EEEB] grid place-items-center text-[#1D1B1A]">
                        <Icon d={info.icon} size={15} />
                      </span>
                      <span className="font-semibold">{info.label}</span>
                      <span className="text-xs text-[#6B6662]">{v.pedidos} {v.pedidos === 1 ? 'pedido' : 'pedidos'}</span>
                      <span className="ml-auto pp-mono font-semibold">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-[#F1EEEB] overflow-hidden">
                      <div className="h-full rounded-full bg-[#1D1B1A]" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Gráfico de barras em SVG puro (sem biblioteca)                      */
/* ------------------------------------------------------------------ */

type Ponto = { key: string; receita: number; pedidos: number; curto: string; data: string };

function escala(max: number) {
  // Arredonda o topo do eixo para um número "redondo" e divide em 4 faixas.
  if (max <= 0) return { topo: 100, passos: [0, 25, 50, 75, 100] };
  const bruto = max / 4;
  const mag = 10 ** Math.floor(Math.log10(bruto));
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((p) => p >= bruto) ?? bruto;
  const topo = passo * 4;
  return { topo, passos: [0, 1, 2, 3, 4].map((i) => i * passo) };
}

function BarChart({ serie, destaque, vazio }: { serie: Ponto[]; destaque: string | null; vazio: boolean }) {
  const W = 760;
  const H = 240;
  const esq = 56;
  const base = 196;
  const topoY = 16;
  const altura = base - topoY;
  const { topo, passos } = escala(Math.max(...serie.map((s) => s.receita)));
  const larg = (W - esq - 8) / serie.length;
  const barra = Math.min(40, larg * 0.62);
  const mostrarRotulo = (i: number) => serie.length <= 15 || i % 3 === serie.length % 3 || i === serie.length - 1;

  return (
    <div className="mt-4 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[520px] h-auto" role="img" aria-label="Faturamento por dia">
        {passos.map((v) => {
          const y = base - (v / topo) * altura;
          return (
            <g key={v}>
              <line x1={esq} x2={W - 4} y1={y} y2={y} stroke={v === 0 ? '#D6CFC8' : '#EFEBE7'} strokeWidth={1} />
              <text x={esq - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#6B6662" className="pp-mono">
                {vazio && v > 0 ? '' : v >= 1000 ? `${(v / 1000).toLocaleString('pt-BR')} mil` : v.toLocaleString('pt-BR')}
              </text>
            </g>
          );
        })}

        {serie.map((d, i) => {
          const h = d.receita > 0 ? Math.max(4, (d.receita / topo) * altura) : 0;
          const cx = esq + larg * i + larg / 2;
          const x = cx - barra / 2;
          const y = base - h;
          const on = d.key === destaque;
          return (
            <g key={d.key} className="group">
              <title>{`${d.curto} ${d.data}: ${d.receita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} · ${d.pedidos} ${d.pedidos === 1 ? 'pedido' : 'pedidos'}`}</title>
              {/* área de toque maior que a barra */}
              <rect x={esq + larg * i} y={topoY} width={larg} height={altura} fill="transparent" />
              <rect x={esq + larg * i + 2} y={topoY} width={larg - 4} height={altura} rx={6} className="fill-transparent group-hover:fill-[#F6F4F2]" />
              {h > 0 && (
                <path
                  d={`M${x},${base} V${y + 4} a4,4 0 0 1 4,-4 H${x + barra - 4} a4,4 0 0 1 4,4 V${base} Z`}
                  fill={on ? '#1E4FC4' : '#8FB0F0'}
                  className="group-hover:fill-[#1E4FC4] transition-colors"
                />
              )}
              {on && h > 0 && (
                <text x={cx} y={y - 7} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1D1B1A" className="pp-mono">
                  {d.receita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </text>
              )}
              {mostrarRotulo(i) && (
                <>
                  <text x={cx} y={base + 17} textAnchor="middle" fontSize="11" fontWeight={on ? 700 : 500} fill={on ? '#1D1B1A' : '#5E5A57'}>
                    {serie.length <= 7 ? d.curto : d.data}
                  </text>
                  {serie.length <= 7 && (
                    <text x={cx} y={base + 31} textAnchor="middle" fontSize="10" fill="#6B6662" className="pp-mono">
                      {d.data}
                    </text>
                  )}
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Mesma informação em tabela, para leitores de tela */}
      <table className="sr-only">
        <caption>Faturamento por dia</caption>
        <thead>
          <tr>
            <th>Dia</th>
            <th>Faturamento</th>
            <th>Pedidos</th>
          </tr>
        </thead>
        <tbody>
          {serie.map((d) => (
            <tr key={d.key}>
              <td>{d.curto} {d.data}</td>
              <td>{d.receita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              <td>{d.pedidos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
