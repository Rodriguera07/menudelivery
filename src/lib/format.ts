export function formatBRL(value: number | string) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function parseBRL(input: string): number {
  const normalized = input.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  return Number(normalized);
}
