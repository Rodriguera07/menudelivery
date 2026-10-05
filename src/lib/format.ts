export function formatBRL(value: number | string) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function parseBRL(input: string): number {
  const normalized = input.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  return Number(normalized);
}

/** Remove tudo que não é dígito — garante que o mesmo telefone sempre vira a mesma
 * string, independente de como foi digitado/mascarado (parênteses, espaço, hífen). */
export function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}
