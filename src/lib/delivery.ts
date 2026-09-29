// Regras da taxa de entrega: valor único ou valor por bairro.
// Usado pelo painel (validação), pelo carrinho (mostrar a taxa) e pelo servidor
// ao criar o pedido (a taxa cobrada de verdade sai daqui, nunca do navegador).

export type DeliveryModeValue = 'FIXED' | 'BY_DISTRICT';
export type Zone = { name: string; fee: number; active?: boolean };

/** "Jardim Três Estrelas " -> "jardim tres estrelas" — para comparar bairros sem acento/maiúscula. */
export function normalizeDistrict(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function findZone(zones: Zone[], district: string) {
  const alvo = normalizeDistrict(district);
  if (!alvo) return null;
  return zones.find((z) => z.active !== false && normalizeDistrict(z.name) === alvo) ?? null;
}

export function resolveDeliveryFee(
  store: { deliveryMode: DeliveryModeValue; deliveryFee: number },
  zones: Zone[],
  district: string,
): { ok: true; fee: number } | { ok: false; error: string } {
  if (store.deliveryMode !== 'BY_DISTRICT') return { ok: true, fee: store.deliveryFee };
  const zone = findZone(zones, district);
  if (!zone) {
    return {
      ok: false,
      error: district.trim()
        ? `A loja não entrega no bairro "${district.trim()}". Escolha um dos bairros atendidos.`
        : 'Escolha o bairro de entrega.',
    };
  }
  return { ok: true, fee: zone.fee };
}

/** Menor e maior taxa entre os bairros ativos (para mostrar "a partir de"). */
export function feeRange(zones: Zone[]) {
  const fees = zones.filter((z) => z.active !== false).map((z) => z.fee);
  if (!fees.length) return null;
  return { min: Math.min(...fees), max: Math.max(...fees) };
}
