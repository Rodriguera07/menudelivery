// Marca do Menudelivery: sacola de entrega com linhas de cardápio dentro.
// `inverse` troca as cores para uso em cima de um fundo já colorido com o gradiente da marca
// (evita gradiente sobre gradiente).

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
          d="M4.8 9.6h14.4l-.9 9a2.2 2.2 0 01-2.19 1.98H7.89A2.2 2.2 0 015.7 18.6l-.9-9z"
          fill={inverse ? '#EA1D2C' : '#FFFFFF'}
        />
        <path
          d="M8.6 9.6V7.3a3.4 3.4 0 016.8 0v2.3"
          stroke={inverse ? '#FFFFFF' : '#EA1D2C'}
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M8.2 13.2h7.6M8.2 15.7h4.8"
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
          Menudelivery
        </span>
      )}
    </span>
  );
}
