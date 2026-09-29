'use client';

import { useRouter } from 'next/navigation';

export default function LogoutLink() {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/customer/logout', { method: 'POST' });
    router.refresh();
  }

  return (
    <button onClick={logout} className="text-muted underline">
      Sair
    </button>
  );
}
