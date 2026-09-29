'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, I } from './pp-icons';

const TABS = [
  { href: '/admin', label: 'Pedidos', icon: I.pedidos },
  { href: '/admin/mais-vendidos', label: 'Mais vendidos', icon: I.grafico },
  { href: '/admin/produtos', label: 'Produtos e preços', icon: I.tag },
  { href: '/admin/cupons', label: 'Cupons', icon: I.cupom },
  { href: '/admin/loja', label: 'Loja', icon: I.loja },
];

export default function AdminNav({ ativosCount }: { ativosCount: number }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Seções do painel" className="shrink-0 px-4 sm:px-8 bg-white border-t border-[#F0ECE8] border-b border-b-[#E4DFDA]">
      <div className="h-[52px] flex items-stretch gap-1 overflow-x-auto">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={`px-3.5 flex items-center gap-2 text-sm whitespace-nowrap shrink-0 ${
                active
                  ? 'font-semibold text-[#C4101D] shadow-[inset_0_-2px_0_#D0101F]'
                  : 'font-medium text-[#5E5A57] hover:text-[#1D1B1A]'
              }`}
            >
              <Icon d={tab.icon} />
              {tab.label}
              {tab.href === '/admin' && ativosCount > 0 && (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#D0101F] text-white text-[11px] pp-mono grid place-items-center">
                  {ativosCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
