'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <main className="min-h-screen bg-brand-wash flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <h1 className="font-display text-2xl font-extrabold text-ink">Algo deu errado</h1>
            <p className="text-muted mt-2">
              Tivemos um problema inesperado. Já fomos avisados — tenta de novo em alguns instantes.
            </p>
            <button onClick={() => reset()} className="btn-primary mt-6 px-6 py-3">
              Tentar de novo
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
