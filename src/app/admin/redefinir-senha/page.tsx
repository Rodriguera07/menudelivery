'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bricolage_Grotesque, DM_Sans } from 'next/font/google';

const display = Bricolage_Grotesque({ subsets: ['latin'], weight: ['700', '800'], variable: '--f-display' });
const body = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--f-body' });

function RedefinirSenhaForm() {
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
      const res = await fetch('/api/auth/merchant/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error ?? 'Não foi possível redefinir a senha.');
      setDone(true);
      setTimeout(() => router.push('/admin/login'), 1500);
    } catch {
      setError('Falha de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[420px] bg-white border border-[#ECE7E2] rounded-3xl p-7 sm:p-8 flex flex-col gap-5 shadow-[0_20px_50px_rgba(29,27,26,.06)]">
      {!token ? (
        <p className="text-sm font-semibold text-[#B42318]">Link inválido. Peça um novo link em &quot;esqueci minha senha&quot;.</p>
      ) : done ? (
        <>
          <div className="w-[56px] h-[56px] rounded-full bg-[#E7F6EE] text-[#177245] grid place-items-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7" /></svg>
          </div>
          <h1 style={{ fontFamily: 'var(--f-display)' }} className="text-2xl font-extrabold">Senha redefinida!</h1>
          <p className="text-[15px] text-[#5E5A57]">Levando você para o login…</p>
        </>
      ) : (
        <>
          <div>
            <h1 style={{ fontFamily: 'var(--f-display)' }} className="text-2xl font-extrabold mb-1.5">Crie uma nova senha</h1>
            <p className="text-[15px] text-[#5E5A57]">Escolha uma senha com pelo menos 6 caracteres.</p>
          </div>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-[7px]">
              <span className="text-sm font-semibold">Nova senha</span>
              <input
                type="password"
                autoComplete="new-password"
                required
                placeholder="mín. 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 px-3.5 rounded-[10px] border border-[#E4DFDA] bg-white text-[15px] outline-none transition-colors focus:border-[#1D1B1A] focus:ring-2 focus:ring-[#1D1B1A]/10"
              />
            </label>
            {error && <p role="alert" className="text-sm font-semibold text-[#B42318]">{error}</p>}
            <button
              type="submit"
              disabled={loading || password.length < 6}
              className="h-[52px] rounded-[14px] bg-[#D0101F] hover:bg-[#A90D19] disabled:bg-[#EDE9E5] disabled:text-[#6B6662] text-white text-[15px] font-bold transition-colors"
            >
              {loading ? 'Salvando…' : 'Redefinir senha'}
            </button>
          </form>
          <Link href="/admin/login" className="text-sm font-semibold text-[#5E5A57] hover:text-[#1D1B1A] text-center">
            Voltar para o login
          </Link>
        </>
      )}
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <div className={`${display.variable} ${body.variable} min-h-screen flex items-center justify-center bg-[#F6F4F2] p-4`} style={{ fontFamily: 'var(--f-body),system-ui,sans-serif', color: '#1D1B1A' }}>
      <Suspense fallback={null}>
        <RedefinirSenhaForm />
      </Suspense>
    </div>
  );
}
