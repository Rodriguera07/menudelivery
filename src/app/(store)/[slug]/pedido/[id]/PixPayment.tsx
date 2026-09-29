'use client';

import { useEffect, useState } from 'react';

export default function PixPayment({
  slug,
  orderId,
  qrCodeDataUrl,
  pixCode,
  initialPaid,
}: {
  slug: string;
  orderId: string;
  qrCodeDataUrl: string;
  pixCode: string;
  initialPaid: boolean;
}) {
  const [paid, setPaid] = useState(initialPaid);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (paid) return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/stores/${slug}/orders/${orderId}/status`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.paid) setPaid(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [paid, slug, orderId]);

  async function copyCode() {
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (paid) {
    return (
      <div className="bg-green-soft text-green rounded-2xl p-4 text-center text-sm font-semibold">
        Pagamento Pix confirmado ✓
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl p-4 text-center space-y-3">
      <h4 className="font-semibold text-sm">Pague com Pix para confirmar o pedido</h4>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrCodeDataUrl} alt="QR Code Pix" className="w-48 h-48 mx-auto rounded-lg border border-line" />
      <button onClick={copyCode} className="btn-primary w-full">
        {copied ? 'Código copiado!' : 'Copiar código Pix'}
      </button>
      <p className="text-xs text-muted">Aguardando o lojista confirmar o recebimento…</p>
    </div>
  );
}
