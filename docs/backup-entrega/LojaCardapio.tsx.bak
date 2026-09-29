'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Bricolage_Grotesque, DM_Sans, IBM_Plex_Mono } from 'next/font/google';
import { useCart } from '@/lib/useCart';
import LogoutLink from './LogoutLink';

/* Fontes + estilos base (independe do layout.tsx / globals.css) */
const display = Bricolage_Grotesque({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--f-display' });
const body = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--f-body' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500', '600'], variable: '--f-mono' });

const CSS = `
.lj-root{font-family:var(--f-body),system-ui,sans-serif;color:#1D1B1A;background:#F6F4F2;color-scheme:light}
.lj-root button{font-family:inherit;cursor:pointer}
.lj-root :focus-visible{outline:2px solid #1D4ED8;outline-offset:2px}
.lj-display{font-family:var(--f-display),var(--f-body),sans-serif}
.lj-mono{font-family:var(--f-mono),ui-monospace,monospace;font-variant-numeric:tabular-nums}
.lj-cover{background-color:#C8101E;background-image:radial-gradient(rgba(255,255,255,.16) 1.2px,transparent 1.3px);background-size:18px 18px}
.lj-clamp{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.lj-noscroll{scrollbar-width:none}.lj-noscroll::-webkit-scrollbar{display:none}
.lj-card{transition:box-shadow .15s ease,border-color .15s ease}
.lj-card:hover{box-shadow:0 8px 24px rgba(29,27,26,.08)}
.lj-add{transition:transform .12s ease}.lj-add:hover{transform:scale(1.06)}
@keyframes lj-up{from{transform:translateY(100%)}to{transform:none}}
.lj-sheet{animation:lj-up .22s ease-out}
@media (prefers-reduced-motion:reduce){.lj-card,.lj-add{transition:none}.lj-sheet{animation:none}}
`;

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

export type Loja = {
  nome: string;
  subtitulo?: string;
  logoUrl?: string;
  capaUrl?: string;
  aberta: boolean;
  tempoEntrega?: string;
  taxaEntregaCentavos: number;
  pedidoMinimoCentavos: number;
};

export type Produto = {
  id: string;
  categoria: string;
  nome: string;
  descricao?: string;
  precoCentavos: number;
  precoOriginalCentavos?: number;
  imagemUrl?: string;
  destaque?: boolean;
};

export type ItemSacola = { produto: Produto; quantidade: number };

/* ------------------------------------------------------------------ */
/* Utilitários                                                         */
/* ------------------------------------------------------------------ */

const brl = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const slug = (s: string) => s.normalize('NFD').replace(/[^\w\s-]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
const iniciais = (s: string) => s.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

type Tipo = 'lanche' | 'porcao' | 'bebida';
const tipoDe = (cat: string): Tipo => {
  const c = slug(cat);
  if (/bebida|suco|refri|drink/.test(c)) return 'bebida';
  if (/porc|petisco|batata/.test(c)) return 'porcao';
  return 'lanche';
};
const TILE: Record<Tipo, string> = {
  lanche: 'bg-[#FDEFE3] text-[#C2410C]',
  porcao: 'bg-[#FFF6D6] text-[#A16207]',
  bebida: 'bg-[#E8F1FF] text-[#1D4ED8]',
};

/* ------------------------------------------------------------------ */
/* Ícones                                                              */
/* ------------------------------------------------------------------ */

const Svg = ({ d, size = 18, sw = 2 }: { d: string[]; size?: number; sw?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d.map((p) => (
      <path key={p} d={p} />
    ))}
  </svg>
);

const I = {
  busca: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z', 'm20 20-3.5-3.5'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 21a8 8 0 0 1 16 0'],
  relogio: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7v5l3 2'],
  moto: ['M6 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M18 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M6 17h2l3-7h4l3 7', 'M14 6h3l1 4'],
  sacola: ['M6 7h12l-1 13H7Z', 'M9 7a3 3 0 0 1 6 0'],
  mais: ['M12 5v14M5 12h14'],
  menos: ['M5 12h14'],
  seta: ['M5 12h14', 'm13 6 6 6-6 6'],
  cadeado: ['M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z', 'M8 11V7a4 4 0 0 1 8 0v4'],
  lanche: ['M4 10a8 6 0 0 1 16 0Z', 'M3 13.5h18', 'M4 17h16a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z'],
  porcao: ['M5.5 10l1.5 11h10l1.5-11Z', 'M8 10V4M11 10V3M14 10V4M17 10V5'],
  bebida: ['M6 5h12l-1.5 16h-9Z', 'M6.5 10h11', 'M13 5l2-3'],
};

function Foto({ produto, size, className = '' }: { produto: Produto; size: number; className?: string }) {
  const tipo = tipoDe(produto.categoria);
  if (produto.imagemUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={produto.imagemUrl} alt="" className={`object-cover ${className}`} />;
  }
  return (
    <div className={`grid place-items-center ${TILE[tipo]} ${className}`}>
      <Svg d={I[tipo]} size={size} sw={1.5} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Página da loja                                                      */
/* ------------------------------------------------------------------ */

export default function LojaCardapio({
  slug: lojaSlug,
  loja,
  produtos,
  customerName,
}: {
  slug: string;
  loja: Loja;
  produtos: Produto[];
  customerName: string | null;
}) {
  const router = useRouter();
  const { cart: sacola, inc, dec, count: qtdCart } = useCart(lojaSlug);
  const [busca, setBusca] = useState('');
  const [aba, setAba] = useState<string>('');
  const [sheetAberto, setSheetAberto] = useState(false);

  const mexer = (id: string, delta: number) => (delta > 0 ? inc(id) : dec(id));

  const categorias = useMemo(() => Array.from(new Set(produtos.map((p) => p.categoria))), [produtos]);
  const destaques = useMemo(() => produtos.filter((p) => p.destaque).slice(0, 3), [produtos]);

  const secoes = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return categorias
      .map((cat) => ({
        cat,
        itens: produtos.filter(
          (p) => p.categoria === cat && (!q || p.nome.toLowerCase().includes(q) || p.descricao?.toLowerCase().includes(q)),
        ),
      }))
      .filter((s) => s.itens.length > 0);
  }, [categorias, produtos, busca]);

  const itens: ItemSacola[] = produtos.filter((p) => sacola[p.id]).map((p) => ({ produto: p, quantidade: sacola[p.id] }));
  const qtd = qtdCart;
  const subtotal = itens.reduce((s, i) => s + i.quantidade * i.produto.precoCentavos, 0);
  const vazia = qtd === 0;
  const abaixoMin = !vazia && subtotal < loja.pedidoMinimoCentavos;
  const bloqueado = vazia || abaixoMin || !loja.aberta;

  const irPara = (id: string) => {
    setAba(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const abas = [...(destaques.length ? [{ id: 'destaques', label: 'Destaques' }] : []), ...categorias.map((c) => ({ id: slug(c), label: c }))];
  const abaAtiva = aba || abas[0]?.id;

  const onEntrar = () => router.push(`/${lojaSlug}/entrar`);
  const onContinuar = () => router.push(`/${lojaSlug}/carrinho`);

  const resumo = (
    <ResumoSacola itens={itens} qtd={qtd} subtotal={subtotal} loja={loja} abaixoMin={abaixoMin} bloqueado={bloqueado} onMexer={mexer} onContinuar={onContinuar} />
  );

  return (
    <div className={`lj-root ${display.variable} ${body.variable} ${mono.variable} min-h-screen`}>
      <style>{CSS}</style>

      {/* ---------- Barra superior (desktop) ---------- */}
      <header className="hidden lg:flex h-16 px-8 bg-white border-b border-[#ECE7E2] items-center gap-3">
        <div className="mx-auto w-full max-w-[1200px] flex items-center gap-3">
          <Logo loja={loja} className="w-8 h-8 rounded-[9px] text-[13px]" />
          <span className="lj-display text-[17px] font-bold">{loja.nome}</span>
          <div className="flex-1" />
          <CampoBusca valor={busca} onChange={setBusca} className="w-[360px] h-[42px] bg-[#F3F0ED]" />
          <div className="flex-1" />
          {customerName ? (
            <div className="text-sm text-[#5E5A57] flex items-center gap-1.5">
              <span className="font-semibold text-[#1D1B1A]">{customerName.split(' ')[0]}</span> · <LogoutLink />
            </div>
          ) : (
            <button onClick={onEntrar} className="h-10 px-4 rounded-[10px] border border-[#E4DFDA] text-sm font-semibold flex items-center gap-2 hover:bg-[#F1EEEB]">
              <Svg d={I.user} size={16} /> Entrar
            </button>
          )}
        </div>
      </header>

      {/* ---------- Capa ---------- */}
      <div className="relative h-[132px] lg:h-[180px] lj-cover">
        {loja.capaUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={loja.capaUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="lg:hidden absolute top-3.5 right-4 flex gap-2">
          <button aria-label="Buscar" onClick={() => document.getElementById('busca-mobile')?.focus()} className="w-11 h-11 rounded-full bg-white/90 grid place-items-center">
            <Svg d={I.busca} />
          </button>
          {customerName ? (
            <div className="h-11 px-3 rounded-full bg-white/90 flex items-center text-xs font-semibold gap-1">
              {customerName.split(' ')[0]} <LogoutLink />
            </div>
          ) : (
            <button aria-label="Entrar" onClick={onEntrar} className="w-11 h-11 rounded-full bg-white/90 grid place-items-center">
              <Svg d={I.user} />
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 lg:px-8 flex gap-8 items-start">
        {/* ================= Coluna do cardápio ================= */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 lg:gap-7 pb-32 lg:pb-10">
          {/* ---------- Cartão da loja ---------- */}
          <section className="relative -mt-11 lg:-mt-[72px] bg-white rounded-[20px] border border-[#ECE7E2] shadow-[0_12px_32px_rgba(29,27,26,.06)] px-[18px] pb-[18px] lg:p-6 flex flex-col lg:flex-row lg:items-center gap-2.5 lg:gap-[22px]">
            <Logo loja={loja} className="-mt-9 lg:mt-0 w-[76px] h-[76px] lg:w-[104px] lg:h-[104px] rounded-[18px] lg:rounded-[22px] text-[28px] lg:text-[38px] shadow-[0_0_0_4px_#fff,0_6px_14px_rgba(29,27,26,.14)]" />
            <div className="flex-1 flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="lj-display text-[26px] lg:text-[32px] font-extrabold tracking-[-.01em] leading-tight">{loja.nome}</h1>
                <StatusLoja aberta={loja.aberta} />
              </div>
              {loja.subtitulo && <span className="text-[13px] lg:text-sm text-[#5E5A57]">{loja.subtitulo}</span>}

              <div className="lg:hidden grid grid-cols-3 gap-2 pt-1">
                {loja.tempoEntrega && <InfoBox label="Tempo" valor={loja.tempoEntrega} />}
                <InfoBox label="Entrega" valor={loja.taxaEntregaCentavos ? brl(loja.taxaEntregaCentavos) : 'Grátis'} />
                <InfoBox label="Mínimo" valor={brl(loja.pedidoMinimoCentavos)} />
              </div>
              <div className="hidden lg:flex gap-[22px] text-sm">
                {loja.tempoEntrega && <InfoLinha icon={I.relogio}>{loja.tempoEntrega}</InfoLinha>}
                <InfoLinha icon={I.moto}>
                  Entrega <b className="lj-mono font-semibold">{loja.taxaEntregaCentavos ? brl(loja.taxaEntregaCentavos) : 'Grátis'}</b>
                </InfoLinha>
                <InfoLinha icon={I.sacola}>
                  Pedido mínimo <b className="lj-mono font-semibold">{brl(loja.pedidoMinimoCentavos)}</b>
                </InfoLinha>
              </div>
            </div>
          </section>

          <CampoBusca id="busca-mobile" valor={busca} onChange={setBusca} className="lg:hidden h-12 bg-white border border-[#E4DFDA]" />

          {abas.length > 0 && (
            <nav
              aria-label="Categorias"
              className="lj-noscroll sticky top-0 z-10 -mx-4 lg:mx-0 px-4 lg:px-1.5 py-2.5 lg:py-1.5 bg-[#F6F4F2] lg:bg-white lg:border lg:border-[#ECE7E2] lg:rounded-[14px] flex gap-2 overflow-x-auto"
            >
              {abas.map((t) => {
                const ativa = t.id === abaAtiva;
                return (
                  <button
                    key={t.id}
                    onClick={() => irPara(t.id)}
                    aria-pressed={ativa}
                    className={`shrink-0 h-[38px] lg:h-10 px-4 lg:px-[18px] rounded-full lg:rounded-[10px] text-sm font-semibold border lg:border-0 transition-colors ${
                      ativa ? 'bg-[#1D1B1A] text-white border-[#1D1B1A]' : 'bg-white lg:bg-transparent text-[#5E5A57] border-[#E4DFDA] hover:text-[#1D1B1A]'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </nav>
          )}

          {destaques.length > 0 && !busca && (
            <section id="destaques" className="scroll-mt-20 flex flex-col gap-3.5">
              <TituloSecao titulo="Mais pedidos" sub="Os favoritos da casa" />
              <div className="lj-noscroll -mx-4 lg:mx-0 px-4 lg:px-0 flex lg:grid lg:grid-cols-3 gap-3.5 overflow-x-auto">
                {destaques.map((p, i) => (
                  <article key={p.id} className="lj-card shrink-0 w-[220px] lg:w-auto bg-white border border-[#ECE7E2] rounded-2xl overflow-hidden flex flex-col">
                    <div className="relative">
                      <Foto produto={p} size={64} className="w-full h-[140px]" />
                      <span className="absolute top-2.5 left-2.5 text-[11px] font-bold text-white bg-[#1D1B1A] px-2 py-0.5 rounded-full">#{i + 1} mais pedido</span>
                    </div>
                    <div className="px-4 pt-3.5 pb-4 flex items-end gap-2.5">
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <span className="text-[15px] font-semibold">{p.nome}</span>
                        <span className="lj-mono text-[15px] font-semibold">{brl(p.precoCentavos)}</span>
                      </div>
                      <button onClick={() => mexer(p.id, 1)} aria-label={`Adicionar ${p.nome}`} className="lj-add w-10 h-10 shrink-0 rounded-xl bg-[#D0101F] hover:bg-[#A90D19] text-white grid place-items-center">
                        <Svg d={I.mais} sw={2.4} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {secoes.map((s) => (
            <section key={s.cat} id={slug(s.cat)} className="scroll-mt-20 flex flex-col gap-2.5 lg:gap-3.5">
              <TituloSecao titulo={s.cat} sub={`${s.itens.length} ${s.itens.length === 1 ? 'item' : 'itens'}`} mono />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 lg:gap-3.5">
                {s.itens.map((p) => {
                  const q = sacola[p.id] ?? 0;
                  return (
                    <article key={p.id} className={`lj-card bg-white border rounded-2xl p-3.5 lg:p-4 flex gap-3 lg:gap-3.5 min-h-[116px] lg:min-h-[132px] ${q ? 'border-[#F4B8B2]' : 'border-[#ECE7E2]'}`}>
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <span className="text-[15px] lg:text-base font-semibold">{p.nome}</span>
                        {p.descricao && <span className="lj-clamp text-[13px] leading-[1.45] text-[#5E5A57]">{p.descricao}</span>}
                        <div className="flex-1" />
                        <span className="lj-mono text-[15px] font-semibold">
                          {brl(p.precoCentavos)}
                          {p.precoOriginalCentavos && p.precoOriginalCentavos > p.precoCentavos && (
                            <span className="text-[#A3A3AC] line-through ml-2 font-normal">{brl(p.precoOriginalCentavos)}</span>
                          )}
                        </span>
                      </div>
                      <div className="relative shrink-0">
                        <Foto produto={p} size={44} className="w-[88px] h-[88px] lg:w-[100px] lg:h-[100px] rounded-[14px]" />
                        <button
                          onClick={() => mexer(p.id, 1)}
                          aria-label={`Adicionar ${p.nome}`}
                          className="lj-add absolute -right-2 -bottom-2 w-[38px] h-[38px] box-content border-[3px] border-white rounded-full bg-[#D0101F] hover:bg-[#A90D19] text-white grid place-items-center"
                        >
                          {q ? <span className="lj-mono text-sm font-semibold">{q}</span> : <Svg d={I.mais} sw={2.4} />}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}

          {secoes.length === 0 && produtos.length > 0 && <div className="py-12 text-center text-[#5E5A57]">Nenhum item encontrado para &ldquo;{busca}&rdquo;.</div>}

          {produtos.length === 0 && (
            <div className="py-12 text-center text-[#5E5A57]">
              <b className="block text-[#1D1B1A]">Cardápio em preparação</b>
              <p className="text-sm mt-1">Assim que o lojista adicionar produtos, eles aparecem aqui.</p>
            </div>
          )}

          <footer className="pt-2 flex items-center justify-center gap-2 text-[13px] text-[#6B6662]">
            <span className="w-[18px] h-[18px] rounded-[5px] bg-[#D0101F]" />
            Loja no CardápioZap
          </footer>
        </div>

        {/* ================= Sacola (desktop) ================= */}
        <aside aria-label="Sua sacola" className="hidden lg:flex sticky top-6 mt-7 w-[352px] shrink-0 bg-white border border-[#ECE7E2] rounded-[20px] p-[22px] flex-col gap-4 shadow-[0_12px_32px_rgba(29,27,26,.06)]">
          {resumo}
        </aside>
      </div>

      {/* ================= Barra da sacola (celular) ================= */}
      {!vazia && (
        <div className="lg:hidden fixed left-3 right-3 bottom-4 z-20 flex flex-col gap-2" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {abaixoMin && (
            <div className="self-center text-xs font-semibold text-[#8A5A00] bg-[#FFF4D6] px-3 py-1.5 rounded-full shadow-[0_4px_12px_rgba(29,27,26,.08)]">
              Faltam {brl(loja.pedidoMinimoCentavos - subtotal)} para o pedido mínimo
            </div>
          )}
          <button onClick={() => setSheetAberto(true)} className="h-[60px] rounded-[18px] bg-[#D0101F] text-white px-4 flex items-center gap-3 shadow-[0_10px_28px_rgba(168,13,25,.28)]">
            <span className="lj-mono min-w-[30px] h-[30px] rounded-[9px] bg-white/20 grid place-items-center text-sm font-semibold">{qtd}</span>
            <span className="text-[15px] font-bold">Ver sacola</span>
            <span className="lj-mono ml-auto text-[15px] font-semibold">{brl(subtotal)}</span>
          </button>
        </div>
      )}

      {/* ================= Sacola em folha (celular) ================= */}
      {sheetAberto && (
        <div className="lg:hidden fixed inset-0 z-30 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label="Sua sacola">
          <button aria-label="Fechar sacola" onClick={() => setSheetAberto(false)} className="absolute inset-0 bg-black/40" />
          <div className="lj-sheet relative bg-white rounded-t-3xl p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto" style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}>
            <div className="mx-auto w-10 h-1 rounded-full bg-[#E4DFDA]" />
            {resumo}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Subcomponentes                                                      */
/* ------------------------------------------------------------------ */

function Logo({ loja, className }: { loja: Loja; className: string }) {
  return loja.logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={loja.logoUrl} alt={loja.nome} className={`object-cover shrink-0 ${className}`} />
  ) : (
    <div className={`lj-display shrink-0 bg-[#D0101F] text-white grid place-items-center font-extrabold ${className}`}>{iniciais(loja.nome)}</div>
  );
}

function StatusLoja({ aberta }: { aberta: boolean }) {
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${aberta ? 'text-[#177245] bg-[#E7F6EE]' : 'text-[#5E5A57] bg-[#F1EEEB]'}`}>
      <span className={`w-[7px] h-[7px] rounded-full ${aberta ? 'bg-[#177245]' : 'bg-[#5E5A57]'}`} />
      {aberta ? 'Aberto agora' : 'Fechado'}
    </span>
  );
}

function InfoBox({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="bg-[#F6F4F2] rounded-xl p-2.5 flex flex-col gap-0.5">
      <span className="text-[11px] text-[#5E5A57]">{label}</span>
      <span className="lj-mono text-[13px] font-semibold">{valor}</span>
    </div>
  );
}

function InfoLinha({ icon, children }: { icon: string[]; children: ReactNode }) {
  return (
    <span className="flex items-center gap-[7px]">
      <span className="text-[#5E5A57]">
        <Svg d={icon} size={17} />
      </span>
      <span>{children}</span>
    </span>
  );
}

function CampoBusca({ id, valor, onChange, className }: { id?: string; valor: string; onChange: (v: string) => void; className: string }) {
  return (
    <label className={`px-3.5 rounded-xl flex items-center gap-2.5 text-[#6B6662] focus-within:ring-2 focus-within:ring-[#1D4ED8] ${className}`}>
      <Svg d={I.busca} size={17} />
      <span className="sr-only">Buscar no cardápio</span>
      <input id={id} type="search" value={valor} onChange={(e) => onChange(e.target.value)} placeholder="Buscar no cardápio" className="flex-1 min-w-0 bg-transparent outline-none text-[#1D1B1A] text-[17px] lg:text-[15px]" />
    </label>
  );
}

function TituloSecao({ titulo, sub, mono }: { titulo: string; sub: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <h2 className="lj-display text-[19px] lg:text-[22px] font-bold">{titulo}</h2>
      <span className={`text-[13px] text-[#5E5A57] ${mono ? 'lj-mono' : ''}`}>{sub}</span>
    </div>
  );
}

function ResumoSacola({
  itens,
  qtd,
  subtotal,
  loja,
  abaixoMin,
  bloqueado,
  onMexer,
  onContinuar,
}: {
  itens: ItemSacola[];
  qtd: number;
  subtotal: number;
  loja: Loja;
  abaixoMin: boolean;
  bloqueado: boolean;
  onMexer: (id: string, d: number) => void;
  onContinuar: () => void;
}) {
  const vazia = qtd === 0;
  const pct = loja.pedidoMinimoCentavos ? Math.min(100, Math.round((subtotal / loja.pedidoMinimoCentavos) * 100)) : 100;
  return (
    <>
      <div className="flex items-center gap-2.5">
        <h2 className="lj-display text-xl font-bold">Sua sacola</h2>
        <span className="lj-mono ml-auto text-[13px] text-[#5E5A57]">{qtd === 1 ? '1 item' : `${qtd} itens`}</span>
      </div>

      {vazia ? (
        <div className="py-7 px-3 flex flex-col items-center gap-2.5 text-center text-[#6B6662]">
          <Svg d={I.sacola} size={40} sw={1.5} />
          <span className="text-sm">
            Sua sacola está vazia.
            <br />
            Adicione itens do cardápio.
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {itens.map(({ produto: p, quantidade }) => (
            <div key={p.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{p.nome}</span>
                <span className="lj-mono text-[13px] text-[#5E5A57]">{brl(p.precoCentavos * quantidade)}</span>
              </div>
              <div className="flex items-center gap-0.5 border border-[#E4DFDA] rounded-[10px] h-9">
                <button onClick={() => onMexer(p.id, -1)} aria-label={`Remover um ${p.nome}`} className="w-[34px] h-[34px] grid place-items-center text-[#C4101D]">
                  <Svg d={I.menos} size={15} sw={2.4} />
                </button>
                <span className="lj-mono min-w-[18px] text-center text-sm font-semibold">{quantidade}</span>
                <button onClick={() => onMexer(p.id, 1)} aria-label={`Adicionar um ${p.nome}`} className="w-[34px] h-[34px] grid place-items-center text-[#C4101D]">
                  <Svg d={I.mais} size={15} sw={2.4} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-dashed border-[#E4DFDA] pt-3.5 flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-[#5E5A57]">
          <span>Subtotal</span>
          <span className="lj-mono">{brl(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[#5E5A57]">
          <span>Entrega</span>
          <span className="lj-mono">{loja.taxaEntregaCentavos ? brl(loja.taxaEntregaCentavos) : 'Grátis'}</span>
        </div>
        <div className="flex justify-between text-[17px] font-bold pt-1">
          <span>Total</span>
          <span className="lj-mono">{brl(vazia ? 0 : subtotal + loja.taxaEntregaCentavos)}</span>
        </div>
      </div>

      {abaixoMin && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] text-[#8A5A00]">Faltam {brl(loja.pedidoMinimoCentavos - subtotal)} para o pedido mínimo</span>
          <div className="h-1.5 rounded-full bg-[#F1EEEB] overflow-hidden">
            <div className="h-1.5 rounded-full bg-[#E8890C] transition-[width]" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <button
        onClick={onContinuar}
        disabled={bloqueado}
        className="h-[52px] rounded-[14px] text-[15px] font-bold flex items-center justify-center gap-2.5 bg-[#D0101F] hover:bg-[#A90D19] text-white disabled:bg-[#EDE9E5] disabled:text-[#6B6662] disabled:cursor-not-allowed"
      >
        {loja.aberta ? 'Continuar pedido' : 'Loja fechada no momento'}
        {loja.aberta && <Svg d={I.seta} sw={2.2} />}
      </button>
      <div className="flex items-center justify-center gap-1.5 text-xs text-[#5E5A57]">
        <Svg d={I.cadeado} size={14} />
        Pix, cartão ou dinheiro na entrega
      </div>
    </>
  );
}
