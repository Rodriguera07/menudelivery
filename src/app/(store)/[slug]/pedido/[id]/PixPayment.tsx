'use client';

import { useEffect, useState } from 'react';
import { Svg, I, ljCard, ljBtnPrimary } from '../../ljTheme';

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
      try {
        const res = await fetch(`/api/stores/${slug}/orders/${orderId}/status`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.paid) setPaid(true);
      } catch {
        // silencioso: só uma tentativa de polling falhou, a próxima tenta de novo
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [paid, slug, orderId]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível (ex.: contexto sem HTTPS) — sem crash, só não copia
    }
  }

  if (paid) {
    return (
      <div className="bg-[#E7F6EE] text-[#177245] rounded-2xl p-4 text-center text-sm font-semibold flex items-center justify-center gap-2">
        <Svg d={I.check} size={16} /> Pagamento Pix confirmado
      </div>
    );
  }

  return (
    <div className={`${ljCard} p-4 text-center space-y-3`}>
      <h4 className="font-semibold text-sm">Pague com Pix para confirmar o pedido</h4>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrCodeDataUrl} alt="QR Code Pix" className="w-48 h-48 mx-auto rounded-lg border border-[#ECE7E2]" />
      <button onClick={copyCode} className={`${ljBtnPrimary} w-full`}>
        <Svg d={copied ? I.check : I.copiar} size={16} /> {copied ? 'Código copiado!' : 'Copiar código Pix'}
      </button>
      <p className="text-xs text-[#5E5A57]">Aguardando o lojista confirmar o recebimento…</p>
    </div>
  );
}
