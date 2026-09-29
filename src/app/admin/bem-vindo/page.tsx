import Link from 'next/link';
import { headers } from 'next/headers';
import { requireMerchantSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LogoMark } from '@/components/Logo';
import CopyLinkButton from './CopyLinkButton';

export default async function BemVindoPage() {
  const session = await requireMerchantSession();
  const store = await prisma.store.findUnique({ where: { id: session.storeId } });
  if (!store) return null;

  const h = await headers();
  const host = h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const storeLink = `${proto}://${host}/${store.slug}`;

  return (
    <main className="min-h-screen bg-brand-wash flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface rounded-3xl shadow-lg overflow-hidden text-center animate-fade-in-up">
        <div
          className="p-8 text-white"
          style={{ background: 'linear-gradient(150deg, #EA1D2C 0%, #F04A2E 55%, #FF8A00 100%)' }}
        >
          <div className="flex justify-center mb-3">
            <LogoMark size={40} inverse />
          </div>
          <p className="text-sm opacity-90 mb-1">Sua loja está pronta!</p>
          <h1 className="font-display text-xl font-extrabold">{store.name}</h1>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs text-muted mb-1">Link da sua loja</p>
            <p className="font-mono text-sm bg-surface2 rounded-xl px-3 py-2 break-all">{storeLink}</p>
          </div>

          <CopyLinkButton link={storeLink} />

          <p className="text-sm text-muted">
            Compartilhe esse link na bio do Instagram, no status do WhatsApp ou onde seus
            clientes te encontram.
          </p>

          <div className="pt-2 space-y-2">
            <Link href="/admin/produtos" className="btn-primary w-full block">
              Adicionar produtos ao cardápio
            </Link>
            <Link href="/admin" className="block text-sm font-semibold text-brand">
              Ir para o painel
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
