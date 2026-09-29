'use client';

import { useState } from 'react';

export default function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button onClick={copy} className="btn-primary w-full">
      {copied ? 'Link copiado!' : 'Copiar link da loja'}
    </button>
  );
}
