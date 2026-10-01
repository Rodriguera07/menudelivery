import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { DevFooter } from '@/components/DevFooter';
import './globals.css';

export const metadata: Metadata = {
  title: 'Menudelivery',
  description: 'Cardápio online multi-loja com pedido direto pelo WhatsApp',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <DevFooter />
        <Analytics />
      </body>
    </html>
  );
}
