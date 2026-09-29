'use client';

import { useRouter } from 'next/navigation';

export default function LogoutLink() {
  const router = useRouter();

  async function logout() {
    try {
      await fetch('/api/auth/customer/logout', { method: 'POST' });
    } catch {
      // sem conexão: segue e atualiza mesmo assim, o cookie expira sozinho
    }
    router.refresh();
  }

  return (
    <button onClick={logout} className="underline hover:no-underline">
      Sair
    </button>
  );
}
