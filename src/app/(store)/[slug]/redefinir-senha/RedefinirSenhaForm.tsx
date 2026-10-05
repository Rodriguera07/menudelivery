'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LjRoot, Svg, I, ljInput, ljBtnPrimary } from '../ljTheme';

function Inner({ slug }: { slug: string }) {
  const router = useRouter();
  const token = useSearchParams().get('token') ?? '';
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/customer/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error ?? 'Não foi possível redefinir a senha.');
      setDone(true);
      setTimeout(() => router.push(`/${slug}/entrar`), 1500);
    } catch {
      setError('Falha de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LjRoot className="flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md lj-fade">
        <Link href={`/${slug}/entrar`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5E5A57] mb-4 hover:text-[#1D1B1A] transition-colors">
          <Svg d={I.voltar} size={16} /> Voltar para o login
        </Link>

        <div className="bg-white rounded-[20px] border border-[#ECE7E2] shadow-[0_12px_32px_rgba(29,27,26,.06)] p-6">
          {!token ? (
            <p role="alert" className="text-sm font-semibold text-[#B42318]">Link inválido. Peça um novo link em &quot;esqueci minha senha&quot;.</p>
          ) : done ? (
            <div className="flex flex-col gap-2">
              <h1 className="lj-display text-xl font-extrabold">Senha redefinida!</h1>
              <p className="text-sm text-[#5E5A57]">Levando você para o login…</p>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div>
                <h1 className="lj-display text-xl font-extrabold mb-1">Crie uma nova senha</h1>
                <p className="text-sm text-[#5E5A57]">Escolha uma senha com pelo menos 6 caracteres.</p>
              </div>
              <label className="block">
                <span className="block text-sm font-medium text-[#1D1B1A] mb-1">Nova senha</span>
                <input required type="password" placeholder="mín. 6 caracteres" className={ljInput} value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
              {error && <p role="alert" className="text-sm font-semibold text-[#B42318]">{error}</p>}
              <button disabled={loading || password.length < 6} className={`${ljBtnPrimary} w-full`}>
                {loading ? 'Salvando…' : 'Redefinir senha'}
              </button>
            </form>
          )}
        </div>
      </div>
    </LjRoot>
  );
}

export default function RedefinirSenhaForm({ slug }: { slug: string }) {
  return (
    <Suspense fallback={null}>
      <Inner slug={slug} />
    </Suspense>
  );
}
