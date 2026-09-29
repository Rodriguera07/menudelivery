'use client';

import { useCallback, useEffect, useState } from 'react';

export type CartMap = Record<string, number>;

function key(slug: string) {
  return `cz_cart:${slug}`;
}

function read(slug: string): CartMap {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(key(slug)) ?? '{}');
  } catch {
    return {};
  }
}

export function useCart(slug: string) {
  const [cart, setCart] = useState<CartMap>({});

  useEffect(() => {
    setCart(read(slug));
  }, [slug]);

  const persist = useCallback(
    (next: CartMap) => {
      setCart(next);
      localStorage.setItem(key(slug), JSON.stringify(next));
    },
    [slug],
  );

  const setQty = useCallback(
    (productId: string, qty: number) => {
      const current = read(slug);
      const next = { ...current };
      if (qty <= 0) delete next[productId];
      else next[productId] = qty;
      persist(next);
    },
    [slug, persist],
  );

  const inc = useCallback(
    (productId: string) => {
      const current = read(slug);
      setQty(productId, (current[productId] ?? 0) + 1);
    },
    [slug, setQty],
  );

  const dec = useCallback(
    (productId: string) => {
      const current = read(slug);
      setQty(productId, (current[productId] ?? 0) - 1);
    },
    [slug, setQty],
  );

  const clear = useCallback(() => persist({}), [persist]);

  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  return { cart, inc, dec, setQty, clear, count };
}
