import { formatBRL } from '@/lib/format';
import { LogoMark } from '@/components/Logo';
import { Icon, I } from '../pp-icons';

// Miniatura de como o cliente vê o topo da loja. Só apresentação: quem usa passa os
// valores que estão sendo digitados, então a prévia muda ao vivo.

export default function StorePreviewCard({
  name,
  tagline,
  logoUrl,
  isOpen,
  deliveryFee,
  minOrder,
}: {
  name: string;
  tagline?: string | null;
  logoUrl: string | null;
  isOpen: boolean;
  deliveryFee: number;
  minOrder: number;
}) {
  const iniciais = name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="rounded-[22px] bg-[#F6F4F2] border border-[#ECE7E2] p-3">
      <div className="rounded-2xl overflow-hidden bg-white shadow-[0_10px_30px_-12px_rgba(29,27,26,.25)]">
        <div
          className="h-[72px]"
          style={{
            backgroundColor: '#C8101E',
            backgroundImage: 'radial-gradient(rgba(255,255,255,.16) 1.2px, transparent 1.3px)',
            backgroundSize: '14px 14px',
          }}
        />
        <div className="px-4 pb-4">
          <div className="-mt-8 w-16 h-16 rounded-2xl bg-white shadow-[0_0_0_4px_#fff,0_6px_14px_rgba(29,27,26,.14)] overflow-hidden grid place-items-center">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="w-full h-full object-cover" />
            ) : iniciais ? (
              <div className="w-full h-full bg-[#D0101F] text-white grid place-items-center pp-display font-bold text-xl">{iniciais}</div>
            ) : (
              <LogoMark size={32} />
            )}
          </div>
          <div className="flex items-center gap-2 mt-2.5 min-w-0">
            <h3 className="pp-display text-lg font-bold truncate">{name.trim() || 'Nome da loja'}</h3>
            <span
              className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                isOpen ? 'bg-[#E7F6EE] text-[#177245]' : 'bg-[#F1EEEB] text-[#5E5A57]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-[#177245]' : 'bg-[#5E5A57]'}`} />
              {isOpen ? 'Aberto' : 'Fechado'}
            </span>
          </div>
          {tagline && <p className="text-xs text-[#5E5A57] mt-0.5">{tagline}</p>}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="rounded-xl bg-[#F6F4F2] px-3 py-2">
              <span className="flex items-center gap-1 text-[11px] text-[#5E5A57]">
                <Icon d={I.moto} size={12} /> Entrega
              </span>
              <span className="pp-mono text-[13px] font-semibold">{deliveryFee > 0 ? formatBRL(deliveryFee) : 'Grátis'}</span>
            </div>
            <div className="rounded-xl bg-[#F6F4F2] px-3 py-2">
              <span className="flex items-center gap-1 text-[11px] text-[#5E5A57]">
                <Icon d={I.sacola} size={12} /> Mínimo
              </span>
              <span className="pp-mono text-[13px] font-semibold">{minOrder > 0 ? formatBRL(minOrder) : 'Sem mínimo'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
