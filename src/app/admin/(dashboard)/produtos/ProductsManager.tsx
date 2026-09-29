'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { formatBRL, parseBRL } from '@/lib/format';
import { Icon, I } from '../pp-icons';
import { PageHeader, Stat, card, input, label, hint, btnPrimary, btnGhost, btnIcon, EmptyState } from '../ui';
import { Switch, useToast, ConfirmButton } from '../ui-client';

type Product = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  promoPrice: number | null;
  active: boolean;
  sold: number;
  photoUrl: string | null;
};

const MAX_FOTO = 4 * 1024 * 1024;
const TIPOS_FOTO = ['image/png', 'image/jpeg', 'image/webp'];
function checarFoto(f: File) {
  if (!TIPOS_FOTO.includes(f.type)) return 'Formato inválido. Use PNG, JPG ou WEBP.';
  if (f.size > MAX_FOTO) return 'A foto precisa ter até 4 MB.';
  return '';
}
async function enviarFoto(id: string, file: File): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const form = new FormData();
  form.append('file', file);
  try {
    const res = await fetch(`/api/store/products/${id}/photo`, { method: 'POST', body: form });
    const data = await res.json().catch(() => ({}));
    return res.ok ? { ok: true, url: data.photoUrl } : { ok: false, error: data.error ?? 'Não foi possível enviar a foto.' };
  } catch {
    return { ok: false, error: 'Falha de conexão. Tente novamente.' };
  }
}

type Draft = { name: string; category: string; description: string; price: string; promoPrice: string };
const VAZIO: Draft = { name: '', category: '', description: '', price: '', promoPrice: '' };

function normalizeProduct(raw: Product): Product {
  return {
    ...raw,
    price: Number(raw.price),
    promoPrice: raw.promoPrice !== null && raw.promoPrice !== undefined ? Number(raw.promoPrice) : null,
    photoUrl: raw.photoUrl ?? null,
  };
}

const semRS = (v: number) => formatBRL(v).replace('R$', '').trim();

// Cor do quadradinho de cada produto, fixa por categoria.
const TONS = [
  ['#FDEFE3', '#C2410C'],
  ['#E8F1FF', '#1D4ED8'],
  ['#E7F6EE', '#177245'],
  ['#FFF4D6', '#8A5A00'],
  ['#F1ECFF', '#6B3FD4'],
  ['#FEECEB', '#B42318'],
];
function tom(cat: string) {
  let h = 0;
  for (const c of cat) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TONS[h % TONS.length];
}

function descontoPct(p: { price: number; promoPrice: number | null }) {
  if (!p.promoPrice || p.promoPrice >= p.price) return 0;
  return Math.round((1 - p.promoPrice / p.price) * 100);
}

export default function ProductsManager({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [busca, setBusca] = useState('');
  const [cat, setCat] = useState<string>('todas');
  const [status, setStatus] = useState<'todos' | 'ativos' | 'pausados' | 'promo'>('todos');
  const [editor, setEditor] = useState<{ id: string | null } | null>(null);
  const toast = useToast();

  const categorias = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [products],
  );

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return products.filter(
      (p) =>
        (cat === 'todas' || p.category === cat) &&
        (status === 'todos' ||
          (status === 'ativos' && p.active) ||
          (status === 'pausados' && !p.active) ||
          (status === 'promo' && descontoPct(p) > 0)) &&
        (!q || p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q)),
    );
  }, [products, busca, cat, status]);

  const grupos = useMemo(() => {
    const m = new Map<string, Product[]>();
    for (const p of filtrados) m.set(p.category, [...(m.get(p.category) ?? []), p]);
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
  }, [filtrados]);

  const ativos = products.filter((p) => p.active).length;
  const emPromo = products.filter((p) => descontoPct(p) > 0).length;
  const semFoto = products.filter((p) => !p.photoUrl).length;

  async function trocarFoto(p: Product, file: File) {
    const e = checarFoto(file);
    if (e) return toast.show(e, 'erro');
    const local = URL.createObjectURL(file);
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, photoUrl: local } : x)));
    const r = await enviarFoto(p.id, file);
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, photoUrl: r.ok ? r.url : p.photoUrl } : x)));
    toast.show(r.ok ? 'Foto salva' : r.error, r.ok ? 'ok' : 'erro');
  }

  async function updateProduct(id: string, patch: Record<string, unknown>, okMsg = 'Salvo') {
    try {
      const res = await fetch(`/api/store/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.show(data.error ?? 'Não foi possível salvar. Tente de novo.', 'erro');
        return false;
      }
      setProducts((prev) => prev.map((p) => (p.id === id ? normalizeProduct({ ...p, ...data.product }) : p)));
      toast.show(okMsg);
      return true;
    } catch {
      toast.show('Falha de conexão. Tente novamente.', 'erro');
      return false;
    }
  }

  async function deleteProduct(id: string) {
    try {
      const res = await fetch(`/api/store/products/${id}`, { method: 'DELETE' });
      if (!res.ok) return toast.show('Não foi possível remover o produto.', 'erro');
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.show('Produto removido do cardápio');
    } catch {
      toast.show('Falha de conexão. Tente novamente.', 'erro');
    }
  }

  const editando = editor?.id ? products.find((p) => p.id === editor.id) ?? null : null;

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader title="Produtos e preços" subtitle="Tudo o que aparece no seu cardápio. Mudanças aparecem para o cliente na hora.">
        <button type="button" className={btnPrimary} onClick={() => setEditor({ id: null })}>
          <Icon d={I.mais} size={16} /> Novo produto
        </button>
      </PageHeader>

      {products.length === 0 ? (
        <EmptyState
          icon={I.tag}
          title="Seu cardápio está vazio"
          text="Adicione o primeiro produto com nome, categoria e preço. Ele aparece no cardápio da loja assim que você salvar."
        >
          <button type="button" className={btnPrimary} onClick={() => setEditor({ id: null })}>
            <Icon d={I.mais} size={16} /> Adicionar primeiro produto
          </button>
        </EmptyState>
      ) : (
        <>
          <section aria-label="Resumo" className="grid grid-cols-3 gap-3 sm:gap-4">
            <Stat label="No cardápio" value={products.length} />
            <Stat label="Ativos" value={ativos}>
              {products.length - ativos > 0 && <span className="text-xs text-[#6B6662]">{products.length - ativos} pausado(s)</span>}
            </Stat>
            <Stat label="Em promoção" value={emPromo}>
              {semFoto > 0 && <span className="text-xs text-[#8A5A00]">{semFoto} sem foto</span>}
            </Stat>
          </section>

          {/* ---------- Filtros ---------- */}
          <div className="mt-5 flex flex-col gap-3">
            <div className="flex flex-wrap gap-2 items-center">
              <label className="relative flex-1 min-w-[220px] max-w-md">
                <span className="sr-only">Buscar produto</span>
                <Icon d={I.busca} size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6662]" />
                <input
                  id="prod-busca"
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar pelo nome ou descrição"
                  className={`${input} pl-10`}
                />
              </label>
              <div className="inline-flex p-1 rounded-xl bg-white border border-[#ECE7E2]" role="group" aria-label="Situação">
                {(
                  [
                    ['todos', 'Todos'],
                    ['ativos', 'Ativos'],
                    ['pausados', 'Pausados'],
                    ['promo', 'Promoção'],
                  ] as const
                ).map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={status === v}
                    onClick={() => setStatus(v)}
                    className={`h-9 px-3 rounded-lg text-sm font-semibold transition-colors ${
                      status === v ? 'bg-[#1D1B1A] text-white' : 'text-[#5E5A57] hover:text-[#1D1B1A]'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {categorias.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Categorias">
                {['todas', ...categorias].map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={cat === c}
                    onClick={() => setCat(c)}
                    className={`shrink-0 h-9 px-3.5 rounded-full text-sm font-semibold border transition-colors ${
                      cat === c ? 'bg-[#1D1B1A] text-white border-[#1D1B1A]' : 'bg-white text-[#3D3A37] border-[#E4DFDA] hover:border-[#C9C1B9]'
                    }`}
                  >
                    {c === 'todas' ? 'Todas' : c}
                    <span className="pp-mono ml-1.5 text-xs opacity-70">
                      {c === 'todas' ? products.length : products.filter((p) => p.category === c).length}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ---------- Lista ---------- */}
          {grupos.length === 0 ? (
            <div className={`${card} mt-4 py-10 text-center text-sm text-[#5E5A57]`}>
              Nenhum produto encontrado com esses filtros.{' '}
              <button
                type="button"
                className="font-semibold text-[#C4101D] hover:underline"
                onClick={() => {
                  setBusca('');
                  setCat('todas');
                  setStatus('todos');
                }}
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              {grupos.map(([categoria, itens]) => (
                <section key={categoria} className={`${card} overflow-hidden`}>
                  <header className="px-5 py-3 border-b border-[#ECE7E2] flex items-center gap-2 bg-[#FBFAF8]">
                    <h2 className="pp-display text-[15px] font-bold">{categoria}</h2>
                    <span className="pp-mono text-xs text-[#6B6662]">{itens.length}</span>
                  </header>
                  <div className="hidden md:grid grid-cols-[minmax(0,1fr)_120px_140px_72px_64px_84px] gap-4 px-5 pt-3 pb-1 text-xs font-semibold text-[#6B6662]">
                    <span>Produto</span>
                    <span>Preço</span>
                    <span>Promoção</span>
                    <span className="text-right">Vendidos</span>
                    <span>Ativo</span>
                    <span />
                  </div>
                  <ul>
                    {itens.map((p) => (
                      <ProdutoLinha
                        key={p.id}
                        p={p}
                        onPatch={(patch, msg) => updateProduct(p.id, patch, msg)}
                        onEdit={() => setEditor({ id: p.id })}
                        onFoto={(f) => trocarFoto(p, f)}
                        onDelete={() => deleteProduct(p.id)}
                      />
                    ))}
                  </ul>
                </section>
              ))}
              <p className="text-xs text-[#6B6662] px-1">
                Dica: edite o preço direto na lista e aperte Enter (ou clique fora) para salvar. Deixe a promoção vazia para tirar o produto da promoção.
              </p>
            </div>
          )}
        </>
      )}

      {editor && (
        <ProdutoEditor
          produto={editando}
          categorias={categorias}
          onClose={() => setEditor(null)}
          onSaved={(p, criado) => {
            const n = normalizeProduct(p);
            setProducts((prev) => (criado ? [n, ...prev] : prev.map((x) => (x.id === n.id ? n : x))));
            toast.show(criado ? 'Produto adicionado ao cardápio' : 'Produto atualizado');
            setEditor(null);
          }}
        />
      )}

      {toast.node}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Linha de produto                                                     */
/* ------------------------------------------------------------------ */

function ProdutoLinha({
  p,
  onPatch,
  onEdit,
  onDelete,
  onFoto,
}: {
  p: Product;
  onPatch: (patch: Record<string, unknown>, msg?: string) => Promise<boolean>;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onFoto: (f: File) => void;
}) {
  const fotoRef = useRef<HTMLInputElement>(null);
  const [bg, fg] = tom(p.category);
  const desc = descontoPct(p);

  return (
    <li
      className={`px-5 py-4 border-t border-[#F0ECE8] first:border-t-0 grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_120px_140px_72px_64px_84px] gap-x-4 gap-y-3 items-center ${
        p.active ? '' : 'bg-[#FBFAF8]'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 col-span-2 md:col-span-1">
        <button
          type="button"
          onClick={() => fotoRef.current?.click()}
          title={p.photoUrl ? 'Trocar foto' : 'Adicionar foto'}
          aria-label={p.photoUrl ? `Trocar foto de ${p.name}` : `Adicionar foto de ${p.name}`}
          className="group relative w-14 h-14 rounded-xl overflow-hidden shrink-0 grid place-items-center"
          style={p.photoUrl ? undefined : { background: bg, color: fg }}
        >
          {p.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-0.5">
              <Icon d={I.imagem} size={18} />
              <span className="text-[9px] font-bold uppercase tracking-wide">foto</span>
            </span>
          )}
          <span className="absolute inset-0 bg-[#1D1B1A]/55 text-white grid place-items-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
            <Icon d={I.lapis} size={16} />
          </span>
        </button>
        <input
          ref={fotoRef}
          type="file"
          accept={TIPOS_FOTO.join(',')}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFoto(f);
            e.target.value = '';
          }}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-semibold truncate ${p.active ? 'text-[#1D1B1A]' : 'text-[#6B6662]'}`}>{p.name}</span>
            {!p.active && <span className="shrink-0 text-[11px] font-bold text-[#5E5A57] bg-[#F1EEEB] px-2 py-0.5 rounded-full">Pausado</span>}
          </div>
          {p.description && <p className="text-[13px] text-[#6B6662] truncate">{p.description}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 md:contents">
        <span className="md:hidden text-xs text-[#6B6662] w-16">Preço</span>
        <PriceInput
          key={`price-${p.id}-${p.price}`}
          label={`Preço de ${p.name}`}
          value={p.price}
          onSave={(price) => (price === null ? Promise.resolve(false) : onPatch({ price }, 'Preço salvo'))}
          required
        />
      </div>

      <div className="flex items-center gap-2 md:contents">
        <span className="md:hidden text-xs text-[#6B6662] w-16">Promoção</span>
        <div className="flex items-center gap-2">
          <PriceInput
            key={`promo-${p.id}-${p.promoPrice}`}
            label={`Preço promocional de ${p.name}`}
            value={p.promoPrice}
            placeholder="—"
            onSave={(promoPrice) => {
              if (promoPrice !== null && promoPrice >= p.price) return Promise.resolve(false);
              return onPatch({ promoPrice }, promoPrice === null ? 'Promoção removida' : 'Promoção salva');
            }}
            invalido={(v) => v !== null && v >= p.price}
          />
          {desc > 0 && <span className="pp-mono text-[11px] font-bold text-[#177245] bg-[#E7F6EE] px-1.5 py-0.5 rounded-md">-{desc}%</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 md:block md:text-right">
        <span className="md:hidden text-xs text-[#6B6662] w-16">Vendidos</span>
        <span className="pp-mono text-sm">{p.sold}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="md:hidden text-xs text-[#6B6662] w-16">Ativo</span>
        <Switch
          checked={p.active}
          label={p.active ? `Pausar ${p.name}` : `Ativar ${p.name}`}
          onChange={(v) => onPatch({ active: v }, v ? 'Produto de volta ao cardápio' : 'Produto pausado — some do cardápio')}
        />
      </div>

      <div className="flex items-center justify-end gap-1 col-span-2 md:col-span-1">
        <button type="button" className={btnIcon} onClick={onEdit} aria-label={`Editar ${p.name}`} title="Editar">
          <Icon d={I.lapis} size={16} />
        </button>
        <ConfirmButton compact label={`Remover ${p.name}`} question="Remover?" onConfirm={onDelete} />
      </div>
    </li>
  );
}

function PriceInput({
  value,
  placeholder,
  onSave,
  label: aria,
  required,
  invalido,
}: {
  value: number | null;
  placeholder?: string;
  onSave: (value: number | null) => Promise<boolean>;
  label: string;
  required?: boolean;
  invalido?: (v: number | null) => boolean;
}) {
  const inicial = value !== null ? semRS(value) : '';
  const [text, setText] = useState(inicial);
  const [estado, setEstado] = useState<'idle' | 'salvando' | 'erro'>('idle');

  const parsed = text.trim() ? parseBRL(text) : null;
  const ruim = (parsed !== null && (Number.isNaN(parsed) || parsed <= 0)) || (required && parsed === null) || (invalido?.(parsed) ?? false);

  async function commit() {
    if (text.trim() === inicial) return;
    if (ruim) {
      setEstado('erro');
      return;
    }
    setEstado('salvando');
    const ok = await onSave(parsed);
    setEstado(ok ? 'idle' : 'erro');
  }

  return (
    <div
      className={`relative flex items-center h-10 w-[120px] rounded-lg border bg-white transition-colors focus-within:border-[#1D1B1A] ${
        estado === 'erro' || (ruim && text.trim() !== inicial) ? 'border-[#E8A39C]' : 'border-[#E4DFDA]'
      }`}
    >
      <span className="pl-2.5 text-xs text-[#6B6662]">R$</span>
      <input
        aria-label={aria}
        className="w-full h-full bg-transparent px-1.5 pp-mono text-sm outline-none"
        inputMode="decimal"
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setEstado('idle');
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          if (e.key === 'Escape') {
            setText(inicial);
            setEstado('idle');
          }
        }}
      />
      {estado === 'salvando' && <span className="absolute right-2 w-3 h-3 rounded-full border-2 border-[#D6CFC8] border-t-[#1D1B1A] animate-spin" />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Painel lateral: criar / editar produto                               */
/* ------------------------------------------------------------------ */

function ProdutoEditor({
  produto,
  categorias,
  onClose,
  onSaved,
}: {
  produto: Product | null;
  categorias: string[];
  onClose: () => void;
  onSaved: (p: Product, criado: boolean) => void;
}) {
  const [d, setD] = useState<Draft>(
    produto
      ? {
          name: produto.name,
          category: produto.category,
          description: produto.description ?? '',
          price: semRS(produto.price),
          promoPrice: produto.promoPrice !== null ? semRS(produto.promoPrice) : '',
        }
      : VAZIO,
  );
  const [erro, setErro] = useState('');
  const [tentou, setTentou] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const nomeRef = useRef<HTMLInputElement>(null);
  // Foto: arquivo novo escolhido, ou pedido para remover a atual.
  const [foto, setFoto] = useState<{ file: File; url: string } | null>(null);
  const [removerFoto, setRemoverFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState('');
  const [arrastando, setArrastando] = useState(false);
  const fotoInput = useRef<HTMLInputElement>(null);
  const fotoAtual = foto?.url ?? (removerFoto ? null : produto?.photoUrl ?? null);

  function escolherFoto(f: File) {
    const e = checarFoto(f);
    setErroFoto(e);
    if (e) return;
    setFoto({ file: f, url: URL.createObjectURL(f) });
    setRemoverFoto(false);
  }

  const fechar = useRef(onClose);
  fechar.current = onClose;
  useEffect(() => {
    nomeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && fechar.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const preco = d.price.trim() ? parseBRL(d.price) : NaN;
  const promo = d.promoPrice.trim() ? parseBRL(d.promoPrice) : null;
  const erros = {
    name: d.name.trim().length < 2 ? 'Informe o nome do produto.' : '',
    category: !d.category.trim() ? 'Escolha ou digite uma categoria.' : '',
    price: !(preco > 0) ? 'Informe um preço válido, ex.: 8,00' : '',
    promoPrice:
      promo === null ? '' : !(promo > 0) ? 'Promoção inválida.' : preco > 0 && promo >= preco ? 'A promoção precisa ser menor que o preço.' : '',
  };
  const valido = !Object.values(erros).some(Boolean);
  const desc = preco > 0 && promo && promo < preco ? Math.round((1 - promo / preco) * 100) : 0;

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setTentou(true);
    setErro('');
    if (!valido) return;
    setSalvando(true);
    try {
      const body = {
        name: d.name.trim(),
        category: d.category.trim(),
        description: d.description.trim(),
        price: preco,
        promoPrice: promo,
      };
      const res = await fetch(produto ? `/api/store/products/${produto.id}` : '/api/store/products', {
        method: produto ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return setErro(data.error ?? 'Não foi possível salvar o produto.');
      }
      let salvo: Product = produto ? { ...produto, ...data.product } : data.product;
      // Foto vai depois, porque um produto novo só tem id depois de criado.
      if (foto) {
        const r = await enviarFoto(salvo.id, foto.file);
        if (r.ok) salvo = { ...salvo, photoUrl: r.url };
        else setErro(`Produto salvo, mas a foto não foi enviada: ${r.error}`);
      } else if (removerFoto && produto?.photoUrl) {
        await fetch(`/api/store/products/${salvo.id}/photo`, { method: 'DELETE' }).catch(() => {});
        salvo = { ...salvo, photoUrl: null };
      }
      onSaved(salvo, !produto);
    } catch {
      setErro('Falha de conexão. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  const err = (k: keyof typeof erros) => tentou && erros[k];

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="prod-editor-titulo">
      <button type="button" aria-label="Fechar" className="absolute inset-0 bg-[#1D1B1A]/40" onClick={onClose} />
      <form
        onSubmit={salvar}
        noValidate
        className="relative w-full sm:max-w-[480px] h-full bg-[#F6F4F2] shadow-2xl flex flex-col animate-[slidein_.2s_ease-out] motion-reduce:animate-none"
      >
        <style>{'@keyframes slidein{from{transform:translateX(24px);opacity:.6}to{transform:none;opacity:1}}'}</style>
        <header className="px-5 sm:px-6 h-16 shrink-0 bg-white border-b border-[#ECE7E2] flex items-center gap-3">
          <h2 id="prod-editor-titulo" className="pp-display text-lg font-bold">
            {produto ? 'Editar produto' : 'Novo produto'}
          </h2>
          <button type="button" onClick={onClose} className={`${btnIcon} ml-auto`} aria-label="Fechar">
            <Icon d={I.x} size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 flex flex-col gap-5">
          {/* Prévia */}
          <div>
            <p className="text-xs font-semibold text-[#6B6662] mb-2">Como aparece no cardápio</p>
            <div className="bg-white rounded-2xl border border-[#ECE7E2] p-4 flex gap-3">
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <span className="font-semibold text-[15px] truncate">{d.name.trim() || 'Nome do produto'}</span>
                <span className="text-[13px] text-[#5E5A57] line-clamp-2">{d.description.trim() || 'Descrição: recheio, tamanho, peso…'}</span>
                <div className="flex items-baseline gap-2 mt-1">
                  {desc > 0 ? (
                    <>
                      <span className="pp-mono font-semibold text-[#177245]">{formatBRL(promo!)}</span>
                      <span className="pp-mono text-xs text-[#6B6662] line-through">{formatBRL(preco)}</span>
                      <span className="text-[11px] font-bold text-[#177245] bg-[#E7F6EE] px-1.5 rounded">-{desc}%</span>
                    </>
                  ) : (
                    <span className="pp-mono font-semibold">{preco > 0 ? formatBRL(preco) : 'R$ 0,00'}</span>
                  )}
                </div>
              </div>
              <div
                className="w-20 h-20 rounded-xl grid place-items-center shrink-0 pp-display font-bold text-2xl overflow-hidden"
                style={fotoAtual ? undefined : { background: tom(d.category || 'x')[0], color: tom(d.category || 'x')[1] }}
              >
                {fotoAtual ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fotoAtual} alt="" className="w-full h-full object-cover" />
                ) : (
                  d.name.trim()[0]?.toUpperCase() ?? <Icon d={I.imagem} size={22} />
                )}
              </div>
            </div>
          </div>

          <div>
            <span className={label}>Foto</span>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setArrastando(true);
              }}
              onDragLeave={() => setArrastando(false)}
              onDrop={(e) => {
                e.preventDefault();
                setArrastando(false);
                const f = e.dataTransfer.files?.[0];
                if (f) escolherFoto(f);
              }}
              className={`rounded-2xl border-[1.5px] border-dashed overflow-hidden transition-colors ${
                arrastando ? 'border-[#1D1B1A] bg-white' : 'border-[#D6CFC8] bg-white'
              }`}
            >
              {fotoAtual ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fotoAtual} alt="Foto do produto" className="w-full aspect-[4/3] object-cover" />
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <button type="button" onClick={() => fotoInput.current?.click()} className="h-9 px-3 rounded-lg bg-white/95 text-sm font-semibold shadow">
                      Trocar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFoto(null);
                        setRemoverFoto(true);
                      }}
                      className="h-9 px-3 rounded-lg bg-white/95 text-sm font-semibold text-[#B42318] shadow"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fotoInput.current?.click()}
                  className="w-full py-7 flex flex-col items-center gap-2 text-center hover:bg-[#FBFAF8]"
                >
                  <span className="w-12 h-12 rounded-xl bg-[#FEECEB] text-[#D0101F] grid place-items-center">
                    <Icon d={I.imagem} size={22} />
                  </span>
                  <span className="text-sm font-semibold">Adicionar foto</span>
                  <span className="text-xs text-[#6B6662]">Arraste aqui ou clique · PNG, JPG ou WEBP até 4 MB</span>
                </button>
              )}
            </div>
            <input
              ref={fotoInput}
              type="file"
              accept={TIPOS_FOTO.join(',')}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) escolherFoto(f);
                e.target.value = '';
              }}
            />
            {erroFoto ? (
              <p className="text-xs text-[#B42318] mt-1.5">{erroFoto}</p>
            ) : (
              <p className={hint}>Foto bonita vende mais: use luz natural e mostre o produto de perto.</p>
            )}
          </div>

          <div>
            <label htmlFor="pe-nome" className={label}>Nome</label>
            <input
              ref={nomeRef}
              id="pe-nome"
              className={`${input} ${err('name') ? 'border-[#E8A39C]' : ''}`}
              placeholder="Ex.: Risoles de camarão"
              value={d.name}
              onChange={(e) => setD({ ...d, name: e.target.value })}
            />
            {err('name') && <p className="text-xs text-[#B42318] mt-1.5">{erros.name}</p>}
          </div>

          <div>
            <label htmlFor="pe-cat" className={label}>Categoria</label>
            <input
              id="pe-cat"
              list="pe-cats"
              className={`${input} ${err('category') ? 'border-[#E8A39C]' : ''}`}
              placeholder="Ex.: Salgados"
              value={d.category}
              onChange={(e) => setD({ ...d, category: e.target.value })}
            />
            <datalist id="pe-cats">
              {categorias.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {categorias.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {categorias.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setD({ ...d, category: c })}
                    className={`h-8 px-3 rounded-full text-xs font-semibold border transition-colors ${
                      d.category === c ? 'bg-[#1D1B1A] text-white border-[#1D1B1A]' : 'bg-white text-[#3D3A37] border-[#E4DFDA] hover:border-[#C9C1B9]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            {err('category') && <p className="text-xs text-[#B42318] mt-1.5">{erros.category}</p>}
          </div>

          <div>
            <label htmlFor="pe-desc" className={label}>
              Descrição <span className="font-normal text-[#6B6662]">(opcional)</span>
            </label>
            <textarea
              id="pe-desc"
              rows={3}
              maxLength={240}
              className={`${input} h-auto py-2.5 resize-none leading-relaxed`}
              placeholder="Recheio, tamanho, peso, quantas pessoas serve…"
              value={d.description}
              onChange={(e) => setD({ ...d, description: e.target.value })}
            />
            <p className={`${hint} text-right pp-mono`}>{d.description.length}/240</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pe-preco" className={label}>Preço</label>
              <div className={`${input} flex items-center gap-1.5 px-3 ${err('price') ? 'border-[#E8A39C]' : ''}`}>
                <span className="text-sm text-[#6B6662]">R$</span>
                <input
                  id="pe-preco"
                  inputMode="decimal"
                  placeholder="8,00"
                  className="w-full bg-transparent outline-none pp-mono"
                  value={d.price}
                  onChange={(e) => setD({ ...d, price: e.target.value })}
                />
              </div>
              {err('price') && <p className="text-xs text-[#B42318] mt-1.5">{erros.price}</p>}
            </div>
            <div>
              <label htmlFor="pe-promo" className={label}>
                Promoção <span className="font-normal text-[#6B6662]">(opcional)</span>
              </label>
              <div className={`${input} flex items-center gap-1.5 px-3 ${erros.promoPrice ? 'border-[#E8A39C]' : ''}`}>
                <span className="text-sm text-[#6B6662]">R$</span>
                <input
                  id="pe-promo"
                  inputMode="decimal"
                  placeholder="—"
                  className="w-full bg-transparent outline-none pp-mono"
                  value={d.promoPrice}
                  onChange={(e) => setD({ ...d, promoPrice: e.target.value })}
                />
              </div>
              {erros.promoPrice ? (
                <p className="text-xs text-[#B42318] mt-1.5">{erros.promoPrice}</p>
              ) : desc > 0 ? (
                <p className="text-xs text-[#177245] font-semibold mt-1.5">{desc}% de desconto</p>
              ) : null}
            </div>
          </div>

          {erro && <p role="alert" className="text-sm text-[#7A1A12] bg-[#FEECEB] rounded-xl px-3.5 py-2.5">{erro}</p>}
        </div>

        <footer className="shrink-0 px-5 sm:px-6 py-4 bg-white border-t border-[#ECE7E2] flex gap-2" style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}>
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancelar
          </button>
          <button type="submit" disabled={salvando} className={`${btnPrimary} flex-1`}>
            {salvando ? 'Salvando…' : produto ? 'Salvar alterações' : 'Adicionar ao cardápio'}
          </button>
        </footer>
      </form>
    </div>
  );
}
