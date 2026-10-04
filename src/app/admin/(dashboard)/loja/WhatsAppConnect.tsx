'use client';

import { useEffect, useRef, useState } from 'react';
import { I } from '../pp-icons';
import { card, btnPrimary, btnGhost, SectionTitle } from '../ui';

export default function WhatsAppConnect({ connected: initialConnected }: { connected: boolean }) {
  const [connected, setConnected] = useState(initialConnected);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

  function startPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/store/whatsapp/status');
        if (!res.ok) return;
        const data = await res.json();
        if (data.connected) {
          setConnected(true);
          setQrCode(null);
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // falha isolada de polling — a próxima tentativa já resolve
      }
    }, 3000);
  }

  async function connect() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/store/whatsapp/connect', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error ?? 'Não foi possível gerar o QR code.');
      setQrCode(data.qrCode);
      startPolling();
    } catch {
      setError('Falha de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function disconnect() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/store/whatsapp/disconnect', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error ?? 'Não foi possível desconectar.');
      setConnected(false);
      setQrCode(null);
    } catch {
      setError('Falha de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="whatsapp" className={`${card} p-5 sm:p-6 flex flex-col gap-4 scroll-mt-16`}>
      <SectionTitle
        icon={I.whats}
        tone="green"
        title="WhatsApp"
        desc="Conecte o número da loja escaneando um QR code. Depois disso, os pedidos chegam automaticamente e você pode avisar o cliente a cada status."
      />

      {connected ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[13px] rounded-xl px-3.5 py-2.5 bg-[#E7F6EE] text-[#177245] font-semibold">
            Conectado
          </span>
          <button onClick={disconnect} disabled={loading} className={btnGhost}>
            Desconectar
          </button>
        </div>
      ) : qrCode ? (
        <div className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
            alt="QR code para conectar o WhatsApp"
            className="w-56 h-56 rounded-xl border border-[#ECE7E2]"
          />
          <p className="text-xs text-[#5E5A57] text-center max-w-xs">
            Abra o WhatsApp no celular da loja → Mais opções → Dispositivos conectados → Conectar um dispositivo, e
            aponte a câmera pra esse código.
          </p>
          <button onClick={connect} disabled={loading} className={btnGhost}>
            Gerar novo QR code
          </button>
        </div>
      ) : (
        <button onClick={connect} disabled={loading} className={btnPrimary}>
          Conectar WhatsApp
        </button>
      )}

      {error && <p className="text-xs text-[#B42318]">{error}</p>}
    </section>
  );
}
