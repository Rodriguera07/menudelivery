'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { formatBRL, parseBRL } from '@/lib/format';
import { Icon, I } from '../pp-icons';
import { card, input, label, hint, btnPrimary, btnGhost, SectionTitle } from '../ui';
import { useToast, useCopy, Switch } from '../ui-client';
import { normalizeDistrict, feeRange, type DeliveryModeValue } from '@/lib/delivery';
import LogoUploader from './LogoUploader';
import BannerUploader from './BannerUploader';
import StorePreviewCard from './StorePreviewCard';

type StoreInfo = {
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  isOpen: boolean;
  whatsapp: string;
  pixKey: string;
  deliveryFee: number;
  deliveryMode: DeliveryModeValue;
  zones: { name: string; fee: number; active: boolean }[];
  minOrder: number;
  slug: string;
};

type Zona = { uid: string; name: string; fee: string; active: boolean };
let uidSeq = 0;
const novoUid = () => `z${++uidSeq}`;

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
      deliveryMode: store.deliveryMode,
      zonas: store.zones.map((z): Zona => ({ uid: novoUid(), name: z.name, fee: semRS(z.fee), active: z.active })),
    }),
    [store.name, store.whatsapp, store.pixKey, store.deliveryFee, store.minOrder, store.deliveryMode, store.zones],
  );
  const [salvo, setSalvo] = useState(inicial);
  const [form, setForm] = useState(inicial);
  const [logo, setLogo] = useState(store.logoUrl);
  const [banner, setBanner] = useState(store.bannerUrl);
  const [loading, setLoading] = useState(false);
  const [tentou, setTentou] = useState(false);
  const toast = useToast();
  const { copy, copied } = useCopy();

  const semUid = (f: typeof form) => ({ ...f, zonas: f.zonas.map((z) => [z.name, z.fee, z.active]) });
  const alterado = JSON.stringify(semUid(form)) !== JSON.stringify(semUid(salvo));

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
  const porBairro = form.deliveryMode === 'BY_DISTRICT';
  const zonasNum = form.zonas.map((z) => ({ name: z.name.trim(), fee: z.fee.trim() ? parseBRL(z.fee) : NaN, active: z.active }));
  const faixa = feeRange(zonasNum.filter((z) => z.fee >= 0));
  const errosZonas = (() => {
    const vistos = new Set<string>();
    for (const z of zonasNum) {
      if (z.name.length < 2) return 'Há um bairro sem nome.';
      if (!(z.fee >= 0)) return `Informe a taxa do bairro ${z.name}.`;
      const k = normalizeDistrict(z.name);
      if (vistos.has(k)) return `O bairro ${z.name} aparece duas vezes.`;
      vistos.add(k);
    }
    if (porBairro && !zonasNum.some((z) => z.active)) return 'Cadastre pelo menos um bairro ativo.';
    return '';
  })();

  const erros = {
    name: form.name.trim().length < 2 ? 'Informe o nome da loja.' : '',
    whatsapp: zapDig.length < 10 ? 'Informe o WhatsApp com DDD, ex.: (13) 99999-9999.' : '',
    deliveryFee: Number.isNaN(fee) || fee < 0 ? 'Valor inválido.' : '',
    minOrder: Number.isNaN(min) || min < 0 ? 'Valor inválido.' : '',
    zonas: porBairro ? errosZonas : '',
  };
  const valido = !Object.values(erros).some(Boolean);
  const err = (k: keyof typeof erros) => (tentou || JSON.stringify(form[k]) !== JSON.stringify(salvo[k])) && erros[k];

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
        deliveryFee: porBairro ? Number(store.deliveryFee) : fee,
        minOrder: min,
        deliveryMode: form.deliveryMode,
        zones: zonasNum.filter((z) => z.name.length >= 2 && z.fee >= 0),
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
            <BannerUploader bannerUrl={store.bannerUrl} onChange={setBanner} />
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
            <SectionTitle icon={I.moto} tone="amber" title="Entrega" desc="Cobre uma taxa única ou um valor diferente para cada bairro." />

            <div role="radiogroup" aria-label="Como cobrar a entrega" className="grid sm:grid-cols-2 gap-2">
              {(
                [
                  ['FIXED', 'Taxa única', 'O mesmo valor para qualquer endereço'],
                  ['BY_DISTRICT', 'Por bairro', 'Cada bairro com seu valor; os demais não recebem entrega'],
                ] as const
              ).map(([v, t, d]) => {
                const on = form.deliveryMode === v;
                return (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setForm({ ...form, deliveryMode: v })}
                    className={`text-left rounded-xl border-[1.5px] px-4 py-3 flex items-start gap-3 transition-colors ${
                      on ? 'border-[#1D1B1A] bg-[#FBFAF8]' : 'border-[#E4DFDA] bg-white hover:border-[#C9C1B9]'
                    }`}
                  >
                    <span className={`mt-0.5 w-[18px] h-[18px] rounded-full border-2 grid place-items-center shrink-0 ${on ? 'border-[#1D1B1A]' : 'border-[#C9C1B9]'}`}>
                      {on && <span className="w-2 h-2 rounded-full bg-[#1D1B1A]" />}
                    </span>
                    <span>
                      <span className="block text-sm font-bold">{t}</span>
                      <span className="block text-xs text-[#6B6662] mt-0.5">{d}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {porBairro ? (
              <BairrosEditor
                zonas={form.zonas}
                onChange={(zonas) => setForm((f) => ({ ...f, zonas }))}
                erro={err('zonas') || ''}
                faixa={faixa}
              />
            ) : (
              <div className="sm:max-w-[calc(50%-8px)]">
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
                <p className={hint}>{fee > 0 ? 'Somada ao total de todo pedido.' : 'Deixe 0,00 para entrega grátis.'}</p>
              </div>
            )}

            <div className="pt-5 border-t border-[#F0ECE8] sm:max-w-[calc(50%-8px)]">
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
              <p className={hint}>{min > 0 ? 'O cliente só envia o pedido a partir desse valor (sem contar a entrega).' : 'Sem valor mínimo.'}</p>
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
            bannerUrl={banner}
            isOpen={store.isOpen}
            deliveryFee={porBairro ? faixa?.min ?? 0 : Number.isNaN(fee) ? 0 : fee}
            entregaPorBairro={porBairro}
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

/* ------------------------------------------------------------------ */
/* Lista de bairros atendidos                                          */
/* ------------------------------------------------------------------ */

/** Lê linhas como "Centro 5,00", "Centro; 5", "Centro - R$ 5,00". */
function lerLista(texto: string) {
  return texto
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const m = l.match(/^(.*?)[\s;:\t=–-]+(?:R\$\s*)?(\d+(?:[.,]\d{1,2})?)\s*$/i);
      return m ? { name: m[1].replace(/[\s;:=–-]+$/, '').trim(), fee: m[2] } : { name: l, fee: '' };
    })
    .filter((z) => z.name.length >= 2);
}

function BairrosEditor({
  zonas,
  onChange,
  erro,
  faixa,
}: {
  zonas: Zona[];
  onChange: (z: Zona[]) => void;
  erro: string;
  faixa: { min: number; max: number } | null;
}) {
  const [nome, setNome] = useState('');
  const [taxa, setTaxa] = useState('');
  const [colar, setColar] = useState(false);
  const [lista, setLista] = useState('');
  const [aviso, setAviso] = useState('');

  const existe = (n: string) => zonas.some((z) => normalizeDistrict(z.name) === normalizeDistrict(n));

  function adicionar() {
    setAviso('');
    const n = nome.trim().replace(/\s+/g, ' ');
    if (n.length < 2) return setAviso('Digite o nome do bairro.');
    if (existe(n)) return setAviso(`${n} já está na lista.`);
    const t = taxa.trim() ? parseBRL(taxa) : NaN;
    if (!(t >= 0)) return setAviso('Digite a taxa, ex.: 5,00 (ou 0 para grátis).');
    onChange([...zonas, { uid: novoUid(), name: n, fee: semRS(t), active: true }]);
    setNome('');
    setTaxa('');
    document.getElementById('bz-nome')?.focus();
  }

  function importar() {
    const itens = lerLista(lista);
    const novos: Zona[] = [];
    let repetidos = 0;
    for (const it of itens) {
      if (existe(it.name) || novos.some((z) => normalizeDistrict(z.name) === normalizeDistrict(it.name))) {
        repetidos++;
        continue;
      }
      const t = it.fee ? parseBRL(it.fee) : NaN;
      novos.push({ uid: novoUid(), name: it.name, fee: t >= 0 ? semRS(t) : '', active: true });
    }
    onChange([...zonas, ...novos]);
    setLista('');
    setColar(false);
    setAviso(
      `${novos.length} bairro(s) adicionado(s)` +
        (repetidos ? `, ${repetidos} repetido(s) ignorado(s)` : '') +
        (novos.some((z) => !z.fee) ? '. Preencha as taxas que ficaram vazias.' : '.'),
    );
  }

  const atualizar = (uid: string, patch: Partial<Zona>) => onChange(zonas.map((z) => (z.uid === uid ? { ...z, ...patch } : z)));

  return (
    <div className="flex flex-col gap-4">
      {/* Adicionar um bairro */}
      <div className="rounded-xl bg-[#F6F4F2] p-3 sm:p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[180px]">
            <label htmlFor="bz-nome" className="block text-xs font-semibold text-[#1D1B1A] mb-1">Bairro</label>
            <input
              id="bz-nome"
              className={input}
              placeholder="Ex.: Centro"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  document.getElementById('bz-taxa')?.focus();
                }
              }}
            />
          </div>
          <div className="w-[130px]">
            <label htmlFor="bz-taxa" className="block text-xs font-semibold text-[#1D1B1A] mb-1">Taxa</label>
            <div className={`${input} flex items-center gap-1.5 px-3`}>
              <span className="text-sm text-[#6B6662]">R$</span>
              <input
                id="bz-taxa"
                inputMode="decimal"
                className="w-full bg-transparent outline-none pp-mono"
                placeholder="5,00"
                value={taxa}
                onChange={(e) => setTaxa(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    adicionar();
                  }
                }}
              />
            </div>
          </div>
          <button type="button" onClick={adicionar} className={`${btnPrimary} h-11`}>
            <Icon d={I.mais} size={16} /> Adicionar
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
          {aviso && <p className="text-xs text-[#5E5A57]">{aviso}</p>}
          <button type="button" onClick={() => setColar((v) => !v)} className="ml-auto text-xs font-semibold text-[#C4101D] hover:underline">
            {colar ? 'Fechar' : 'Colar vários bairros de uma vez'}
          </button>
        </div>
        {colar && (
          <div className="mt-3 flex flex-col gap-2">
            <label htmlFor="bz-lista" className="text-xs text-[#5E5A57]">
              Um bairro por linha, com a taxa no final. Ex.: <span className="pp-mono">Centro 5,00</span> ou{' '}
              <span className="pp-mono">Riviera; 12</span>
            </label>
            <textarea
              id="bz-lista"
              rows={5}
              className={`${input} h-auto py-2.5 pp-mono text-sm leading-relaxed resize-y`}
              placeholder={'Centro 5,00\nBoqueirão 7,00\nRiviera 12,00'}
              value={lista}
              onChange={(e) => setLista(e.target.value)}
            />
            <div className="flex gap-2">
              <button type="button" onClick={importar} disabled={!lista.trim()} className={`${btnPrimary} h-10`}>
                Adicionar {lerLista(lista).length || ''} bairro(s)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista */}
      {zonas.length === 0 ? (
        <p className="text-sm text-[#5E5A57] text-center py-4">Nenhum bairro cadastrado ainda. Adicione os bairros onde você entrega.</p>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold">
              {zonas.length} {zonas.length === 1 ? 'bairro' : 'bairros'}
            </span>
            {faixa && (
              <span className="text-xs text-[#6B6662]">
                · {faixa.min === faixa.max ? formatBRL(faixa.min) : `de ${formatBRL(faixa.min)} a ${formatBRL(faixa.max)}`}
              </span>
            )}
            <button
              type="button"
              onClick={() => onChange([...zonas].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')))}
              className="ml-auto text-xs font-semibold text-[#5E5A57] hover:text-[#1D1B1A]"
            >
              Ordenar A–Z
            </button>
          </div>
          <ul className="rounded-xl border border-[#ECE7E2] divide-y divide-[#F0ECE8] max-h-[420px] overflow-y-auto">
            {zonas.map((z) => {
              const semTaxa = !z.fee.trim() || !(parseBRL(z.fee) >= 0);
              return (
                <li key={z.uid} className={`flex items-center gap-2 px-3 py-2 ${z.active ? '' : 'bg-[#FBFAF8]'}`}>
                  <input
                    aria-label="Nome do bairro"
                    className={`flex-1 min-w-0 h-9 rounded-lg px-2 text-sm bg-transparent outline-none border border-transparent hover:border-[#E4DFDA] focus:border-[#1D1B1A] focus:bg-white ${
                      z.active ? 'font-semibold' : 'text-[#6B6662]'
                    }`}
                    value={z.name}
                    onChange={(e) => atualizar(z.uid, { name: e.target.value })}
                  />
                  <div
                    className={`w-[112px] h-9 rounded-lg border flex items-center gap-1 px-2 bg-white focus-within:border-[#1D1B1A] ${
                      semTaxa ? 'border-[#E8A39C]' : 'border-[#E4DFDA]'
                    }`}
                  >
                    <span className="text-xs text-[#6B6662]">R$</span>
                    <input
                      aria-label={`Taxa para ${z.name}`}
                      inputMode="decimal"
                      className="w-full bg-transparent outline-none pp-mono text-sm"
                      placeholder="0,00"
                      value={z.fee}
                      onChange={(e) => atualizar(z.uid, { fee: e.target.value })}
                    />
                  </div>
                  <Switch
                    size="sm"
                    checked={z.active}
                    label={z.active ? `Pausar entrega em ${z.name}` : `Voltar a entregar em ${z.name}`}
                    onChange={(v) => atualizar(z.uid, { active: v })}
                  />
                  <button
                    type="button"
                    onClick={() => onChange(zonas.filter((x) => x.uid !== z.uid))}
                    aria-label={`Remover ${z.name}`}
                    title="Remover"
                    className="w-8 h-8 rounded-lg grid place-items-center text-[#5E5A57] hover:bg-[#FEECEB] hover:text-[#B42318]"
                  >
                    <Icon d={I.x} size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
          <p className={hint}>
            O cliente escolhe o bairro no carrinho e a taxa entra no total. Bairro pausado (interruptor desligado) some da lista sem
            perder o valor.
          </p>
        </div>
      )}
      {erro && <p className="text-xs text-[#B42318] font-semibold">{erro}</p>}
    </div>
  );
}
