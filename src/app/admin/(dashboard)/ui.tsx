// Kit visual das telas do painel (Loja, Cupons, Produtos, Mais vendidos).
// Mesma paleta do quadro de pedidos (.pp-root no layout): fundo #F6F4F2, tinta
// #1D1B1A, vermelho #D0101F. Sem 'use client' — pode ser usado em server components.

import type { ReactNode } from 'react';
import { Icon } from './pp-icons';

export const C = {
  ink: '#1D1B1A',
  muted: '#5E5A57',
  dim: '#6B6662',
  line: '#ECE7E2',
  line2: '#E4DFDA',
  ground: '#F6F4F2',
  soft: '#F1EEEB',
  red: '#D0101F',
  redDark: '#A90D19',
  green: '#177245',
  greenSoft: '#E7F6EE',
  amber: '#8A5A00',
  amberSoft: '#FFF4D6',
  blue: '#1D4ED8',
  blueSoft: '#EAF1FF',
};

/** Caixa branca padrão das telas. */
export const card = 'bg-white rounded-2xl border border-[#ECE7E2]';

/** Campo de texto. 16px no celular evita o zoom automático do iOS. */
export const input =
  'w-full h-11 rounded-xl border border-[#E4DFDA] bg-white px-3.5 text-base sm:text-sm text-[#1D1B1A] placeholder:text-[#9A948F] outline-none transition-colors focus:border-[#1D1B1A] focus:ring-4 focus:ring-[#1D1B1A]/5 disabled:bg-[#F6F4F2] disabled:text-[#9A948F]';

export const label = 'block text-sm font-semibold text-[#1D1B1A] mb-1.5';
export const hint = 'text-xs text-[#6B6662] mt-1.5';

export const btnPrimary =
  'h-11 px-5 rounded-xl bg-[#D0101F] text-white text-sm font-bold inline-flex items-center justify-center gap-2 hover:bg-[#A90D19] disabled:opacity-60 disabled:cursor-not-allowed transition-colors';
export const btnGhost =
  'h-11 px-4 rounded-xl border border-[#E4DFDA] bg-white text-sm font-semibold text-[#1D1B1A] inline-flex items-center justify-center gap-2 hover:bg-[#F1EEEB] disabled:opacity-60 transition-colors';
export const btnIcon =
  'w-9 h-9 rounded-lg grid place-items-center text-[#5E5A57] hover:bg-[#F1EEEB] hover:text-[#1D1B1A] transition-colors';

/** Título de cada tela: nome, frase de apoio e ações à direita. */
export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3 mb-5">
      <div className="min-w-0">
        <h1 className="pp-display text-[26px] leading-tight font-bold text-[#1D1B1A]">{title}</h1>
        {subtitle && <p className="text-sm text-[#5E5A57] mt-1">{subtitle}</p>}
      </div>
      {children && <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

/** Número-resumo no topo das telas. */
export function Stat({ label, value, children }: { label: string; value: ReactNode; children?: ReactNode }) {
  return (
    <div className={`${card} px-5 py-4 flex flex-col gap-1 min-w-0`}>
      <span className="text-[13px] text-[#5E5A57]">{label}</span>
      <div className="flex items-baseline flex-wrap gap-x-2.5 gap-y-1">
        <span className="pp-mono text-[26px] leading-tight font-semibold text-[#1D1B1A]">{value}</span>
        {children}
      </div>
    </div>
  );
}

/** Cabeçalho de um bloco dentro de um card: ícone, título e descrição. */
export function SectionTitle({
  icon,
  title,
  desc,
  tone = 'red',
  right,
}: {
  icon: string[];
  title: string;
  desc?: string;
  tone?: 'red' | 'green' | 'blue' | 'amber' | 'ink';
  right?: ReactNode;
}) {
  const tones = {
    red: 'bg-[#FEECEB] text-[#C4101D]',
    green: 'bg-[#E7F6EE] text-[#177245]',
    blue: 'bg-[#EAF1FF] text-[#1D4ED8]',
    amber: 'bg-[#FFF4D6] text-[#8A5A00]',
    ink: 'bg-[#F1EEEB] text-[#1D1B1A]',
  };
  return (
    <div className="flex items-start gap-3">
      <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${tones[tone]}`}>
        <Icon d={icon} size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="pp-display text-[17px] font-bold text-[#1D1B1A] leading-tight">{title}</h2>
        {desc && <p className="text-[13px] text-[#5E5A57] mt-0.5 leading-snug">{desc}</p>}
      </div>
      {right}
    </div>
  );
}

/** Estado vazio com ícone, texto e ação opcional. */
export function EmptyState({ icon, title, text, children }: { icon: string[]; title: string; text: string; children?: ReactNode }) {
  return (
    <div className={`${card} px-6 py-12 flex flex-col items-center text-center gap-3`}>
      <div className="w-14 h-14 rounded-2xl bg-[#FEECEB] text-[#D0101F] grid place-items-center">
        <Icon d={icon} size={26} />
      </div>
      <h2 className="pp-display text-lg font-bold text-[#1D1B1A]">{title}</h2>
      <p className="text-sm text-[#5E5A57] max-w-sm leading-relaxed">{text}</p>
      {children && <div className="mt-2 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}
