// Marca do CardápioZap: balão de conversa (o "zap") com linhas de cardápio dentro —
// substitui o badge de texto "CZ" usado antes. `inverse` troca as cores para uso em
// cima de um fundo já colorido com o gradiente da marca (evita gradiente sobre gradiente).

export function LogoMark({ size = 36, inverse = false }: { size?: number; inverse?: boolean }) {
  return (
    <div
      className="rounded-xl grid place-items-center shrink-0"
      style={{
        width: size,
        height: size,
        background: inverse ? '#FFFFFF' : 'linear-gradient(150deg, #EA1D2C 0%, #FF8A00 100%)',
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" style={{ width: size * 0.56, height: size * 0.56 }}>
        <path
          d="M5 5.8A2.8 2.8 0 017.8 3h8.4A2.8 2.8 0 0119 5.8v6.4a2.8 2.8 0 01-2.8 2.8H10l-3.4 2.9a.55.55 0 01-.9-.42V15h-.9A2.8 2.8 0 015 12.2V5.8z"
          fill={inverse ? '#EA1D2C' : '#FFFFFF'}
        />
        <path
          d="M8.3 7.6h7.4M8.3 10.1h4.8"
          stroke={inverse ? '#FFFFFF' : '#EA1D2C'}
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function Logo({
  size = 36,
  withText = true,
  inverse = false,
  textClassName,
}: {
  size?: number;
  withText?: boolean;
  inverse?: boolean;
  textClassName?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={size} inverse={inverse} />
      {withText && (
        <span className={`font-display font-extrabold ${textClassName ?? (inverse ? 'text-white' : 'text-ink')}`}>
          CardápioZap
        </span>
      )}
    </span>
  );
}
