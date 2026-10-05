'use client';

import { useState } from 'react';
import { Icon, I } from './pp-icons';

export default function HeaderControls({
  slug,
  initialIsOpen,
  btnGhostClass,
}: {
  slug: string;
  initialIsOpen: boolean;
  btnGhostClass: string;
}) {
  const [aberta, setAberta] = useState(initialIsOpen);
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState('');
  const linkLoja = `/${slug}`;

  async function toggleAberta() {
    const next = !aberta;
    setAberta(next);
    setErro('');
    try {
      const res = await fetch('/api/store/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: next }),
      });
      if (!res.ok) {
        setAberta(!next);
        setErro('Não foi possível atualizar. Tente de novo.');
      }
    } catch {
      setAberta(!next);
      setErro('Falha de conexão. Tente novamente.');
    }
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(new URL(linkLoja, window.location.origin).toString());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      // clipboard indisponível — sem crash, só não copia
    }
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
      {erro && <span className="text-[12px] font-semibold text-[#B42318] shrink-0">{erro}</span>}

      <div className="flex-1 order-last sm:order-none w-full sm:w-auto" />

      <button onClick={copiarLink} className={`${btnGhostClass} shrink-0`}>
        <Icon d={I.copiar} size={16} />
        {copiado ? 'Link copiado!' : 'Copiar link da loja'}
      </button>
      <a href={linkLoja} target="_blank" rel="noopener noreferrer" className={`${btnGhostClass} shrink-0`}>
        Ver minha loja <Icon d={I.externo} size={15} />
      </a>
    </>
  );
}
