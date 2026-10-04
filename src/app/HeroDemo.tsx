'use client';

// Demo interativo do hero: o visitante toca em "+" no celular e vê, na hora,
// o carrinho atualizar e a mensagem chegar formatada no WhatsApp da loja.
// Tocar no cabeçalho troca a loja de exemplo (doceria/hamburgueria/pizzaria),
// pra mostrar que o app serve pra vários nichos. Tudo local (sem API).

import { useEffect, useRef, useState } from 'react';
import { WhatsappIcon, SwitchIcon } from '@/components/icons';

type Item = { id: string; nome: string; desc: string; preco: number; cor: string };

type Loja = {
  id: string;
  sigla: string;
  nome: string;
  status: string;
  itens: Item[];
  padrao: Record<string, number>;
};

const LOJAS: Loja[] = [
  {
    id: 'doceria',
    sigla: 'DA',
    nome: 'Doceria da Ana',
    status: 'Aberto · 30–45 min',
    itens: [
      { id: 'bolo', nome: 'Bolo de cenoura', desc: 'Com cobertura de chocolate', preco: 18, cor: '#FFEEDB' },
      { id: 'brig', nome: 'Brigadeiro gourmet', desc: 'Caixa com 6 unidades', preco: 24, cor: '#F3E6DF' },
      { id: 'torta', nome: 'Torta de limão', desc: 'Fatia generosa', preco: 30, cor: '#EEF6DC' },
    ],
    padrao: { bolo: 2, torta: 1 },
  },
  {
    id: 'hamburgueria',
    sigla: 'HZ',
    nome: 'Hamburgueria do Zé',
    status: 'Aberto · 25–40 min',
    itens: [
      { id: 'cheddar', nome: 'Cheddar duplo', desc: 'Blend 160g, bacon e cheddar', preco: 32, cor: '#F7E3D6' },
      { id: 'batata', nome: 'Batata rústica', desc: 'Porção com alecrim', preco: 16, cor: '#FDEFD6' },
      { id: 'shake', nome: 'Milk-shake Oreo', desc: '400ml', preco: 19, cor: '#E9E4F2' },
    ],
    padrao: { cheddar: 1, batata: 1 },
  },
  {
    id: 'pizzaria',
    sigla: 'PV',
    nome: 'Pizzaria Vale',
    status: 'Aberto · 40–55 min',
    itens: [
      { id: 'calabresa', nome: 'Pizza calabresa', desc: 'Grande, borda recheada', preco: 48, cor: '#FBE3DD' },
      { id: 'mussarela', nome: 'Pizza mussarela', desc: 'Grande, molho da casa', preco: 44, cor: '#FFF3D6' },
      { id: 'refri', nome: 'Refrigerante 2L', desc: 'Coca-Cola ou Guaraná', preco: 12, cor: '#E4F1E6' },
    ],
    padrao: { calabresa: 1 },
  },
];

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function HeroDemo() {
  const [storeIdx, setStoreIdx] = useState(0);
  const [qtd, setQtd] = useState<Record<string, number>>(LOJAS[0].padrao);
  const [enviado, setEnviado] = useState(false);
  const [pulse, setPulse] = useState<string | null>(null);
  const [numero, setNumero] = useState(128);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const loja = LOJAS[storeIdx];
  const itens = loja.itens.filter((i) => qtd[i.id]);
  const total = itens.reduce((s, i) => s + i.preco * qtd[i.id], 0);
  const count = itens.reduce((s, i) => s + qtd[i.id], 0);

  // Índice sempre fresco pra uso dentro do intervalo abaixo (evita closure presa no
  // valor da primeira renderização).
  const storeIdxRef = useRef(storeIdx);
  storeIdxRef.current = storeIdx;
  // Quando foi a última interação manual — o auto-avanço só dispara depois de um
  // tempo sem toques, pra não brigar com quem está usando o demo de verdade.
  const lastInteractionRef = useRef(Date.now() - 10_000);

  const add = (id: string) => {
    lastInteractionRef.current = Date.now();
    setQtd((q) => ({ ...q, [id]: (q[id] ?? 0) + 1 }));
    setEnviado(false);
    setPulse(id);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPulse(null), 350);
  };

  const enviar = () => {
    if (!count) return;
    lastInteractionRef.current = Date.now();
    setEnviado(true);
    setNumero((n) => n + 1);
  };

  const recomecar = () => {
    setQtd({});
    setEnviado(false);
  };

  const trocarLoja = () => {
    const next = (storeIdxRef.current + 1) % LOJAS.length;
    setStoreIdx(next);
    setQtd(LOJAS[next].padrao);
    setEnviado(false);
    setPulse(null);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  // Troca de loja sozinha a cada 5s, só quando ninguém tocou no demo nos últimos
  // 4s — assim o hero já "vive" pra quem não interage, mas não briga com quem
  // está no meio de montar um pedido manualmente.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      if (Date.now() - lastInteractionRef.current > 4000) trocarLoja();
    }, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[420px] lg:max-w-none">
      {/* Celular */}
      <div className="relative mx-auto w-[272px] rounded-[2.4rem] border-[10px] border-ink bg-surface shadow-[0_30px_80px_-20px_rgba(28,28,33,.45)] overflow-hidden">
        <div className="h-5 bg-surface flex justify-center">
          <span className="mt-1.5 w-16 h-1.5 rounded-full bg-line2" />
        </div>
        <div className="bg-bg px-3 pb-3 pt-1 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={trocarLoja}
            aria-label={`Ver outra loja de exemplo (atual: ${loja.nome})`}
            className="group flex items-center gap-2.5 px-1 py-1 -mx-1 rounded-xl text-left transition-colors hover:bg-surface active:scale-[0.98]"
          >
            <div key={loja.id} className="w-9 h-9 rounded-xl bg-brand text-white grid place-items-center font-display font-extrabold text-xs shrink-0 animate-fade-in-up">
              {loja.sigla}
            </div>
            <div key={`${loja.id}-info`} className="min-w-0 flex-1 animate-fade-in-up">
              <p className="font-display text-sm font-extrabold text-ink leading-tight truncate">{loja.nome}</p>
              <p className="text-[10px] text-muted flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" /> {loja.status}
              </p>
            </div>
            <SwitchIcon className="w-3.5 h-3.5 text-dim shrink-0 transition-transform group-hover:rotate-180 group-active:rotate-180 duration-300" />
          </button>

          {loja.itens.map((i) => {
            const q = qtd[i.id] ?? 0;
            return (
              <div
                key={`${loja.id}-${i.id}`}
                className={`bg-surface rounded-xl p-2.5 flex items-center gap-2.5 border transition-colors animate-fade-in-up ${q ? 'border-brand/30' : 'border-line'}`}
              >
                <div className="w-11 h-11 rounded-lg shrink-0" style={{ background: i.cor }} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-ink truncate">{i.nome}</p>
                  <p className="text-[10px] text-muted truncate">{i.desc}</p>
                  <p className="text-[11px] font-semibold text-ink font-mono mt-0.5">{brl(i.preco)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => add(i.id)}
                  aria-label={`Adicionar ${i.nome}`}
                  className={`w-8 h-8 shrink-0 rounded-full bg-brand text-white grid place-items-center text-xs font-bold transition-transform hover:bg-brand-dark ${pulse === i.id ? 'scale-125' : 'scale-100'}`}
                >
                  {q ? q : <span className="text-base leading-none">+</span>}
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={enviar}
            disabled={!count}
            className="mt-1 h-11 rounded-xl bg-brand text-white text-xs font-bold flex items-center justify-between px-3.5 disabled:bg-line2 disabled:text-muted transition-colors hover:bg-brand-dark"
          >
            <span className="flex items-center gap-2">
              <span className="min-w-[22px] h-[22px] rounded-md bg-white/20 grid place-items-center font-mono">{count}</span>
              {enviado ? 'Pedido enviado!' : 'Enviar pedido'}
            </span>
            <span className="font-mono">{brl(total)}</span>
          </button>
        </div>
      </div>

      {/* Mensagem do WhatsApp — aparece ao enviar */}
      <div
        aria-live="polite"
        className={`absolute right-0 sm:-right-4 lg:-right-10 bottom-10 w-[228px] bg-surface rounded-2xl shadow-xl border border-line overflow-hidden transition-all duration-300 motion-reduce:transition-none ${
          enviado ? 'opacity-100 translate-y-0 rotate-2' : 'opacity-0 translate-y-3 rotate-0 pointer-events-none'
        }`}
      >
        <div className="bg-[#128C7E] text-white px-3 py-2 flex items-center gap-1.5 text-[11px] font-bold">
          <WhatsappIcon className="w-3.5 h-3.5" /> WhatsApp da loja
          <span className="ml-auto font-medium opacity-80">agora</span>
        </div>
        <div className="p-2.5 bg-[#EFEAE2]">
          <div className="bg-surface rounded-lg px-2.5 py-2 text-[11px] leading-snug text-ink">
            <p className="font-bold">Novo pedido #{numero}</p>
            {itens.map((i) => (
              <p key={i.id}>{qtd[i.id]}x {i.nome}</p>
            ))}
            <p className="font-bold mt-1 font-mono">Total: {brl(total)}</p>
            <p className="text-green font-semibold">Pagamento: Pix</p>
          </div>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-muted">
        {enviado ? (
          <>
            Assim o pedido chega pra você.{' '}
            <button type="button" onClick={recomecar} className="font-semibold text-brand hover:underline">
              Testar de novo
            </button>
          </>
        ) : (
          <>
            Toque em <b className="text-brand">+</b> pra montar o pedido, ou no nome da loja pra ver{' '}
            <button type="button" onClick={trocarLoja} className="font-semibold text-ink hover:underline">
              outro nicho
            </button>
            .
          </>
        )}
      </p>
    </div>
  );
}
