'use client';

import { Suspense, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bricolage_Grotesque, DM_Sans, IBM_Plex_Mono } from 'next/font/google';

/* ------------------------------------------------------------------ */
/* Fontes + estilos base                                               */
/* ------------------------------------------------------------------ */

const display = Bricolage_Grotesque({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--f-display' });
const body = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--f-body' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500', '600'], variable: '--f-mono' });

const CSS = `
.lg-root{font-family:var(--f-body),system-ui,sans-serif;color:#1D1B1A;background:#F6F4F2;color-scheme:light}
.lg-root button{font-family:inherit;cursor:pointer}
.lg-root button:disabled{cursor:progress}
.lg-root :focus-visible{outline:2px solid #1D4ED8;outline-offset:2px}
.lg-display{font-family:var(--f-display),var(--f-body),sans-serif}
.lg-mono{font-family:var(--f-mono),ui-monospace,monospace;font-variant-numeric:tabular-nums}
.lg-cover{background-color:#C8101E;background-image:radial-gradient(rgba(255,255,255,.14) 1.2px,transparent 1.3px);background-size:20px 20px}
.lg-inp{height:48px;border:1.5px solid #E4DFDA;border-radius:12px;background:#fff;display:flex;align-items:center;gap:10px;padding:0 14px;color:#6B6662;transition:border-color .15s,box-shadow .15s}
.lg-inp:focus-within{border-color:#1D1B1A;box-shadow:0 0 0 4px rgba(29,27,26,.06)}
.lg-inp input{border:0;outline:none;background:transparent;font:inherit;font-size:16px;color:#1D1B1A;flex:1;min-width:0;height:100%}
.lg-inp input:focus-visible{outline:none}
.lg-pulse{animation:lg-pulse 1.6s ease-in-out infinite}@keyframes lg-pulse{50%{opacity:.35}}
.lg-spin{animation:lg-spin .8s linear infinite}@keyframes lg-spin{to{transform:rotate(360deg)}}
.lg-rise{animation:lg-rise .35s ease-out}@keyframes lg-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.lg-pulse,.lg-spin,.lg-rise{animation:none}}
`;

/* ------------------------------------------------------------------ */
/* Utilitários                                                         */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CATEGORIAS = ['Lanches', 'Salgados e doces', 'Pizza', 'Marmitas', 'Açaí', 'Outros'];
const brl = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const slugify = (s: string) =>
  s.normalize('NFD').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const mascaraTelefone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};
const forcaSenha = (p: string) => {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p) || p.length >= 12) s++;
  return p.length ? Math.max(1, s) : 0;
};
const FORCA = [
  { cor: '#E4DFDA', texto: 'Use pelo menos 8 caracteres', txt: '#5E5A57' },
  { cor: '#B42318', texto: 'Senha fraca', txt: '#B42318' },
  { cor: '#E8890C', texto: 'Senha razoável', txt: '#8A5A00' },
  { cor: '#1D4ED8', texto: 'Senha boa', txt: '#1D4ED8' },
  { cor: '#177245', texto: 'Senha forte', txt: '#177245' },
];

/* ------------------------------------------------------------------ */
/* Ícones                                                              */
/* ------------------------------------------------------------------ */

const Svg = ({ d, size = 18, sw = 2, className }: { d: string[]; size?: number; sw?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    {d.map((p) => (
      <path key={p} d={p} />
    ))}
  </svg>
);
const I = {
  whats: ['M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5Z'],
  logo: ['M5 10h14l-.9 9.4a2.3 2.3 0 0 1-2.3 2.1H8.2a2.3 2.3 0 0 1-2.3-2.1L5 10Z', 'M8.8 10V7.6a3.2 3.2 0 0 1 6.4 0V10'],
  escudo: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z', 'm9 12 2 2 4-4'],
  pix: ['M12 2 2 12l10 10 10-10Z', 'm8 12 4-4 4 4-4 4Z'],
  painel: ['M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z', 'M3 10h18M9 4v16'],
  email: ['M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z', 'm3 7 9 6 9-6'],
  cadeado: ['M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z', 'M8 11V7a4 4 0 0 1 8 0v4'],
  olho: ['M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
  olhoOff: ['M3 3l18 18', 'M10.6 5.1A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6C3.8 8.4 2 12 2 12s4 7 10 7a9.7 9.7 0 0 0 5.4-1.6', 'M9.9 9.9a3 3 0 0 0 4.2 4.2'],
  check: ['m5 12 5 5 9-10'],
  loja: ['M3 9l1.5-5h15L21 9', 'M4 9v11h16V9'],
  link: ['M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1', 'M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1'],
  seta: ['M5 12h14', 'm13 6 6 6-6 6'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 21a8 8 0 0 1 16 0'],
};

/* ------------------------------------------------------------------ */
/* Prévia animada (lado esquerdo) — apenas ilustrativa                 */
/* ------------------------------------------------------------------ */

const PREVIA = [
  { code: '#131', nome: 'Beatriz M.', cents: 3890, itens: '1× X-Tudo · 1× Coca-Cola lata', pag: 'Pago via Pix' },
  { code: '#130', nome: 'Rafael T.', cents: 5200, itens: '2× X-Bacon', pag: 'Cartão na entrega' },
  { code: '#129', nome: 'Ana Clara', cents: 4290, itens: '1× X-Salada · 1× Batata frita', pag: 'Pago via Pix' },
  { code: '#128', nome: 'João Pedro', cents: 1850, itens: '3× Coxinha', pag: 'Dinheiro · troco p/ R$ 20' },
  { code: '#127', nome: 'Marcos S.', cents: 6500, itens: '2× X-Tudo · 1× Guaraná 2L', pag: 'Pago via Pix' },
];
const STATUS = [
  { t: 'Novo', c: 'text-[#B54708] bg-[#FEF0E6]' },
  { t: 'Preparando', c: 'text-[#1D4ED8] bg-[#EAF1FF]' },
  { t: 'Saiu p/ entrega', c: 'text-[#6B3FD4] bg-[#F1ECFF]' },
  { t: 'Entregue', c: 'text-[#177245] bg-[#E7F6EE]' },
];

function PainelMarketing() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setTick((t) => t + 1), 2600);
    return () => clearInterval(id);
  }, []);
  const t = tick % PREVIA.length;
  const wa = PREVIA[t];

  return (
    <aside className="lg-cover hidden lg:flex w-[44%] max-w-[640px] shrink-0 px-14 py-12 flex-col gap-9 text-white relative overflow-hidden">
      <div className="flex items-center gap-2.5">
        <div className="w-[38px] h-[38px] rounded-[11px] bg-white text-[#D0101F] grid place-items-center">
          <Svg d={I.logo} size={20} sw={2.2} />
        </div>
        <span className="lg-display text-xl font-extrabold">Menu Delivery</span>
      </div>

      <div className="flex flex-col gap-3.5">
        <h1 className="lg-display text-[46px] leading-[1.04] font-extrabold tracking-[-.02em]">
          Sua loja online,
          <br />
          no ar em minutos.
        </h1>
        <p className="text-[17px] leading-relaxed text-[#FFE4E1] max-w-[440px]">
          Cardápio, pedidos e Pix num painel simples — e cada pedido chega formatado no WhatsApp da sua loja.
        </p>
      </div>

      <div className="relative h-[330px]" aria-hidden="true">
        <div className="absolute left-0 top-0 w-[440px] bg-white text-[#1D1B1A] rounded-[18px] p-[18px] flex flex-col gap-2.5 shadow-[0_24px_60px_rgba(90,6,12,.35)]">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold">Pedidos de hoje</span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#177245] bg-[#E7F6EE] px-2 py-0.5 rounded-full">
              <span className="lg-pulse w-1.5 h-1.5 rounded-full bg-[#177245]" />
              ao vivo
            </span>
            <span className="lg-mono ml-auto text-[13px] font-semibold">{brl(18640 + t * 3890)}</span>
          </div>
          {[0, 1, 2, 3].map((i) => {
            const o = PREVIA[(t + i) % PREVIA.length];
            return (
              <div key={i} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl ${i === 0 ? 'bg-[#FFF6F0]' : 'bg-[#F7F5F3]'}`}>
                <span className="lg-mono text-xs font-semibold text-[#5E5A57]">{o.code}</span>
                <span className="text-[13px] font-semibold flex-1">{o.nome}</span>
                <span className="lg-mono text-[13px] font-semibold">{brl(o.cents)}</span>
                <span className={`w-[104px] text-center text-[11px] font-bold py-0.5 rounded-full ${STATUS[i].c}`}>{STATUS[i].t}</span>
              </div>
            );
          })}
        </div>

        <div key={t} className="lg-rise absolute right-0 top-[176px] w-[250px] bg-white text-[#1D1B1A] rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(90,6,12,.35)]">
          <div className="bg-[#177245] text-white px-3 py-2.5 flex items-center gap-2 text-xs font-bold">
            <Svg d={I.whats} size={14} sw={2.2} /> WhatsApp da loja
            <span className="ml-auto font-medium opacity-85">agora</span>
          </div>
          <div className="p-3 bg-[#F2EFE9]">
            <div className="bg-white rounded-[10px] px-3 py-2.5 text-[12.5px] leading-normal flex flex-col gap-0.5">
              <b>Novo pedido {wa.code}</b>
              <span>{wa.itens}</span>
              <span className="lg-mono">Total: {brl(wa.cents)}</span>
              <span className="text-[#177245] font-semibold">{wa.pag}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-x-5 gap-y-3.5">
        <Beneficio icon={I.escudo}>Dados de cada loja isolados e protegidos</Beneficio>
        <Beneficio icon={I.whats}>Pedido formatado direto no seu WhatsApp</Beneficio>
        <Beneficio icon={I.pix}>Pix cai direto na sua conta</Beneficio>
        <Beneficio icon={I.painel}>Painel de pedidos em tempo real</Beneficio>
      </div>
    </aside>
  );
}

function Beneficio({ icon, children }: { icon: string[]; children: ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-[34px] h-[34px] shrink-0 rounded-[10px] bg-white/15 grid place-items-center">
        <Svg d={icon} size={17} />
      </div>
      <span className="text-sm leading-snug text-[#FFF1EF]">{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Campos                                                              */
/* ------------------------------------------------------------------ */

function Campo({ id, label, extra, erro, children }: { id: string; label: string; extra?: ReactNode; erro?: string | false; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[7px]">
      <div className="flex items-baseline">
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
        </label>
        {extra && <span className="ml-auto">{extra}</span>}
      </div>
      {children}
      {erro && (
        <span id={`${id}-erro`} role="alert" className="text-[13px] text-[#B42318]">
          {erro}
        </span>
      )}
    </div>
  );
}

function CampoSenha({ id, value, onChange, auto, placeholder, invalido }: { id: string; value: string; onChange: (v: string) => void; auto: string; placeholder: string; invalido?: boolean }) {
  const [ver, setVer] = useState(false);
  return (
    <div className="lg-inp" style={invalido ? { borderColor: '#E8A39C' } : undefined}>
      <Svg d={I.cadeado} />
      <input
        id={id}
        type={ver ? 'text' : 'password'}
        autoComplete={auto}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalido || undefined}
        aria-describedby={invalido ? `${id}-erro` : undefined}
      />
      <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? 'Ocultar senha' : 'Mostrar senha'} className="w-9 h-9 -mr-2 rounded-lg grid place-items-center text-[#5E5A57] hover:bg-[#F1EEEB]">
        <Svg d={ver ? I.olhoOff : I.olho} />
      </button>
    </div>
  );
}

function BotaoPrincipal({ carregando, children, onClick, type = 'button', className = '', disabled }: { carregando?: boolean; children: ReactNode; onClick?: () => void; type?: 'button' | 'submit'; className?: string; disabled?: boolean }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={carregando || disabled}
      className={`h-[52px] rounded-[14px] bg-[#D0101F] hover:bg-[#A90D19] disabled:bg-[#B8303A] text-white text-base font-bold flex items-center justify-center gap-2.5 transition-colors active:scale-[.99] disabled:opacity-70 ${className}`}
    >
      {carregando && <span className="lg-spin w-[18px] h-[18px] rounded-full border-[2.5px] border-white/35 border-t-white" />}
      {children}
    </button>
  );
}

function PassoBolinha({ n, ativo, rotulo }: { n: number; ativo: boolean; rotulo: string }) {
  return (
    <>
      <span className={`lg-mono w-[26px] h-[26px] rounded-full grid place-items-center text-xs font-semibold transition-colors ${ativo ? 'bg-[#D0101F] text-white' : 'bg-[#F1EEEB] text-[#5E5A57]'}`}>{n}</span>
      <span className={`text-[13px] font-semibold ${ativo ? 'text-[#1D1B1A]' : 'text-[#6B6662]'}`}>{rotulo}</span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

function LoginLojista() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modo, setModo] = useState<'login' | 'cadastro'>(searchParams.get('tab') === 'signup' ? 'cadastro' : 'login');
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [tentou, setTentou] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erroServidor, setErroServidor] = useState('');
  const [concluido, setConcluido] = useState(false);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nomeLoja, setNomeLoja] = useState('');
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [telefone, setTelefone] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [termos, setTermos] = useState(false);

  const [twoFactorStep, setTwoFactorStep] = useState(false);
  const [twoFactorWarning, setTwoFactorWarning] = useState(false);
  const [code, setCode] = useState('');

  const dominio = typeof window !== 'undefined' ? window.location.host : 'menudelivery.app';

  const emailOk = EMAIL_RE.test(email);
  const slug = slugify(nomeLoja) || 'sua-loja';
  const digitos = telefone.replace(/\D/g, '');
  const etapa1Ok = nomeLoja.trim().length >= 2 && digitos.length >= 10;
  const etapa2Ok = emailOk && senha.length >= 8 && nomeResponsavel.trim().length >= 2 && termos;
  const forca = forcaSenha(senha);
  const ehLogin = modo === 'login';

  const trocarModo = (m: 'login' | 'cadastro') => {
    setModo(m);
    setTentou(false);
    setErroServidor('');
    setEtapa(1);
    setTwoFactorStep(false);
  };

  const entrar = async (e: FormEvent) => {
    e.preventDefault();
    setTentou(true);
    if (!(emailOk && senha)) return;
    setCarregando(true);
    setErroServidor('');
    try {
      const res = await fetch('/api/auth/merchant/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: senha }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setErroServidor(data.error ?? 'Não foi possível entrar.');
      if (data.twoFactorRequired) {
        setTwoFactorStep(true);
        setTwoFactorWarning(!data.whatsappSent);
        return;
      }
      setConcluido(true);
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 900);
    } catch {
      setErroServidor('Falha de conexão. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const confirmarCodigo = async (e: FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErroServidor('');
    try {
      const res = await fetch('/api/auth/merchant/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setErroServidor(data.error ?? 'Não foi possível confirmar o código.');
      setConcluido(true);
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 900);
    } catch {
      setErroServidor('Falha de conexão. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const reenviarCodigo = async () => {
    setErroServidor('');
    try {
      const res = await fetch('/api/auth/merchant/resend-2fa', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setErroServidor(data.error ?? 'Não foi possível reenviar o código.');
      setTwoFactorWarning(!data.whatsappSent);
    } catch {
      setErroServidor('Falha de conexão. Tente novamente.');
    }
  };

  const continuar = () => {
    if (etapa1Ok) {
      setEtapa(2);
      setTentou(false);
    } else setTentou(true);
  };

  const criar = async (e: FormEvent) => {
    e.preventDefault();
    setTentou(true);
    if (!etapa2Ok) return;
    setCarregando(true);
    setErroServidor('');
    try {
      const res = await fetch('/api/auth/merchant/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: nomeLoja.trim(),
          category: categoria,
          ownerName: nomeResponsavel.trim(),
          whatsapp: digitos,
          email,
          password: senha,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setErroServidor(data.error ?? 'Não foi possível criar a loja.');
      setConcluido(true);
      setTimeout(() => {
        router.push('/admin/bem-vindo');
        router.refresh();
      }, 900);
    } catch {
      setErroServidor('Falha de conexão. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={`lg-root ${display.variable} ${body.variable} ${mono.variable} min-h-screen flex`}>
      <style>{CSS}</style>
      <PainelMarketing />

      <main className="flex-1 min-w-0 px-5 sm:px-12 py-8 flex flex-col">
        <div className="flex items-center gap-2 text-sm text-[#5E5A57]">
          <div className="lg:hidden flex items-center gap-2 mr-auto">
            <div className="w-8 h-8 rounded-[9px] bg-[#D0101F] text-white grid place-items-center">
              <Svg d={I.logo} size={17} sw={2.2} />
            </div>
            <span className="lg-display text-lg font-extrabold text-[#1D1B1A]">Menu Delivery</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center py-8">
          <div className="w-full max-w-[460px] flex flex-col gap-[18px]">
            {concluido ? (
              <section className="lg-rise bg-white border border-[#ECE7E2] rounded-3xl px-8 py-10 flex flex-col items-center gap-3.5 text-center shadow-[0_20px_50px_rgba(29,27,26,.06)]">
                <div className="w-[68px] h-[68px] rounded-full bg-[#E7F6EE] text-[#177245] grid place-items-center">
                  <Svg d={I.check} size={32} sw={2.4} />
                </div>
                <h2 className="lg-display text-[26px] font-extrabold">{ehLogin ? 'Login feito!' : 'Sua loja está no ar!'}</h2>
                <p className="text-[15px] leading-relaxed text-[#5E5A57] max-w-[340px]">
                  {ehLogin ? 'Abrindo seu painel de pedidos…' : `Seu cardápio já está em ${dominio}/${slug}. Agora é só cadastrar os produtos.`}
                </p>
              </section>
            ) : (
              <section className="bg-white border border-[#ECE7E2] rounded-3xl p-6 sm:p-8 flex flex-col gap-[22px] shadow-[0_20px_50px_rgba(29,27,26,.06)]">
                {twoFactorStep ? (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <h2 className="lg-display text-[28px] font-extrabold tracking-[-.01em]">Confirme sua identidade</h2>
                      <p className="text-[15px] text-[#5E5A57]">Enviamos um código de 6 dígitos pro WhatsApp da sua loja.</p>
                    </div>
                    {twoFactorWarning && (
                      <div role="alert" className="text-sm text-[#7A1A12] bg-[#FEECEB] border border-[#F4C7C2] rounded-xl px-3.5 py-2.5">
                        Não conseguimos confirmar o envio do código pro WhatsApp. Se não chegar, tente reenviar.
                      </div>
                    )}
                    {erroServidor && (
                      <div role="alert" className="text-sm text-[#7A1A12] bg-[#FEECEB] border border-[#F4C7C2] rounded-xl px-3.5 py-2.5">
                        {erroServidor}
                      </div>
                    )}
                    <form onSubmit={confirmarCodigo} className="flex flex-col gap-4">
                      <Campo id="lg-code" label="Código de verificação">
                        <div className="lg-inp">
                          <input
                            id="lg-code"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="000000"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="lg-mono text-center tracking-[0.5em] text-lg"
                          />
                        </div>
                      </Campo>
                      <BotaoPrincipal type="submit" carregando={carregando} disabled={code.length !== 6}>
                        {carregando ? 'Confirmando…' : 'Confirmar e entrar'}
                      </BotaoPrincipal>
                      <button type="button" onClick={reenviarCodigo} className="text-sm font-semibold text-[#C4101D] hover:underline">
                        Reenviar código
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <h2 className="lg-display text-[28px] font-extrabold tracking-[-.01em]">{ehLogin ? 'Bem-vindo de volta' : 'Crie sua loja'}</h2>
                      <p className="text-[15px] text-[#5E5A57]">{ehLogin ? 'Entre para ver seus pedidos e gerenciar o cardápio.' : 'Leva menos de 2 minutos. Você pode editar tudo depois.'}</p>
                    </div>

                    <div role="tablist" aria-label="Acesso" className="relative grid grid-cols-2 p-1 bg-[#F1EEEB] rounded-[14px]">
                      <span aria-hidden="true" className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-[10px] bg-white shadow-[0_1px_3px_rgba(29,27,26,.12)] transition-transform duration-200 ${ehLogin ? '' : 'translate-x-full'}`} />
                      {(['login', 'cadastro'] as const).map((m) => (
                        <button key={m} role="tab" aria-selected={modo === m} onClick={() => trocarModo(m)} className={`relative h-[42px] rounded-[10px] text-sm font-bold transition-colors ${modo === m ? 'text-[#1D1B1A]' : 'text-[#5E5A57]'}`}>
                          {m === 'login' ? 'Entrar' : 'Criar minha loja'}
                        </button>
                      ))}
                    </div>

                    {erroServidor && (
                      <div role="alert" className="text-sm text-[#7A1A12] bg-[#FEECEB] border border-[#F4C7C2] rounded-xl px-3.5 py-2.5">
                        {erroServidor}
                      </div>
                    )}

                    {ehLogin ? (
                      <form key="login" onSubmit={entrar} noValidate className="lg-rise flex flex-col gap-4">
                        <Campo id="lg-email" label="E-mail da loja" erro={tentou && !emailOk && 'Digite um e-mail válido.'}>
                          <div className="lg-inp" style={tentou && !emailOk ? { borderColor: '#E8A39C' } : emailOk ? { borderColor: '#BFE5CF' } : undefined}>
                            <Svg d={I.email} />
                            <input id="lg-email" type="email" autoComplete="email" placeholder="voce@sualoja.com.br" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={(tentou && !emailOk) || undefined} />
                            {emailOk && <Svg d={I.check} sw={2.4} className="text-[#177245]" />}
                          </div>
                        </Campo>
                        <Campo id="lg-pass" label="Senha" erro={tentou && !senha && 'Digite sua senha.'}>
                          <CampoSenha id="lg-pass" value={senha} onChange={setSenha} auto="current-password" placeholder="Sua senha" invalido={tentou && !senha} />
                        </Campo>
                        <BotaoPrincipal type="submit" carregando={carregando}>
                          {carregando ? 'Entrando…' : 'Entrar no painel'}
                        </BotaoPrincipal>
                      </form>
                    ) : (
                      <div key="cadastro" className="lg-rise flex flex-col gap-4">
                        <div className="flex items-center gap-2.5" aria-label={`Etapa ${etapa} de 2`}>
                          <PassoBolinha n={1} ativo={etapa >= 1} rotulo="Sua loja" />
                          <span className={`flex-1 h-0.5 rounded transition-colors ${etapa >= 2 ? 'bg-[#D0101F]' : 'bg-[#E4DFDA]'}`} />
                          <PassoBolinha n={2} ativo={etapa >= 2} rotulo="Seu acesso" />
                        </div>

                        {etapa === 1 ? (
                          <div className="flex flex-col gap-4">
                            <Campo id="sg-nome" label="Nome da loja">
                              <div className="lg-inp">
                                <Svg d={I.loja} />
                                <input id="sg-nome" placeholder="Ex.: Siri Cascudo" value={nomeLoja} onChange={(e) => setNomeLoja(e.target.value)} />
                              </div>
                              <div className="flex items-center gap-1.5 text-[13px] text-[#5E5A57]">
                                <Svg d={I.link} size={14} /> Seu link:
                                <span className="lg-mono text-[#1D1B1A] font-semibold truncate">
                                  {dominio}/{slug}
                                </span>
                              </div>
                            </Campo>
                            <Campo id="sg-wa" label="WhatsApp que recebe os pedidos">
                              <div className="lg-inp">
                                <span className="lg-mono text-sm text-[#5E5A57]">+55</span>
                                <input id="sg-wa" inputMode="tel" autoComplete="tel-national" placeholder="(13) 99999-9999" value={telefone} onChange={(e) => setTelefone(mascaraTelefone(e.target.value))} />
                              </div>
                            </Campo>
                            <fieldset className="flex flex-col gap-2">
                              <legend className="text-sm font-semibold mb-2">O que você vende?</legend>
                              <div className="flex flex-wrap gap-2">
                                {CATEGORIAS.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => setCategoria(c)}
                                    aria-pressed={categoria === c}
                                    className={`h-[38px] px-3.5 rounded-full text-sm font-semibold border-[1.5px] transition-colors ${
                                      categoria === c ? 'bg-[#1D1B1A] text-white border-[#1D1B1A]' : 'bg-white text-[#3D3A37] border-[#E4DFDA] hover:border-[#C9C1B9]'
                                    }`}
                                  >
                                    {c}
                                  </button>
                                ))}
                              </div>
                            </fieldset>
                            {tentou && !etapa1Ok && (
                              <span role="alert" className="text-[13px] text-[#B42318]">
                                Preencha o nome da loja e um WhatsApp válido.
                              </span>
                            )}
                            <BotaoPrincipal onClick={continuar}>
                              Continuar <Svg d={I.seta} sw={2.2} />
                            </BotaoPrincipal>
                          </div>
                        ) : (
                          <form onSubmit={criar} noValidate className="flex flex-col gap-4">
                            <Campo id="sg-owner" label="Seu nome">
                              <div className="lg-inp">
                                <Svg d={I.user} />
                                <input id="sg-owner" placeholder="Responsável pela loja" value={nomeResponsavel} onChange={(e) => setNomeResponsavel(e.target.value)} />
                              </div>
                            </Campo>
                            <Campo id="sg-email" label="E-mail">
                              <div className="lg-inp" style={tentou && !emailOk ? { borderColor: '#E8A39C' } : emailOk ? { borderColor: '#BFE5CF' } : undefined}>
                                <Svg d={I.email} />
                                <input id="sg-email" type="email" autoComplete="email" placeholder="voce@sualoja.com.br" value={email} onChange={(e) => setEmail(e.target.value)} />
                              </div>
                            </Campo>
                            <Campo id="sg-pass" label="Crie uma senha">
                              <CampoSenha id="sg-pass" value={senha} onChange={setSenha} auto="new-password" placeholder="Mínimo 8 caracteres" />
                              <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
                                {[1, 2, 3, 4].map((i) => (
                                  <span key={i} className="h-[5px] rounded-full transition-colors" style={{ background: forca && i <= forca ? FORCA[forca].cor : '#EDE9E5' }} />
                                ))}
                              </div>
                              <span className="text-[13px]" style={{ color: FORCA[forca].txt }} aria-live="polite">
                                {FORCA[forca].texto}
                              </span>
                            </Campo>
                            <label className="flex items-start gap-2.5 text-sm leading-snug text-[#3D3A37] cursor-pointer">
                              <input type="checkbox" checked={termos} onChange={() => setTermos((v) => !v)} className="w-[18px] h-[18px] mt-px shrink-0 accent-[#D0101F]" />
                              <span>
                                Li e aceito os <a href="/termos" className="text-[#C4101D] hover:underline">Termos de uso</a> e a{' '}
                                <a href="/privacidade" className="text-[#C4101D] hover:underline">Política de privacidade</a>
                              </span>
                            </label>
                            {tentou && !etapa2Ok && (
                              <span role="alert" className="text-[13px] text-[#B42318]">
                                Preencha seu nome, um e-mail válido, senha com 8+ caracteres e aceite os termos.
                              </span>
                            )}
                            <div className="flex gap-2.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEtapa(1);
                                  setTentou(false);
                                }}
                                className="h-[52px] px-5 rounded-[14px] border-[1.5px] border-[#E4DFDA] bg-white text-[15px] font-bold hover:bg-[#F1EEEB]"
                              >
                                Voltar
                              </button>
                              <BotaoPrincipal type="submit" carregando={carregando} className="flex-1">
                                {carregando ? 'Criando sua loja…' : 'Criar minha loja'}
                              </BotaoPrincipal>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </>
                )}
              </section>
            )}

            <div className="flex items-center justify-center gap-2 text-[13px] text-[#5E5A57]">
              <Svg d={I.cadeado} size={14} /> Conexão segura · Seus dados protegidos conforme a LGPD
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginLojista />
    </Suspense>
  );
}
