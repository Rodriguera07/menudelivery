'use client';

import { useState } from 'react';
import { I } from '../pp-icons';
import { card, SectionTitle } from '../ui';
import { Switch } from '../ui-client';

export default function TwoFactorToggle({ enabled: initialEnabled }: { enabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function toggle(next: boolean) {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/store/merchant/two-factor', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error ?? 'Não foi possível alterar.');
      setEnabled(next);
    } catch {
      setError('Falha de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="seguranca" className={`${card} p-5 sm:p-6 flex flex-col gap-4 scroll-mt-16`}>
      <SectionTitle
        icon={I.escudo}
        tone="ink"
        title="Verificação em duas etapas"
        desc="Ao entrar no painel, você confirma com um código de 6 dígitos enviado para o WhatsApp da loja."
        right={<Switch checked={enabled} onChange={toggle} disabled={loading} label="Verificação em duas etapas" />}
      />
      <p
        className={`text-[13px] rounded-xl px-3.5 py-2.5 ${
          enabled ? 'bg-[#E7F6EE] text-[#177245]' : 'bg-[#FFF4D6] text-[#8A5A00]'
        }`}
      >
        {enabled
          ? 'Ativada. Mesmo que alguém descubra sua senha, não consegue entrar sem o código.'
          : 'Desativada. Recomendamos ativar: protege seus pedidos e o dinheiro da sua loja.'}
      </p>
      {error && <p className="text-xs text-[#B42318]">{error}</p>}
    </section>
  );
}
