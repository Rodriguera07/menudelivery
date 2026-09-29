'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, I } from '../pp-icons';

const MAX_SIZE = 4 * 1024 * 1024;
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp'];

export default function LogoUploader({
  logoUrl,
  onChange,
}: {
  logoUrl: string | null;
  /** Avisa a prévia da loja assim que a imagem muda. */
  onChange?: (url: string | null) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(logoUrl);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [arrastando, setArrastando] = useState(false);

  async function handleFile(file: File) {
    setError('');
    if (!ACCEPTED.includes(file.type)) return setError('Formato inválido. Use PNG, JPG ou WEBP.');
    if (file.size > MAX_SIZE) return setError('A imagem precisa ter até 4 MB.');

    const local = URL.createObjectURL(file);
    setPreview(local);
    onChange?.(local);
    setLoading(true);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/store/logo', { method: 'POST', body: form });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? 'Não foi possível enviar a imagem.');
      setPreview(logoUrl);
      onChange?.(logoUrl);
      return;
    }
    setPreview(data.logoUrl);
    onChange?.(data.logoUrl);
    router.refresh();
  }

  async function removeLogo() {
    setLoading(true);
    const res = await fetch('/api/store/logo', { method: 'DELETE' });
    setLoading(false);
    if (res.ok) {
      setPreview(null);
      onChange?.(null);
      router.refresh();
    } else {
      setError('Não foi possível remover a logo.');
    }
  }

  return (
    <div>
      <span className="block text-sm font-semibold text-[#1D1B1A] mb-1.5">Logo</span>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={`flex items-center gap-4 rounded-xl border-[1.5px] border-dashed p-3 transition-colors ${
          arrastando ? 'border-[#1D1B1A] bg-[#F6F4F2]' : 'border-[#E4DFDA]'
        }`}
      >
        <div className="relative w-16 h-16 rounded-xl bg-[#F6F4F2] border border-[#ECE7E2] overflow-hidden shrink-0 grid place-items-center text-[#9A948F]">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Logo da loja" className="w-full h-full object-cover" />
          ) : (
            <Icon d={I.imagem} size={22} />
          )}
          {loading && (
            <span className="absolute inset-0 bg-white/70 grid place-items-center">
              <span className="w-5 h-5 rounded-full border-2 border-[#D6CFC8] border-t-[#1D1B1A] animate-spin" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-[#1D1B1A]">
            {preview ? 'Arraste outra imagem para trocar' : 'Arraste a imagem aqui'} ou{' '}
            <button
              type="button"
              disabled={loading}
              onClick={() => inputRef.current?.click()}
              className="font-semibold text-[#C4101D] hover:underline disabled:opacity-60"
            >
              escolha um arquivo
            </button>
          </p>
          <p className="text-xs text-[#6B6662] mt-0.5">PNG, JPG ou WEBP, até 4 MB. Quadrada fica melhor.</p>
        </div>
        {preview && (
          <button
            type="button"
            disabled={loading}
            onClick={removeLogo}
            className="shrink-0 h-9 px-3 rounded-lg text-sm font-semibold text-[#5E5A57] hover:bg-[#F1EEEB] disabled:opacity-60"
          >
            Remover
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </div>
      {error && <p className="text-xs text-[#B42318] mt-1.5">{error}</p>}
    </div>
  );
}
