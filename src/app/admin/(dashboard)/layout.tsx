import { Bricolage_Grotesque, DM_Sans, IBM_Plex_Mono } from 'next/font/google';
import { requireMerchantSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminNav from './AdminNav';
import HeaderControls from './HeaderControls';
import LogoutButton from './LogoutButton';

const display = Bricolage_Grotesque({ subsets: ['latin'], weight: ['600', '700'], variable: '--f-display' });
const body = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--f-body' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500', '600'], variable: '--f-mono' });

// Visual próprio do painel (Kanban de pedidos) — fontes e reset isolados do resto do
// app (globals.css / tailwind.config), aplicados só dentro de .pp-root.
const CSS = `
.pp-root{font-family:var(--f-body),system-ui,sans-serif;color:#1D1B1A;background:#F6F4F2;color-scheme:light}
.pp-root button{font-family:inherit;cursor:pointer}
.pp-root :focus-visible{outline:2px solid #1D4ED8;outline-offset:2px}
.pp-display{font-family:var(--f-display),var(--f-body),sans-serif}
.pp-mono{font-family:var(--f-mono),ui-monospace,monospace;font-variant-numeric:tabular-nums}
`;

const btnGhost =
  'h-10 px-3.5 rounded-[10px] border border-[#E4DFDA] bg-white text-sm font-medium text-[#1D1B1A] flex items-center gap-2 hover:bg-[#F1EEEB] transition-colors';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireMerchantSession();

  const [store, activeCount] = await Promise.all([
    prisma.store.findUnique({ where: { id: session.storeId }, include: { merchant: true } }),
    prisma.order.count({
      where: { storeId: session.storeId, status: { in: ['RECEIVED', 'PREPARING', 'OUT_FOR_DELIVERY'] } },
    }),
  ]);
  if (!store) redirect('/admin/login');

  return (
    <div className={`pp-root ${display.variable} ${body.variable} ${mono.variable} min-h-screen flex flex-col`}>
      <style>{CSS}</style>

      <header className="shrink-0 px-4 sm:px-8 bg-white">
        <div className="h-auto sm:h-[72px] py-3 sm:py-0 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="w-11 h-11 rounded-xl bg-[#D0101F] text-white grid place-items-center font-bold text-lg pp-display shrink-0">
            {store.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-xs text-[#6B6662] tracking-wide">Painel do lojista</span>
            <span className="pp-display text-xl font-bold leading-none truncate">{store.name}</span>
          </div>

          <HeaderControls slug={store.slug} initialIsOpen={store.isOpen} btnGhostClass={btnGhost} />

          <div className="w-px h-8 bg-[#E4DFDA] hidden sm:block" />
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#1D1B1A] text-white grid place-items-center text-sm font-semibold">
              {(store.merchant?.ownerName ?? '?')[0]}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{store.merchant?.ownerName}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <AdminNav ativosCount={activeCount} />

      <main className="flex-1 w-full px-4 sm:px-8 py-6">{children}</main>
    </div>
  );
}
