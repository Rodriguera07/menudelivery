export function DevFooter() {
  return (
    <footer className="py-4 px-5 flex items-center justify-center gap-2 text-xs text-muted border-t border-line bg-surface">
      Desenvolvido por
      <a
        href="https://shielddeveloper.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="ShieldDeveloper — site do desenvolvedor"
        className="inline-flex items-center hover:opacity-80 transition-opacity"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/shielddeveloper-logo.svg" alt="ShieldDeveloper" className="h-5 w-auto" />
      </a>
    </footer>
  );
}
