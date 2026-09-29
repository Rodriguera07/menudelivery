import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CardápioZap',
  description: 'Cardápio online multi-loja com pedido direto pelo WhatsApp',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
