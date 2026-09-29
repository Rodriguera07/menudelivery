'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    try {
      await fetch('/api/auth/merchant/logout', { method: 'POST' });
    } catch {
      // sem conexão: segue e redireciona mesmo assim, o cookie expira sozinho
    }
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <button onClick={logout} className="text-sm font-semibold text-brand">
      Sair
    </button>
  );
}
