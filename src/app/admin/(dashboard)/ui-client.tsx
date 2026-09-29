'use client';

// Peças interativas compartilhadas pelas telas do painel.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon, I } from './pp-icons';

/** Interruptor liga/desliga acessível (role="switch"). */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
  size = 'md',
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}) {
  const w = size === 'sm' ? 'w-9 h-5' : 'w-11 h-6';
  const k = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const move = size === 'sm' ? 'translate-x-4' : 'translate-x-5';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`${w} shrink-0 rounded-full p-0.5 transition-colors disabled:opacity-50 ${checked ? 'bg-[#177245]' : 'bg-[#D6CFC8]'}`}
    >
      <span className={`block ${k} rounded-full bg-white shadow transition-transform ${checked ? move : 'translate-x-0'}`} />
    </button>
  );
}

type ToastMsg = { id: number; text: string; tone: 'ok' | 'erro' };

/** Avisos rápidos no canto da tela ("Preço salvo", "Não foi possível…"). */
export function useToast() {
  const [items, setItems] = useState<ToastMsg[]>([]);
  const seq = useRef(0);

  const show = useCallback((text: string, tone: 'ok' | 'erro' = 'ok') => {
    const id = ++seq.current;
    setItems((xs) => [...xs, { id, text, tone }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 2800);
  }, []);

  const node = (
    <div aria-live="polite" className="fixed z-50 bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none px-4 w-full max-w-sm">
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-[0_10px_30px_rgba(29,27,26,.18)] ${
            t.tone === 'ok' ? 'bg-[#1D1B1A] text-white' : 'bg-[#B42318] text-white'
          }`}
        >
          <Icon d={t.tone === 'ok' ? I.check : I.alerta} size={16} />
          {t.text}
        </div>
      ))}
    </div>
  );

  return { show, node };
}

/** Botão "Remover" que pede confirmação na própria tela (sem window.confirm). */
export function ConfirmButton({
  onConfirm,
  label = 'Remover',
  question = 'Remover?',
  compact,
}: {
  onConfirm: () => void | Promise<void>;
  label?: string;
  question?: string;
  compact?: boolean;
}) {
  const [ask, setAsk] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ask) return;
    const t = setTimeout(() => setAsk(false), 5000);
    return () => clearTimeout(t);
  }, [ask]);

  if (!ask) {
    return (
      <button
        type="button"
        onClick={() => setAsk(true)}
        aria-label={label}
        title={label}
        className={
          compact
            ? 'w-9 h-9 rounded-lg grid place-items-center text-[#5E5A57] hover:bg-[#FEECEB] hover:text-[#B42318] transition-colors'
            : 'h-9 px-3 rounded-lg text-sm font-semibold text-[#B42318] hover:bg-[#FEECEB] inline-flex items-center gap-1.5 transition-colors'
        }
      >
        <Icon d={I.lixo} size={16} />
        {!compact && label}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FEECEB] pl-3 pr-1 py-1">
      <span className="text-xs font-semibold text-[#7A1A12] whitespace-nowrap">{question}</span>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await onConfirm();
          setBusy(false);
          setAsk(false);
        }}
        className="h-7 px-2.5 rounded-md bg-[#B42318] text-white text-xs font-bold disabled:opacity-60"
      >
        {busy ? '…' : 'Sim'}
      </button>
      <button type="button" onClick={() => setAsk(false)} className="h-7 px-2.5 rounded-md bg-white text-xs font-bold text-[#1D1B1A]">
        Não
      </button>
    </span>
  );
}

/** Copia um texto e mostra "Copiado" por um instante. */
export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 1600);
      return true;
    } catch {
      return false;
    }
  }, []);
  return { copy, copied };
}
