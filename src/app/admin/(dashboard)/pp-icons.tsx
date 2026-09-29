// Ícones do novo visual do painel (Kanban de pedidos) — isolados do resto do app
// (src/components/icons.tsx) porque seguem uma convenção de traço diferente,
// pensada especificamente pra esse layout.

export const Icon = ({ d, size = 17, className = '' }: { d: string[]; size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    {d.map((p) => (
      <path key={p} d={p} />
    ))}
  </svg>
);

export const I = {
  pedidos: ['M4 2v20l3-2 3 2 2-2 2 2 3-2 3 2V2l-3 2-3-2-2 2-2-2-3 2Z', 'M8 9h8M8 13h6'],
  grafico: ['M3 3v18h18', 'M7 15l4-4 3 3 5-6'],
  tag: ['M12 2H4a2 2 0 0 0-2 2v8l10 10 10-10Z', 'M7.5 7.5h.01'],
  cupom: ['M3 9a2 2 0 0 0 0 6v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3a2 2 0 0 0 0-6V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1Z', 'M14 5v2M14 11v2M14 17v2'],
  loja: ['M3 9l1.5-5h15L21 9', 'M4 9v11h16V9', 'M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0'],
  copiar: ['M9 9h12v12H9z', 'M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1'],
  externo: ['M7 17 17 7', 'M8 7h9v9'],
  sino: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
  busca: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z', 'm20 20-3.5-3.5'],
  pin: ['M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z', 'M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
  seta: ['M5 12h14', 'm13 6 6 6-6 6'],
  x: ['M18 6 6 18M6 6l12 12'],
  whats: ['M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5Z'],
  // --- telas Loja / Cupons / Produtos / Mais vendidos ---
  mais: ['M12 5v14M5 12h14'],
  lapis: ['M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z', 'm15 5 4 4'],
  lixo: ['M3 6h18', 'M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2', 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6'],
  check: ['m5 12 5 5 9-10'],
  relogio: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7v5l3 2'],
  moto: ['M6 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M18 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M6 17h2l3-7h4l3 7', 'M14 6h3l1 4'],
  pix: ['M12 2 2 12l10 10 10-10Z', 'm8 12 4-4 4 4-4 4Z'],
  escudo: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z', 'm9 12 2 2 4-4'],
  link: ['M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1', 'M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1'],
  imagem: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z', 'M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z', 'm21 15-5-5L5 21'],
  sacola: ['M6 7h12l-1 13H7Z', 'M9 7a3 3 0 0 1 6 0'],
  sobe: ['m7 17 10-10', 'M8 7h9v9'],
  desce: ['m7 7 10 10', 'M17 8v9H8'],
  alerta: ['M12 9v4', 'M12 17h.01', 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z'],
  faisca: ['M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8'],
  porcento: ['M19 5 5 19', 'M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z', 'M17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'],
  dinheiro: ['M3 6h18v12H3z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M6 9v.01M18 15v.01'],
  cartao: ['M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z', 'M2 10h20', 'M6 15h4'],
  olho: ['M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
  olhoOff: ['M3 3l18 18', 'M10.6 5.1A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6C3.8 8.4 2 12 2 12s4 7 10 7a9.7 9.7 0 0 0 5.4-1.6', 'M9.9 9.9a3 3 0 0 0 4.2 4.2'],
  trofeu: ['M8 21h8M12 17v4', 'M7 4h10v5a5 5 0 0 1-10 0Z', 'M7 6H4a3 3 0 0 0 3 5M17 6h3a3 3 0 0 1-3 5'],
};
