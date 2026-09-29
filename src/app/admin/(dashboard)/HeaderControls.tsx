'use client';

import { useState } from 'react';
import { Icon, I } from './pp-icons';

export default function HeaderControls({
  slug,
  initialIsOpen,
  hasNew,
  btnGhostClass,
}: {
  slug: string;
  initialIsOpen: boolean;
  hasNew: boolean;
  btnGhostClass: string;
}) {
  const [aberta, setAberta] = useState(initialIsOpen);
  const [copiado, setCopiado] = useState(false);
  const linkLoja = `/${slug}`;

  async function toggleAberta() {
    const next = !aberta;
    setAberta(next);
    await fetch('/api/store/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOpen: next }),
    });
  }

  async function copiarLink() {
    await navigator.clipboard.writeText(new URL(linkLoja, window.location.origin).toString());
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  }

  return (
    <>
      <button
        onClick={toggleAberta}
        aria-pressed={aberta}
        className={`h-[34px] pl-2.5 pr-3.5 rounded-full border text-[13px] font-semibold flex items-center gap-2 transition-colors shrink-0 ${
          aberta ? 'border-[#BFE5CF] bg-[#E7F6EE] text-[#177245]' : 'border-[#E4DFDA] bg-[#F1EEEB] text-[#5E5A57]'
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${aberta ? 'bg-[#177245]' : 'bg-[#5E5A57]'}`} />
        {aberta ? 'Loja aberta' : 'Loja fechada'}
      </button>

      <div className="flex-1 order-last sm:order-none w-full sm:w-auto" />

      <button onClick={copiarLink} className={`${btnGhostClass} shrink-0`}>
        <Icon d={I.copiar} size={16} />
        {copiado ? 'Link copiado!' : 'Copiar link da loja'}
      </button>
      <a href={linkLoja} target="_blank" rel="noopener noreferrer" className={`${btnGhostClass} shrink-0`}>
        Ver minha loja <Icon d={I.externo} size={15} />
      </a>
      <button aria-label="Notificações" className="relative w-11 h-11 rounded-[10px] grid place-items-center hover:bg-[#F1EEEB] shrink-0">
        <Icon d={I.sino} size={20} />
        {hasNew && <span className="absolute top-[9px] right-2.5 w-[9px] h-[9px] rounded-full bg-[#D0101F] border-2 border-white" />}
      </button>
    </>
  );
}
