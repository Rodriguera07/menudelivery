'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { formatBRL, parseBRL } from '@/lib/format';
import { Icon, I } from '../pp-icons';
import { card, input, label, hint, btnPrimary, btnGhost, SectionTitle } from '../ui';
import { useToast, useCopy } from '../ui-client';
import LogoUploader from './LogoUploader';
import StorePreviewCard from './StorePreviewCard';

type StoreInfo = {
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  isOpen: boolean;
  whatsapp: string;
  pixKey: string;
  deliveryFee: number;
  minOrder: number;
  slug: string;
  commissionPct: number;
};

const semRS = (v: number) => formatBRL(v).replace('R$', '').trim();

function mascaraTelefone(v: string) {
  const d = v.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Tenta reconhecer o tipo da chave Pix digitada, só para orientar o lojista. */
function tipoChavePix(k: string): { tipo: string; ok: boolean } | null {
  const v = k.trim();
  if (!v) return null;
  const dig = v.replace(/\D/g, '');
  if (v.includes('@')) return { tipo: 'E-mail', ok: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) };
  if (/^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(v)) return { tipo: 'Chave aleatória', ok: true };
  if (v.startsWith('+')) return { tipo: 'Celular', ok: dig.length >= 12 && dig.length <= 13 };
  if (dig.length === 14) return { tipo: 'CNPJ', ok: true };
  if (dig.length === 11) return { tipo: 'CPF ou celular', ok: true };
  return { tipo: 'Formato não reconhecido', ok: false };
}

const SECOES = [
  { id: 'identidade', label: 'Identidade' },
  { id: 'entrega', label: 'Entrega' },
  { id: 'pagamento', label: 'Pagamento' },
  { id: 'horarios', label: 'Horários' },
  { id: 'seguranca', label: 'Segurança' },
];

export default function StoreSettingsForm({ store, children }: { store: StoreInfo; children?: ReactNode }) {
  const inicial = useMemo(
    () => ({
      name: store.name,
      whatsapp: mascaraTelefone(store.whatsapp),
      pixKey: store.pixKey,
      deliveryFee: semRS(store.deliveryFee),
      minOrder: semRS(store.minOrder),
    }),
    [store.name, store.whatsapp, store.pixKey, store.deliveryFee, store.minOrder],
  );
  const [salvo, setSalvo] = useState(inicial);
  const [form, setForm] = useState(inicial);
  const [logo, setLogo] = useState(store.logoUrl);
  const [loading, setLoading] = useState(false);
  const [tentou, setTentou] = useState(false);
  const toast = useToast();
  const { copy, copied } = useCopy();

  const alterado = (Object.keys(form) as (keyof typeof form)[]).some((k) => form[k] !== salvo[k]);

  // Avisa antes de sair da página com alterações não salvas.
  useEffect(() => {
    if (!alterado) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [alterado]);

  const fee = form.deliveryFee.trim() ? parseBRL(form.deliveryFee) : 0;
  const min = form.minOrder.trim() ? parseBRL(form.minOrder) : 0;
  const zapDig = form.whatsapp.replace(/\D/g, '');
  const pix = tipoChavePix(form.pixKey);

  const erros = {
    name: form.name.trim().length < 2 ? 'Informe o nome da loja.' : '',
    whatsapp: zapDig.length < 10 ? 'Informe o WhatsApp com DDD, ex.: (13) 99999-9999.' : '',
    deliveryFee: Number.isNaN(fee) || fee < 0 ? 'Valor inválido.' : '',
    minOrder: Number.isNaN(min) || min < 0 ? 'Valor inválido.' : '',
  };
  const valido = !Object.values(erros).some(Boolean);
  const err = (k: keyof typeof erros) => (tentou || form[k] !== salvo[k]) && erros[k];

  const linkPublico = typeof window !== 'undefined' ? `${window.location.origin}/${store.slug}` : `/${store.slug}`;

  async function salvar() {
    setTentou(true);
    if (!valido) {
      toast.show('Confira os campos destacados.', 'erro');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/store/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        whatsapp: zapDig,
        pixKey: form.pixKey.trim(),
        deliveryFee: fee,
        minOrder: min,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return toast.show(data.error ?? 'Não foi possível salvar.', 'erro');
    setSalvo(form);
    setTentou(false);
    toast.show('Alterações salvas');
  }

  return (
    <>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
        <div className="flex flex-col gap-4 min-w-0">
          {/* Navegação entre seções */}
          <nav aria-label="Seções" className="sticky top-0 z-10 -mx-1 px-1 py-2 bg-[#F6F4F2]/90 backdrop-blur flex gap-2 overflow-x-auto">
            {SECOES.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="shrink-0 h-9 px-3.5 rounded-full text-sm font-semibold bg-white border border-[#E4DFDA] text-[#3D3A37] hover:border-[#1D1B1A] grid place-items-center transition-colors"
              >
                {s.label}
              </a>
            ))}
          </nav>

          {/* ---------- Identidade ---------- */}
          <section id="identidade" className={`${card} p-5 sm:p-6 flex flex-col gap-5 scroll-mt-16`}>
            <SectionTitle icon={I.loja} title="Identidade" desc="Como sua loja aparece para o cliente." />
            <LogoUploader logoUrl={store.logoUrl} onChange={setLogo} />
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="lj-nome" className={label}>Nome da loja</label>
                <input
                  id="lj-nome"
                  className={`${input} ${err('name') ? 'border-[#E8A39C]' : ''}`}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {err('name') && <p className="text-xs text-[#B42318] mt-1.5">{erros.name}</p>}
              </div>
              <div>
                <label htmlFor="lj-zap" className={label}>WhatsApp que recebe os pedidos</label>
                <div className={`${input} flex items-center gap-2 px-3 ${err('whatsapp') ? 'border-[#E8A39C]' : ''}`}>
                  <span className="pp-mono text-sm text-[#6B6662]">+55</span>
                  <input
                    id="lj-zap"
                    inputMode="tel"
                    autoComplete="tel-national"
                    className="w-full bg-transparent outline-none"
                    placeholder="(13) 99999-9999"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: mascaraTelefone(e.target.value) })}
                  />
                  {zapDig.length >= 10 && <Icon d={I.check} size={16} className="text-[#177245] shrink-0" />}
                </div>
                {err('whatsapp') ? (
                  <p className="text-xs text-[#B42318] mt-1.5">{erros.whatsapp}</p>
                ) : (
                  <p className={hint}>Cada pedido chega nesse número, já formatado.</p>
                )}
              </div>
            </div>
          </section>

          {/* ---------- Entrega ---------- */}
          <section id="entrega" className={`${card} p-5 sm:p-6 flex flex-col gap-5 scroll-mt-16`}>
            <SectionTitle icon={I.moto} tone="amber" title="Entrega" desc="Taxa cobrada em cada pedido e o valor mínimo para pedir." />
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="lj-taxa" className={label}>Taxa de entrega</label>
                <div className={`${input} flex items-center gap-1.5 px-3 ${err('deliveryFee') ? 'border-[#E8A39C]' : ''}`}>
                  <span className="text-sm text-[#6B6662]">R$</span>
                  <input
                    id="lj-taxa"
                    inputMode="decimal"
                    className="w-full bg-transparent outline-none pp-mono"
                    placeholder="0,00"
                    value={form.deliveryFee}
                    onChange={(e) => setForm({ ...form, deliveryFee: e.target.value })}
                  />
                </div>
                <p className={hint}>{fee > 0 ? 'Somada ao total do pedido.' : 'Deixe 0,00 para entrega grátis.'}</p>
              </div>
              <div>
                <label htmlFor="lj-min" className={label}>Pedido mínimo</label>
                <div className={`${input} flex items-center gap-1.5 px-3 ${err('minOrder') ? 'border-[#E8A39C]' : ''}`}>
                  <span className="text-sm text-[#6B6662]">R$</span>
                  <input
                    id="lj-min"
                    inputMode="decimal"
                    className="w-full bg-transparent outline-none pp-mono"
                    placeholder="0,00"
                    value={form.minOrder}
                    onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                  />
                </div>
                <p className={hint}>{min > 0 ? 'O cliente só envia o pedido a partir desse valor.' : 'Sem valor mínimo.'}</p>
              </div>
            </div>
          </section>

          {/* ---------- Pagamento ---------- */}
          <section id="pagamento" className={`${card} p-5 sm:p-6 flex flex-col gap-5 scroll-mt-16`}>
            <SectionTitle icon={I.pix} tone="blue" title="Pagamento via Pix" desc="O QR Code do pedido é gerado com esta chave. O dinheiro cai direto na sua conta." />
            <div>
              <label htmlFor="lj-pix" className={label}>Chave Pix</label>
              <input
                id="lj-pix"
                className={input}
                autoComplete="off"
                value={form.pixKey}
                onChange={(e) => setForm({ ...form, pixKey: e.target.value })}
                placeholder="CPF, CNPJ, e-mail, celular (+55…) ou chave aleatória"
              />
              {pix ? (
                <p className={`text-xs mt-1.5 inline-flex items-center gap-1.5 font-semibold ${pix.ok ? 'text-[#177245]' : 'text-[#8A5A00]'}`}>
                  <Icon d={pix.ok ? I.check : I.alerta} size={13} /> {pix.tipo}
                  {!pix.ok && <span className="font-normal text-[#5E5A57]">— confira se a chave está completa.</span>}
                </p>
              ) : (
                <p className={`${hint} inline-flex items-center gap-1.5 text-[#8A5A00]`}>
                  <Icon d={I.alerta} size={13} /> Sem chave, o cliente precisa combinar o Pix direto com você.
                </p>
              )}
            </div>
            <p className="text-xs text-[#6B6662] bg-[#F6F4F2] rounded-xl px-3.5 py-2.5">
              Taxa da plataforma: o CardápioZap retém <b className="text-[#1D1B1A]">{store.commissionPct.toLocaleString('pt-BR')}%</b> de cada pedido pago.
            </p>
          </section>

          {children}
        </div>

        {/* ---------- Coluna da prévia ---------- */}
        <aside className="lg:sticky lg:top-4 flex flex-col gap-3 order-first lg:order-none">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6662] px-1">Como o cliente vê</p>
          <StorePreviewCard
            name={form.name}
            tagline={store.tagline}
            logoUrl={logo}
            isOpen={store.isOpen}
            deliveryFee={Number.isNaN(fee) ? 0 : fee}
            minOrder={Number.isNaN(min) ? 0 : min}
          />
          <div className={`${card} p-4`}>
            <p className="text-xs font-semibold text-[#6B6662] flex items-center gap-1.5">
              <Icon d={I.link} size={13} /> Link da sua loja
            </p>
            <p className="pp-mono text-sm font-semibold mt-1 break-all">cardapiozap.app/{store.slug}</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                type="button"
                className={`${btnGhost} h-10 text-[13px]`}
                onClick={async () => {
                  if (await copy(linkPublico)) toast.show('Link copiado');
                }}
              >
                <Icon d={copied ? I.check : I.copiar} size={15} /> {copied ? 'Copiado' : 'Copiar'}
              </button>
              <a href={`/${store.slug}`} target="_blank" rel="noopener noreferrer" className={`${btnGhost} h-10 text-[13px]`}>
                Abrir <Icon d={I.externo} size={14} />
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* ---------- Barra de salvar (aparece quando há alteração) ---------- */}
      <div
        className={`fixed inset-x-0 bottom-0 z-30 px-4 transition-transform duration-200 motion-reduce:transition-none ${
          alterado ? 'translate-y-0' : 'translate-y-[120%] pointer-events-none'
        }`}
        style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
        aria-hidden={!alterado}
      >
        <div className="max-w-3xl mx-auto rounded-2xl bg-[#1D1B1A] text-white shadow-[0_20px_50px_rgba(29,27,26,.35)] px-4 sm:px-5 py-3 flex flex-wrap items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#F5A524]" />
          <span className="text-sm font-semibold">Você tem alterações não salvas</span>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              tabIndex={alterado ? 0 : -1}
              onClick={() => {
                setForm(salvo);
                setTentou(false);
              }}
              className="h-10 px-4 rounded-xl text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              Descartar
            </button>
            <button type="button" tabIndex={alterado ? 0 : -1} onClick={salvar} disabled={loading} className={`${btnPrimary} h-10`}>
              {loading ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      </div>

      {toast.node}
    </>
  );
}
