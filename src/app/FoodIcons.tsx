// Ilustrações dos itens do demo do hero — sem fotos reais (não há upload de imagem
// nesse mockup), mas com gradientes/brilho/sombra pra parecer bem mais real do que
// um ícone chapado.

import type { ReactNode } from 'react';

function Shadow() {
  return <ellipse cx="12" cy="20.5" rx="6.5" ry="1.3" fill="#000" opacity="0.1" />;
}

const ICONS: Record<string, ReactNode> = {
  bolo: (
    <>
      <defs>
        <linearGradient id="g-bolo-body" x1="4" y1="7" x2="19" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E8935A" />
          <stop offset="1" stopColor="#C36B35" />
        </linearGradient>
        <linearGradient id="g-bolo-frosting" x1="5" y1="9" x2="18" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFF6E9" />
          <stop offset="1" stopColor="#F6DFBE" />
        </linearGradient>
      </defs>
      <Shadow />
      <path d="M4.2 19 12 6.2 19.8 19z" fill="url(#g-bolo-body)" />
      <path d="M8.4 19 12 12.8 15.6 19z" fill="#A8542A" opacity="0.5" />
      <path d="M5.3 10.6c1.4-1.3 2.3-1.3 3.6-.2 1.3 1 2.3 1 3.6-.1 1.3-1.1 2.3-1.1 3.6.1l-1 1.7c-1.1-1-1.9-1-2.9-.1-1.3 1.1-2.4 1.1-3.7 0-1-.8-1.7-.8-2.6 0z" fill="url(#g-bolo-frosting)" />
      <circle cx="12" cy="7.4" r="1.5" fill="#D6413A" />
      <circle cx="11.5" cy="6.9" r="0.45" fill="#FF8D86" />
    </>
  ),
  brig: (
    <>
      <defs>
        <radialGradient id="g-brig-a" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#8A5B3E" />
          <stop offset="1" stopColor="#4A2E1E" />
        </radialGradient>
        <radialGradient id="g-brig-b" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#9C6A49" />
          <stop offset="1" stopColor="#5C3A24" />
        </radialGradient>
      </defs>
      <Shadow />
      <circle cx="8.6" cy="14.6" r="4" fill="url(#g-brig-a)" />
      <circle cx="15.1" cy="12.6" r="3.3" fill="url(#g-brig-b)" />
      <circle cx="12.6" cy="17.5" r="2.7" fill="url(#g-brig-a)" />
      <circle cx="7.3" cy="12.9" r="0.55" fill="#FFD9A8" opacity="0.9" />
      <circle cx="13.9" cy="10.9" r="0.5" fill="#FFD9A8" opacity="0.9" />
      <circle cx="11.7" cy="16" r="0.45" fill="#FFD9A8" opacity="0.9" />
      <circle cx="9.3" cy="15.8" r="0.3" fill="#FFCFEE" />
      <circle cx="16.1" cy="13.6" r="0.3" fill="#FFE9A8" />
    </>
  ),
  torta: (
    <>
      <defs>
        <linearGradient id="g-torta-body" x1="5" y1="9" x2="18" y2="19" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FBDE78" />
          <stop offset="1" stopColor="#EAB73C" />
        </linearGradient>
      </defs>
      <Shadow />
      <path d="M4.2 19 12 7.2 19.8 19z" fill="url(#g-torta-body)" />
      <path d="M4.2 19c1.3-1.6 2.5-1.6 3.8-.2 1.2 1.3 2.4 1.3 3.6 0 1.3-1.3 2.5-1.3 3.8 0 1.2 1.3 2.4 1.3 3.6.2l.8 0H4.2z" fill="#FFFDF6" />
      <path d="M5.4 18.6c1-1 2-.9 3 .1 1 1 2 1 3-.1" stroke="#E7D9B8" strokeWidth="0.5" fill="none" />
      <path d="M14.6 6a2.1 2.1 0 0 1 2.7 2.7l-2.4 1.2-1.2-2.4z" fill="#C9D94A" />
      <path d="M14.9 6.5a1.5 1.5 0 0 1 1.9 1.9z" fill="#E4EB8C" />
    </>
  ),
  cheddar: (
    <>
      <defs>
        <radialGradient id="g-bun-top" cx="0.35" cy="0.25" r="0.9">
          <stop offset="0" stopColor="#F3C77C" />
          <stop offset="1" stopColor="#C3832D" />
        </radialGradient>
        <linearGradient id="g-patty" x1="4" y1="14" x2="20" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6B3F28" />
          <stop offset="1" stopColor="#4A2A18" />
        </linearGradient>
        <linearGradient id="g-bun-bot" x1="4" y1="17" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E8B96A" />
          <stop offset="1" stopColor="#C3862F" />
        </linearGradient>
      </defs>
      <Shadow />
      <path d="M4.3 10.8a7.7 4.4 0 0 1 15.4 0z" fill="url(#g-bun-top)" />
      <circle cx="9" cy="8.6" r="0.5" fill="#FFF3D6" />
      <circle cx="12" cy="7.8" r="0.5" fill="#FFF3D6" />
      <circle cx="15" cy="8.6" r="0.5" fill="#FFF3D6" />
      <path d="M8.5 19c.5-1 1.2-1 1.8-.1.6.9 1.3.9 1.9 0 .6-.9 1.3-.9 1.9.1" stroke="#7CAA3B" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <rect x="4" y="13.2" width="16" height="2.4" rx="1.2" fill="url(#g-patty)" />
      <rect x="4.3" y="15.8" width="15.4" height="1.5" fill="#F2C94C" opacity="0.9" />
      <path d="M4.2 17.3a7.8 2.6 0 0 0 15.6 0z" fill="url(#g-bun-bot)" />
    </>
  ),
  batata: (
    <>
      <defs>
        <linearGradient id="g-cup" x1="6" y1="11" x2="18" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E8534A" />
          <stop offset="1" stopColor="#B82A24" />
        </linearGradient>
        <linearGradient id="g-fry" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FBDE86" />
          <stop offset="1" stopColor="#E8A93F" />
        </linearGradient>
      </defs>
      <Shadow />
      <path d="M6 11h12l-1.4 8.1a1.5 1.5 0 0 1-1.48 1.3H8.88A1.5 1.5 0 0 1 7.4 19z" fill="url(#g-cup)" />
      <path d="M7.7 12.5h8.6l-.3 1.6H8z" fill="#fff" opacity="0.2" />
      <rect x="7.8" y="4.5" width="1.9" height="8.6" rx="0.9" fill="url(#g-fry)" transform="rotate(-6 8.75 8.8)" />
      <rect x="11.05" y="2.4" width="1.9" height="10.6" rx="0.9" fill="url(#g-fry)" />
      <rect x="14.3" y="4.8" width="1.9" height="8" rx="0.9" fill="url(#g-fry)" transform="rotate(7 15.25 8.8)" />
      <rect x="11.3" y="3" width="0.6" height="4" rx="0.3" fill="#FFF3CC" opacity="0.7" />
    </>
  ),
  shake: (
    <>
      <defs>
        <linearGradient id="g-shakecup" x1="7" y1="9" x2="17" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F3E0D6" />
          <stop offset="1" stopColor="#D9BFA9" />
        </linearGradient>
        <radialGradient id="g-cream" cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#EFE6D8" />
        </radialGradient>
      </defs>
      <Shadow />
      <path d="M8 9h8l-1 11.2A1.3 1.3 0 0 1 13.7 21h-3.4a1.3 1.3 0 0 1-1.3-1.17z" fill="url(#g-shakecup)" />
      <path d="M8.9 11h6.3l-.7 8.3H9.5z" fill="#fff" opacity="0.25" />
      <path d="M7.3 9a4.7 2 0 0 1 9.4 0 4.7 2 0 0 1-9.4 0z" fill="url(#g-cream)" />
      <path d="M8.3 7.7c.9-.7 1.6-.7 2.5 0 .9.7 1.7.7 2.5 0 .9-.7 1.7-.7 2.5 0" stroke="#E7DCCB" strokeWidth="0.6" fill="none" />
      <circle cx="9.4" cy="7.4" r="0.55" fill="#5C3A24" />
      <circle cx="11.7" cy="7" r="0.55" fill="#5C3A24" />
      <circle cx="14.1" cy="7.5" r="0.55" fill="#5C3A24" />
      <rect x="10.8" y="1.6" width="1.4" height="7.2" rx="0.7" fill="#D6413A" transform="rotate(12 11.5 5.2)" />
      <circle cx="12.3" cy="4.6" r="0.9" fill="#C0272A" />
      <circle cx="12" cy="4.3" r="0.3" fill="#FF8D86" />
    </>
  ),
  calabresa: (
    <>
      <defs>
        <linearGradient id="g-crust-a" x1="4" y1="16" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E8B347" />
          <stop offset="1" stopColor="#C98A2A" />
        </linearGradient>
        <linearGradient id="g-cheese-a" x1="6" y1="8" x2="18" y2="19" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FCE08B" />
          <stop offset="1" stopColor="#F0C24B" />
        </linearGradient>
        <radialGradient id="g-pep" cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#E06355" />
          <stop offset="1" stopColor="#B33129" />
        </radialGradient>
      </defs>
      <Shadow />
      <path d="M4 19.2 12 5l8 14.2z" fill="url(#g-crust-a)" />
      <path d="M5.8 19.2 12 8 18.2 19.2z" fill="url(#g-cheese-a)" />
      <circle cx="11" cy="13.6" r="1.3" fill="url(#g-pep)" />
      <circle cx="14" cy="16.1" r="1.3" fill="url(#g-pep)" />
      <circle cx="9.7" cy="17.3" r="1.1" fill="url(#g-pep)" />
      <circle cx="10.6" cy="13.2" r="0.35" fill="#F4A89E" opacity="0.8" />
      <circle cx="13.6" cy="15.7" r="0.3" fill="#F4A89E" opacity="0.8" />
      <path d="M9 16c.6-1.4 1.2-1.4 1.8 0" stroke="#fff" strokeWidth="0.5" opacity="0.5" fill="none" />
    </>
  ),
  mussarela: (
    <>
      <defs>
        <linearGradient id="g-crust-b" x1="4" y1="16" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E8B347" />
          <stop offset="1" stopColor="#C98A2A" />
        </linearGradient>
        <linearGradient id="g-cheese-b" x1="6" y1="8" x2="18" y2="19" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FEE9A8" />
          <stop offset="1" stopColor="#F2C94C" />
        </linearGradient>
      </defs>
      <Shadow />
      <path d="M4 19.2 12 5l8 14.2z" fill="url(#g-crust-b)" />
      <path d="M5.8 19.2 12 8 18.2 19.2z" fill="url(#g-cheese-b)" />
      <path d="M8.3 19.2c.6-1.1 1.4-1.1 2 0m1.7 0c.6-1.1 1.4-1.1 2 0" stroke="#FFF7D9" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <circle cx="12.6" cy="12.7" r="1" fill="#FEE9A8" stroke="#E4B23C" strokeWidth="0.5" />
      <circle cx="10.2" cy="15.4" r="0.6" fill="#FEE9A8" stroke="#E4B23C" strokeWidth="0.4" />
      <path d="M13.5 10.2c.7.3 1.2.1 1.4-.6" stroke="#4F8F3E" strokeWidth="1" strokeLinecap="round" fill="none" />
    </>
  ),
  refri: (
    <>
      <defs>
        <linearGradient id="g-bottle" x1="8" y1="3" x2="16" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5FC176" />
          <stop offset="1" stopColor="#2E7D4A" />
        </linearGradient>
      </defs>
      <Shadow />
      <path d="M9.5 2h5v3.2l1.3 2.4v12.9A1.5 1.5 0 0 1 14.3 22H9.7a1.5 1.5 0 0 1-1.5-1.5V7.6l1.3-2.4z" fill="url(#g-bottle)" />
      <rect x="9.5" y="2" width="5" height="1.6" rx="0.4" fill="#245E38" />
      <rect x="10.6" y="1.3" width="2.8" height="1" rx="0.3" fill="#B7CF5A" />
      <rect x="8.2" y="11.3" width="7.6" height="3.6" fill="#FFFFFF" opacity="0.88" />
      <path d="M8.2 11.3h7.6l-.4 3.6H9.6" fill="none" />
      <path d="M9.5 7.9h2.2v12.6H9.5z" fill="#fff" opacity="0.18" />
      <circle cx="11.8" cy="9" r="0.3" fill="#DFF5E2" opacity="0.8" />
      <circle cx="12.6" cy="17" r="0.25" fill="#DFF5E2" opacity="0.8" />
    </>
  ),
};

export function FoodIcon({ id, className }: { id: string; className?: string }) {
  const icon = ICONS[id];
  if (!icon) return null;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {icon}
    </svg>
  );
}
