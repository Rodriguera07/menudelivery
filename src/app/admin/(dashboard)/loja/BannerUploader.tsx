'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, I } from '../pp-icons';

// Banner (capa) no topo do cardápio. Mostra como fica no celular e no computador,
// porque a mesma imagem é recortada de jeitos diferentes em cada tela.

const MAX_SIZE = 6 * 1024 * 1024;
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp'];

export default function BannerUploader({
  bannerUrl,
  onChange,
}: {
  bannerUrl: string | null;
  onChange?: (url: string | null) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(bannerUrl);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [loading, setLoading] = useState(false);
  const [arrastando, setArrastando] = useState(false);

  function conferirTamanho(url: string) {
    const img = new Image();
    img.onload = () => {
      const r = img.naturalWidth / img.naturalHeight;
      if (img.naturalWidth < 1000) setAviso(`Imagem pequena (${img.naturalWidth}px de largura) — pode ficar borrada no computador. Ideal: 1600 × 600 px.`);
      else if (r < 1.6) setAviso('Imagem alta demais para banner — as partes de cima e de baixo serão cortadas. Prefira uma imagem deitada (paisagem).');
      else setAviso('');
    };
    img.src = url;
  }

  async function handleFile(file: File) {
    setError('');
    if (!ACCEPTED.includes(file.type)) return setError('Formato inválido. Use PNG, JPG ou WEBP.');
    if (file.size > MAX_SIZE) return setError('A imagem precisa ter até 6 MB.');

    const local = URL.createObjectURL(file);
    setPreview(local);
    conferirTamanho(local);
    onChange?.(local);
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/store/banner', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível enviar o banner.');
        setPreview(bannerUrl);
        onChange?.(bannerUrl);
        return;
      }
      setPreview(data.bannerUrl);
      onChange?.(data.bannerUrl);
      router.refresh();
    } catch {
      setError('Falha de conexão. Tente novamente.');
      setPreview(bannerUrl);
      onChange?.(bannerUrl);
    } finally {
      setLoading(false);
    }
  }

  async function remover() {
    setLoading(true);
    try {
      const res = await fetch('/api/store/banner', { method: 'DELETE' });
      if (!res.ok) return setError('Não foi possível remover o banner.');
      setPreview(null);
      setAviso('');
      onChange?.(null);
      router.refresh();
    } catch {
      setError('Falha de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="block text-sm font-semibold text-[#1D1B1A]">Banner da loja</span>
        <span className="text-xs text-[#6B6662]">(opcional)</span>
      </div>

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
          if (f) handleFile(f);
        }}
        className={`relative rounded-xl border-[1.5px] border-dashed overflow-hidden transition-colors ${
          arrastando ? 'border-[#1D1B1A]' : 'border-[#E4DFDA]'
        }`}
      >
        {preview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Banner da loja" className="w-full aspect-[16/5] object-cover" />
            {loading && (
              <span className="absolute inset-0 bg-white/60 grid place-items-center">
                <span className="w-6 h-6 rounded-full border-2 border-[#D6CFC8] border-t-[#1D1B1A] animate-spin" />
              </span>
            )}
            <div className="absolute bottom-2 right-2 flex gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => inputRef.current?.click()}
                className="h-9 px-3 rounded-lg bg-white/95 text-sm font-semibold shadow disabled:opacity-60"
              >
                Trocar
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={remover}
                className="h-9 px-3 rounded-lg bg-white/95 text-sm font-semibold text-[#B42318] shadow disabled:opacity-60"
              >
                Remover
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full aspect-[16/5] min-h-[120px] flex flex-col items-center justify-center gap-2 text-center bg-[#FBFAF8] hover:bg-[#F6F4F2] transition-colors"
            style={{
              backgroundImage: 'radial-gradient(rgba(29,27,26,.06) 1.2px, transparent 1.3px)',
              backgroundSize: '14px 14px',
            }}
          >
            <span className="w-11 h-11 rounded-xl bg-[#FEECEB] text-[#D0101F] grid place-items-center">
              <Icon d={I.imagem} size={20} />
            </span>
            <span className="text-sm font-semibold">Adicionar banner</span>
            <span className="text-xs text-[#6B6662] px-4">Arraste aqui ou clique · foto dos seus lanches, fachada ou promoção</span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = '';
          }}
        />
      </div>

      {preview && (
        <div className="mt-3 grid grid-cols-[88px_minmax(0,1fr)] gap-3 items-end">
          <figure>
            <div className="w-[88px] h-[40px] rounded-md overflow-hidden border border-[#ECE7E2]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="" className="w-full h-full object-cover" />
            </div>
            <figcaption className="text-[11px] text-[#6B6662] mt-1">No celular</figcaption>
          </figure>
          <figure>
            <div className="h-[40px] rounded-md overflow-hidden border border-[#ECE7E2]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="" className="w-full h-full object-cover" />
            </div>
            <figcaption className="text-[11px] text-[#6B6662] mt-1">No computador</figcaption>
          </figure>
        </div>
      )}

      {error ? (
        <p className="text-xs text-[#B42318] mt-1.5">{error}</p>
      ) : aviso ? (
        <p className="text-xs text-[#8A5A00] mt-1.5 flex items-start gap-1.5">
          <Icon d={I.alerta} size={13} className="mt-px shrink-0" /> {aviso}
        </p>
      ) : (
        <p className="text-xs text-[#6B6662] mt-1.5">
          Tamanho ideal: <b className="pp-mono font-semibold text-[#1D1B1A]">1600 × 600 px</b> (imagem deitada), JPG, PNG ou WEBP até 6 MB. Deixe o
          mais importante no centro — as bordas podem ser cortadas no celular.
        </p>
      )}
    </div>
  );
}
