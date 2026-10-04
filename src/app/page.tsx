import Link from 'next/link';
import { Logo } from '@/components/Logo';
import {
  ShieldIcon,
  LockIcon,
  WhatsappIcon,
  PixIcon,
  CheckIcon,
  ChartIcon,
  LinkIcon,
  StoreIcon,
  ClockIcon,
  CartIcon,
} from '@/components/icons';
import HeroDemo from './HeroDemo';

/* ------------------------------------------------------------------ */
/* Conteúdo                                                            */
/* ------------------------------------------------------------------ */

const TRUST_ROW = ['Grátis para começar', 'Pix direto na sua conta', 'Sem cartão de crédito'];

const SEGMENTOS = ['Lanchonetes', 'Docerias', 'Salgados e bolos de pote', 'Pizzarias', 'Marmitarias', 'Açaí', 'Hamburguerias', 'Quiosques'];

const STEPS = [
  {
    n: '1',
    icon: StoreIcon,
    title: 'Cadastre sua loja',
    desc: 'Nome, categoria, WhatsApp e sua chave Pix. Leva menos de 2 minutos.',
    detalhe: 'Logo, horários e taxa de entrega você ajusta quando quiser.',
  },
  {
    n: '2',
    icon: CartIcon,
    title: 'Monte seu cardápio',
    desc: 'Adicione produtos, preços, promoções e cupons — do jeito que sua loja funciona.',
    detalhe: 'Mudou o preço? Atualiza na hora para todos os clientes.',
  },
  {
    n: '3',
    icon: LinkIcon,
    title: 'Compartilhe seu link',
    desc: 'Coloque na bio do Instagram, no status do WhatsApp, onde quiser.',
    detalhe: 'menudelivery.app/sua-loja',
  },
];

const RECURSOS = [
  { icon: WhatsappIcon, title: 'Pedido formatado no WhatsApp', desc: 'Itens, endereço, forma de pagamento e total — sem precisar anotar nada à mão.' },
  { icon: PixIcon, title: 'Pix com QR Code', desc: 'O cliente paga pelo QR Code gerado com a sua chave. O dinheiro cai direto na sua conta.' },
  { icon: ChartIcon, title: 'Painel de pedidos', desc: 'Novos, em preparo, saiu para entrega e entregues — tudo organizado em colunas.' },
  { icon: ClockIcon, title: 'Horário de funcionamento', desc: 'A loja abre e fecha sozinha nos horários que você definir, dia a dia.' },
  { icon: CartIcon, title: 'Cupons e mais vendidos', desc: 'Crie cupons de desconto e veja quais produtos saem mais em cada período.' },
  { icon: StoreIcon, title: 'Sua marca, seu link', desc: 'Logo e nome da sua loja em um endereço próprio para divulgar.' },
];

const TRUST_POINTS = [
  { icon: ShieldIcon, title: 'Dados isolados por loja', desc: 'Cada loja só enxerga os próprios produtos, cupons e pedidos — sem cruzamento entre lojistas.' },
  { icon: LockIcon, title: 'Senha criptografada', desc: 'Login protegido com hash bcrypt, sessão em cookie seguro e verificação em duas etapas opcional.' },
  { icon: WhatsappIcon, title: 'WhatsApp oficial', desc: 'Integração com a Cloud API da Meta — o pedido chega formatado, direto no seu número.' },
  { icon: PixIcon, title: 'Pix direto pra você', desc: 'Usamos a sua própria chave Pix. O dinheiro do cliente cai na sua conta, sem intermediário.' },
];

const COMPARA = [
  { item: 'O pedido chega', nos: 'No seu WhatsApp, já formatado', antes: 'Mensagem solta, pedido anotado à mão' },
  { item: 'Cardápio', nos: 'Link com fotos, preços e sacola', antes: 'Foto do cardápio impresso' },
  { item: 'Pagamento', nos: 'Pix com QR Code na sua chave', antes: 'Chave digitada e comprovante por print' },
  { item: 'Acompanhamento', nos: 'Painel com status de cada pedido', antes: 'Conversas perdidas no meio do dia' },
];

const FAQ = [
  { q: 'Preciso pagar para começar?', a: 'Não. O cadastro é grátis e você não precisa informar cartão de crédito para colocar sua loja no ar.' },
  { q: 'O cliente precisa baixar algum aplicativo?', a: 'Não. O cardápio abre direto no navegador do celular, pelo link da sua loja. O cliente escolhe os itens e envia o pedido.' },
  { q: 'Como eu recebo o dinheiro do Pix?', a: 'O QR Code é gerado com a sua própria chave Pix, então o pagamento cai direto na sua conta, sem passar por nós.' },
  { q: 'Consigo usar no celular?', a: 'Sim. O painel de pedidos e o cadastro de produtos funcionam no celular e no computador.' },
  { q: 'Posso ter mais de uma loja?', a: 'Cada loja tem seu próprio link, painel e dados isolados. Crie uma conta para cada loja que quiser colocar no ar.' },
];

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-wash">
      {/* ---------- Topo ---------- */}
      <header className="sticky top-0 z-20 bg-surface/85 backdrop-blur border-b border-line">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center gap-6">
          <Link href="/" aria-label="Menu Delivery — início"><Logo /></Link>
          <nav aria-label="Seções" className="hidden md:flex items-center gap-1 text-sm font-medium text-muted">
            <a href="#como-funciona" className="px-3 py-2 rounded-lg hover:text-ink hover:bg-surface2 transition-colors">Como funciona</a>
            <a href="#recursos" className="px-3 py-2 rounded-lg hover:text-ink hover:bg-surface2 transition-colors">Recursos</a>
            <a href="#seguranca" className="px-3 py-2 rounded-lg hover:text-ink hover:bg-surface2 transition-colors">Segurança</a>
            <a href="#duvidas" className="px-3 py-2 rounded-lg hover:text-ink hover:bg-surface2 transition-colors">Dúvidas</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/admin/login" className="px-3 py-2 text-sm font-semibold text-ink rounded-lg hover:bg-surface2 transition-colors">
              Entrar
            </Link>
            <Link href="/admin/login?tab=signup" className="btn-primary hidden sm:inline-block">
              Criar loja grátis
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 pt-12 sm:pt-16 pb-16 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-8 items-center">
        <div className="animate-fade-in-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface border border-line pl-1.5 pr-3 py-1 text-xs font-semibold text-ink shadow-sm">
            <span className="rounded-full bg-brand-soft text-brand px-2 py-0.5">Para lojistas</span>
            Cardápio + WhatsApp + Pix
          </span>
          <h1 className="font-display text-[2.4rem] sm:text-5xl lg:text-[3.4rem] font-extrabold text-ink leading-[1.05] tracking-tight mt-5 [text-wrap:balance]">
            Seu cardápio online com pedido direto no <span className="text-brand">WhatsApp</span>.
          </h1>
          <p className="text-muted mt-5 text-base sm:text-lg max-w-xl leading-relaxed">
            Monte seu cardápio, receba pedidos formatados no seu WhatsApp e pagamentos via Pix direto na
            sua conta. Gerencie tudo em um painel simples, sem complicação.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link href="/admin/login?tab=signup" className="btn-primary px-7 py-3.5 text-base text-center shadow-[0_10px_24px_-10px_rgba(234,29,44,.7)]">
              Criar minha loja grátis
            </Link>
            <Link
              href="/admin/login"
              className="rounded-xl px-7 py-3.5 text-base font-semibold text-ink bg-surface border border-line text-center hover:border-line2 hover:bg-surface2 transition-colors"
            >
              Já tenho uma loja
            </Link>
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 mt-7">
            {TRUST_ROW.map((t) => (
              <li key={t} className="flex items-center gap-1.5 text-sm font-medium text-muted">
                <CheckIcon className="w-4 h-4 text-green shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <HeroDemo />
        </div>
      </section>

      {/* ---------- Para quem é ---------- */}
      <section aria-label="Para quem é" className="border-y border-line bg-surface/70">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-6 flex flex-col md:flex-row md:items-center gap-4">
          <p className="text-sm font-semibold text-ink shrink-0">Feito para quem vende pelo WhatsApp:</p>
          <ul className="flex flex-wrap gap-2">
            {SEGMENTOS.map((s) => (
              <li key={s} className="rounded-full bg-surface border border-line px-3 py-1.5 text-sm text-muted">{s}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Como funciona ---------- */}
      <section id="como-funciona" className="scroll-mt-20 max-w-6xl mx-auto px-5 sm:px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-brand text-xs font-bold uppercase tracking-wider">Como funciona</p>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink mt-2 [text-wrap:balance]">
            Do cadastro ao primeiro pedido em 3 passos
          </h2>
        </div>
        <ol className="relative grid md:grid-cols-3 gap-5 mt-10">
          <span aria-hidden="true" className="hidden md:block absolute top-[34px] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-brand/10 via-brand/40 to-brand/10" />
          {STEPS.map((s) => (
            <li key={s.n} className="card-hover relative bg-surface rounded-2xl border border-line p-6 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="relative w-11 h-11 rounded-full bg-brand text-white grid place-items-center font-display font-extrabold ring-4 ring-surface">
                  {s.n}
                </span>
                <s.icon className="w-5 h-5 text-dim" />
              </div>
              <h3 className="font-display text-lg font-bold text-ink">{s.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
              <p className={`mt-auto pt-3 border-t border-line text-xs ${s.n === '3' ? 'font-mono font-semibold text-ink' : 'text-muted'}`}>
                {s.detalhe}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Recursos + prévia do painel ---------- */}
      <section id="recursos" className="scroll-mt-20 bg-surface border-y border-line">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-20 grid lg:grid-cols-[1fr_1.05fr] gap-12 items-center">
          <div>
            <p className="text-brand text-xs font-bold uppercase tracking-wider">Recursos</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink mt-2 [text-wrap:balance]">
              Tudo o que sua loja precisa para vender online
            </h2>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-6 mt-10">
              {RECURSOS.map((r) => (
                <div key={r.title} className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand grid place-items-center shrink-0">
                    <r.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-sm font-bold text-ink">{r.title}</h3>
                    <p className="text-sm text-muted mt-1 leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <PreviaPainel />
        </div>
      </section>

      {/* ---------- Antes x depois ---------- */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-brand text-xs font-bold uppercase tracking-wider">Por que usar</p>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink mt-2 [text-wrap:balance]">
            Chega de anotar pedido à mão no meio da correria
          </h2>
        </div>
        <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left">
                <th scope="col" className="p-4 w-[22%] font-semibold text-muted" />
                <th scope="col" className="p-4 font-display font-bold text-ink bg-brand-soft/60">
                  <span className="inline-flex items-center gap-2"><Logo size={22} withText={false} /> Com Menu Delivery</span>
                </th>
                <th scope="col" className="p-4 font-semibold text-muted">Só pelo WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {COMPARA.map((c) => (
                <tr key={c.item} className="border-t border-line">
                  <th scope="row" className="p-4 text-left font-semibold text-ink">{c.item}</th>
                  <td className="p-4 bg-brand-soft/30">
                    <span className="flex items-start gap-2 text-ink">
                      <CheckIcon className="w-4 h-4 mt-0.5 text-green shrink-0" />{c.nos}
                    </span>
                  </td>
                  <td className="p-4 text-muted">{c.antes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- Segurança ---------- */}
      <section id="seguranca" className="scroll-mt-20 bg-ink text-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-orange text-xs font-bold uppercase tracking-wider">Segurança</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold mt-2 [text-wrap:balance]">
              Feito para sua loja vender com segurança
            </h2>
            <p className="text-white/70 mt-3">Sem taxas escondidas e sem intermediário no seu dinheiro.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {TRUST_POINTS.map((t) => (
              <div key={t.title} className="rounded-2xl p-5 bg-white/[.06] border border-white/10 hover:bg-white/[.09] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-white grid place-items-center">
                  <t.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold mt-4">{t.title}</h3>
                <p className="text-sm text-white/70 mt-1.5 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Dúvidas ---------- */}
      <section id="duvidas" className="scroll-mt-20 max-w-3xl mx-auto px-5 sm:px-6 py-20">
        <p className="text-brand text-xs font-bold uppercase tracking-wider text-center">Dúvidas</p>
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink mt-2 text-center">Perguntas frequentes</h2>
        <div className="mt-10 flex flex-col gap-3">
          {FAQ.map((f, i) => (
            <details key={f.q} className="group bg-surface rounded-2xl border border-line open:shadow-sm" {...(i === 0 ? { open: true } : {})}>
              <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer p-5 flex items-center gap-4 font-display font-bold text-ink">
                {f.q}
                <span aria-hidden="true" className="ml-auto w-8 h-8 shrink-0 rounded-full bg-surface2 grid place-items-center text-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="px-5 pb-5 -mt-1 text-muted leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- CTA final ---------- */}
      <section className="px-5 sm:px-6 pb-20">
        <div
          className="relative max-w-6xl mx-auto rounded-[2rem] overflow-hidden text-white px-6 sm:px-12 py-14 grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center"
          style={{ background: 'linear-gradient(150deg, #EA1D2C 0%, #F04A2E 55%, #FF8A00 100%)' }}
        >
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold [text-wrap:balance]">
              Pronto pra colocar sua loja no ar?
            </h2>
            <p className="opacity-90 mt-3 max-w-md">
              Cadastro grátis, leva menos de 2 minutos e você já sai com seu link pronto pra compartilhar.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 lg:justify-self-end">
            <Link
              href="/admin/login?tab=signup"
              className="rounded-xl px-7 py-3.5 text-base font-bold text-brand bg-white text-center hover:bg-white/90 transition-colors"
            >
              Criar minha loja grátis
            </Link>
            <Link
              href="/admin/login"
              className="rounded-xl px-7 py-3.5 text-base font-semibold text-white border border-white/40 text-center hover:bg-white/10 transition-colors"
            >
              Já tenho uma loja
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Rodapé ---------- */}
      <footer className="border-t border-line bg-surface">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-8 flex flex-col sm:flex-row items-center gap-4 text-sm text-muted">
          <Logo size={28} />
          <span className="sm:ml-4">Cada loja com seu próprio link e painel.</span>
          <nav aria-label="Rodapé" className="sm:ml-auto flex gap-5">
            <a href="#como-funciona" className="hover:text-ink">Como funciona</a>
            <a href="#duvidas" className="hover:text-ink">Dúvidas</a>
            <Link href="/admin/login" className="hover:text-ink">Entrar</Link>
            <Link href="/privacidade" className="hover:text-ink">Privacidade</Link>
            <Link href="/termos" className="hover:text-ink">Termos</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Prévia estática do painel de pedidos                                 */
/* ------------------------------------------------------------------ */

const COLUNAS = [
  { t: 'Novos', cor: 'bg-orange', badge: 'bg-orange-soft text-[#B25F00]', pedidos: [['#132', 'Beatriz M.', 'R$ 38,90'], ['#131', 'Rafael T.', 'R$ 52,00']] },
  { t: 'Em preparo', cor: 'bg-blue', badge: 'bg-blue-soft text-blue', pedidos: [['#130', 'Ana Clara', 'R$ 42,90']] },
  { t: 'Saiu p/ entrega', cor: 'bg-[#6B3FD4]', badge: 'bg-[#F1ECFF] text-[#6B3FD4]', pedidos: [['#129', 'João Pedro', 'R$ 18,50']] },
];

function PreviaPainel() {
  return (
    <div aria-hidden="true" className="relative">
      <div className="absolute -inset-4 sm:-inset-6 rounded-[2rem] bg-brand-wash border border-line" />
      <div className="relative rounded-2xl bg-bg border border-line shadow-[0_24px_60px_-24px_rgba(28,28,33,.35)] overflow-hidden">
        <div className="bg-surface border-b border-line px-4 py-3 flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-brand text-white grid place-items-center text-[10px] font-display font-extrabold">DA</span>
          <span className="font-display text-sm font-bold text-ink">Doceria da Ana</span>
          <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-green-soft text-green px-2 py-0.5 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-green" /> Loja aberta
          </span>
          <span className="ml-auto text-[11px] text-muted">Painel de pedidos</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5 p-3 text-[11px]">
          {[['Pedidos hoje', '14'], ['Faturamento', 'R$ 612,40'], ['Em andamento', '4']].map(([k, v]) => (
            <div key={k} className="bg-surface rounded-xl border border-line px-3 py-2.5">
              <p className="text-muted">{k}</p>
              <p className="font-mono text-base font-semibold text-ink mt-0.5">{v}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2.5 px-3 pb-3">
          {COLUNAS.map((c) => (
            <div key={c.t} className="rounded-xl bg-surface2 p-2 flex flex-col gap-2 min-w-0">
              <div className="flex items-center gap-1.5 px-1">
                <span className={`w-2 h-2 rounded-sm ${c.cor}`} />
                <span className="text-[11px] font-bold text-ink truncate">{c.t}</span>
                <span className={`ml-auto rounded-full px-1.5 text-[10px] font-bold font-mono ${c.badge}`}>{c.pedidos.length}</span>
              </div>
              {c.pedidos.map(([id, nome, total]) => (
                <div key={id} className="bg-surface rounded-lg border border-line p-2">
                  <p className="font-mono text-[10px] font-semibold text-muted">{id}</p>
                  <p className="text-[11px] font-semibold text-ink truncate">{nome}</p>
                  <p className="font-mono text-[11px] text-ink mt-1">{total}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
