'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { LjRoot, Svg, I, ljInput, ljBtnPrimary } from '../ljTheme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function EsqueciSenhaForm({ slug }: { slug: string }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const emailOk = EMAIL_RE.test(email);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!emailOk) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/customer/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return setError(data.error ?? 'Não foi possível enviar o e-mail.');
      }
      setSent(true);
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
          {sent ? (
            <div className="flex flex-col gap-3">
              <h1 className="lj-display text-xl font-extrabold">E-mail enviado</h1>
              <p className="text-sm text-[#5E5A57] leading-relaxed">
                Se <b>{email}</b> estiver cadastrado, você vai receber um link para redefinir sua senha em alguns minutos.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div>
                <h1 className="lj-display text-xl font-extrabold mb-1">Esqueceu sua senha?</h1>
                <p className="text-sm text-[#5E5A57]">Informe o e-mail da sua conta para receber um link de redefinição.</p>
              </div>
              <label className="block">
                <span className="block text-sm font-medium text-[#1D1B1A] mb-1">E-mail</span>
                <input required type="email" className={ljInput} value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              {error && <p role="alert" className="text-sm font-semibold text-[#B42318]">{error}</p>}
              <button disabled={loading || !emailOk} className={`${ljBtnPrimary} w-full`}>
                {loading ? 'Enviando…' : 'Enviar link de redefinição'}
              </button>
            </form>
          )}
        </div>
      </div>
    </LjRoot>
  );
}
