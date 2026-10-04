'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogoMark } from '@/components/Logo';
import { LjRoot, Svg, I, ljInput, ljBtnPrimary } from '../ljTheme';

type Tab = 'signup' | 'login';

export default function EntrarForm({
  slug,
  storeName,
  storeTagline,
  next,
}: {
  slug: string;
  storeName: string;
  storeTagline: string;
  next: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('signup');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [signupForm, setSignupForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });

  async function submitSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/customer/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error ?? 'Não foi possível criar sua conta.');
      router.push(next);
      router.refresh();
    } catch {
      setError('Falha de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error ?? 'Não foi possível entrar.');
      router.push(next);
      router.refresh();
    } catch {
      setError('Falha de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LjRoot className="flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md lj-fade">
        <Link href={`/${slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5E5A57] mb-4 hover:text-[#1D1B1A] transition-colors">
          <Svg d={I.voltar} size={16} /> Voltar ao cardápio
        </Link>

        <div className="bg-white rounded-[20px] border border-[#ECE7E2] shadow-[0_12px_32px_rgba(29,27,26,.06)] overflow-hidden">
          <div className="lj-cover p-6 text-white">
            <h1 className="lj-display text-xl font-extrabold">{storeName}</h1>
            {storeTagline && <p className="text-sm opacity-90 mt-0.5">{storeTagline}. Faça seu pedido e receba em casa.</p>}
          </div>

          <div className="p-6">
            <div className="flex gap-2 mb-5 bg-[#F1EEEB] rounded-xl p-1">
              <button
                type="button"
                onClick={() => { setTab('signup'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === 'signup' ? 'bg-white shadow text-[#1D1B1A]' : 'text-[#5E5A57]'}`}
              >
                Criar conta
              </button>
              <button
                type="button"
                onClick={() => { setTab('login'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === 'login' ? 'bg-white shadow text-[#1D1B1A]' : 'text-[#5E5A57]'}`}
              >
                Já tenho conta
              </button>
            </div>

            {tab === 'signup' ? (
              <form onSubmit={submitSignup} className="space-y-3">
                <Field label="Nome completo">
                  <input
                    required
                    className={ljInput}
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  />
                </Field>
                <Field label="WhatsApp">
                  <input
                    required
                    inputMode="tel"
                    placeholder="(13) 90000-0000"
                    className={ljInput}
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                  />
                </Field>
                <Field label="E-mail (opcional)">
                  <input
                    type="email"
                    className={ljInput}
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  />
                </Field>
                <Field label="Senha">
                  <input
                    type="password"
                    required
                    placeholder="mín. 6 caracteres"
                    className={ljInput}
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  />
                </Field>
                {error && <p role="alert" className="text-sm font-semibold text-[#B42318]">{error}</p>}
                <button disabled={loading} className={`${ljBtnPrimary} w-full`}>
                  {loading ? 'Criando…' : 'Criar conta e continuar'}
                </button>
              </form>
            ) : (
              <form onSubmit={submitLogin} className="space-y-3">
                <Field label="WhatsApp ou e-mail">
                  <input
                    required
                    className={ljInput}
                    value={loginForm.identifier}
                    onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                  />
                </Field>
                <Field label="Senha">
                  <input
                    type="password"
                    required
                    className={ljInput}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                </Field>
                {error && <p role="alert" className="text-sm font-semibold text-[#B42318]">{error}</p>}
                <button disabled={loading} className={`${ljBtnPrimary} w-full`}>
                  {loading ? 'Entrando…' : 'Entrar'}
                </button>
              </form>
            )}
            <p className="flex items-center justify-center gap-1.5 text-xs text-[#5E5A57] mt-4">
              <Svg d={I.cadeado} size={14} />
              Seus dados ficam protegidos e são usados só por esta loja.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-5 opacity-70">
          <LogoMark size={18} />
          <span className="text-xs font-semibold text-[#5E5A57]">Uma loja no Menu Delivery</span>
        </div>
      </div>
    </LjRoot>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[#1D1B1A] mb-1">{label}</span>
      {children}
    </label>
  );
}
