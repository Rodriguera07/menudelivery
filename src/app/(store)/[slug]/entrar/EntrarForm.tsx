'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogoMark } from '@/components/Logo';
import { LockIcon } from '@/components/icons';

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
    const res = await fetch('/api/auth/customer/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupForm),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? 'Não foi possível criar sua conta.');
    router.push(next);
    router.refresh();
  }

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/auth/customer/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? 'Não foi possível entrar.');
    router.push(next);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-brand-wash flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in-up">
        <Link href={`/${slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted mb-4 hover:text-ink transition-colors">
          ← Voltar ao cardápio
        </Link>

        <div className="bg-surface rounded-3xl shadow-lg overflow-hidden">
          <div
            className="p-6 text-white"
            style={{ background: 'linear-gradient(150deg, #EA1D2C 0%, #F04A2E 55%, #FF8A00 100%)' }}
          >
            <h1 className="font-display text-xl font-extrabold">{storeName}</h1>
            <p className="text-sm opacity-90">{storeTagline}. Faça seu pedido e receba em casa.</p>
          </div>

          <div className="p-6">
            <div className="flex gap-2 mb-5 bg-surface2 rounded-xl p-1">
              <button
                type="button"
                onClick={() => { setTab('signup'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === 'signup' ? 'bg-surface shadow text-ink' : 'text-muted'}`}
              >
                Criar conta
              </button>
              <button
                type="button"
                onClick={() => { setTab('login'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === 'login' ? 'bg-surface shadow text-ink' : 'text-muted'}`}
              >
                Já tenho conta
              </button>
            </div>

            {tab === 'signup' ? (
              <form onSubmit={submitSignup} className="space-y-3">
                <Field label="Nome completo">
                  <input
                    required
                    className="input"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  />
                </Field>
                <Field label="WhatsApp">
                  <input
                    required
                    inputMode="tel"
                    placeholder="(13) 90000-0000"
                    className="input"
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                  />
                </Field>
                <Field label="E-mail (opcional)">
                  <input
                    type="email"
                    className="input"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  />
                </Field>
                <Field label="Senha">
                  <input
                    type="password"
                    required
                    placeholder="mín. 6 caracteres"
                    className="input"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  />
                </Field>
                {error && <p className="text-sm text-brand">{error}</p>}
                <button disabled={loading} className="btn-primary w-full">
                  {loading ? 'Criando…' : 'Criar conta e continuar'}
                </button>
              </form>
            ) : (
              <form onSubmit={submitLogin} className="space-y-3">
                <Field label="WhatsApp ou e-mail">
                  <input
                    required
                    className="input"
                    value={loginForm.identifier}
                    onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                  />
                </Field>
                <Field label="Senha">
                  <input
                    type="password"
                    required
                    className="input"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                </Field>
                {error && <p className="text-sm text-brand">{error}</p>}
                <button disabled={loading} className="btn-primary w-full">
                  {loading ? 'Entrando…' : 'Entrar'}
                </button>
              </form>
            )}
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted mt-4">
              <LockIcon className="w-3.5 h-3.5 shrink-0" />
              Seus dados ficam protegidos e são usados só por esta loja.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-5 opacity-70">
          <LogoMark size={18} />
          <span className="text-xs font-semibold text-muted">Uma loja no CardápioZap</span>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink mb-1">{label}</span>
      {children}
    </label>
  );
}
