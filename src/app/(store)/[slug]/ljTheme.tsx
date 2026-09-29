import type { ReactNode } from 'react';
import { Bricolage_Grotesque, DM_Sans, IBM_Plex_Mono } from 'next/font/google';

/* Mesmas fontes/paleta do cardápio (LojaCardapio.tsx) — compartilhado aqui pra
   login, carrinho/checkout e status do pedido terem a mesma cara, sem repetir
   o bloco de CSS em cada arquivo. */

const display = Bricolage_Grotesque({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--f-display' });
const body = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--f-body' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500', '600'], variable: '--f-mono' });

export const LJ_FONT_VARS = `${display.variable} ${body.variable} ${mono.variable}`;

export const LJ_CSS = `
.lj-root{font-family:var(--f-body),system-ui,sans-serif;color:#1D1B1A;background:#F6F4F2;color-scheme:light}
.lj-root button{font-family:inherit;cursor:pointer}
.lj-root :focus-visible{outline:2px solid #1D4ED8;outline-offset:2px}
.lj-display{font-family:var(--f-display),var(--f-body),sans-serif}
.lj-mono{font-family:var(--f-mono),ui-monospace,monospace;font-variant-numeric:tabular-nums}
.lj-cover{background-color:#C8101E;background-image:radial-gradient(rgba(255,255,255,.16) 1.2px,transparent 1.3px);background-size:18px 18px}
.lj-card{transition:box-shadow .15s ease,border-color .15s ease}
.lj-card:hover{box-shadow:0 8px 24px rgba(29,27,26,.08)}
@keyframes lj-fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.lj-fade{animation:lj-fade .35s ease-out both}
@media (prefers-reduced-motion:reduce){.lj-card{transition:none}.lj-fade{animation:none}}
`;

/** Envolve uma tela do fluxo do cliente (login, carrinho, status do pedido) com as
 * mesmas fontes/CSS do cardápio, pra não quebrar o visual no meio da jornada. */
export function LjRoot({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`lj-root ${LJ_FONT_VARS} min-h-screen ${className}`}>
      <style>{LJ_CSS}</style>
      {children}
    </div>
  );
}

/* Ícones — mesmo formato do cardápio (stroke, 24x24). */
export function Svg({ d, size = 18, sw = 2, className }: { d: string[]; size?: number; sw?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {d.map((p) => (
        <path key={p} d={p} />
      ))}
    </svg>
  );
}

export const I = {
  voltar: ['M19 12H5', 'm11 18-6-6 6-6'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 21a8 8 0 0 1 16 0'],
  cadeado: ['M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z', 'M8 11V7a4 4 0 0 1 8 0v4'],
  sacola: ['M6 7h12l-1 13H7Z', 'M9 7a3 3 0 0 1 6 0'],
  mais: ['M12 5v14M5 12h14'],
  menos: ['M5 12h14'],
  pin: ['M12 21s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12Z', 'M12 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'],
  cartao: ['M3 7h18v10H3Z', 'M3 10.5h18'],
  dinheiro: ['M3 7h18v10H3Z', 'M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z'],
  copiar: ['M9 9h10v10H9Z', 'M5 15V5h10'],
  check: ['M5 12.5l4.5 4.5L19 7'],
  whats: ['M12 3a9 9 0 0 0-7.79 13.5L3 21l4.65-1.19A9 9 0 1 0 12 3Z', 'M8.6 9.3c.2-.5.5-.5.7-.5h.5c.2 0 .3.1.4.3.2.4.6 1.3.6 1.4.1.2.1.3 0 .5s-.2.3-.3.4l-.3.3c-.1.1-.2.2-.1.4.2.4.7 1 1.3 1.5.6.5 1.2.8 1.6.9.2.1.3.1.5-.1l.5-.6c.1-.2.3-.2.5-.1l1.3.6c.2.1.3.2.3.4s0 .5-.1.8-.8.8-1.5.9-1 0-1.6-.2c-.5-.2-1.1-.4-1.9-.8-1.5-.8-2.6-2-2.8-2.3-.2-.3-1-1.2-1-2.3s.5-1.6.7-1.9Z'],
  loja: ['M4 9l1-4.5h14L20 9M4 9v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M4 9h16M9 19v-5h6v5'],
};

/* Estilos compartilhados dos átomos de UI (input, botão) — string em vez de
   componente pra caber em formulários que já têm sua própria estrutura de <label>. */
export const ljInput =
  'w-full h-12 px-3.5 rounded-[10px] border border-[#E4DFDA] bg-white text-[#1D1B1A] text-[15px] placeholder:text-[#A3A3AC] outline-none transition-colors focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20';

export const ljBtnPrimary =
  'h-[52px] rounded-[14px] text-[15px] font-bold flex items-center justify-center gap-2.5 bg-[#D0101F] hover:bg-[#A90D19] text-white disabled:bg-[#EDE9E5] disabled:text-[#6B6662] disabled:cursor-not-allowed transition-colors';

export const ljCard = 'bg-white border border-[#ECE7E2] rounded-2xl';
