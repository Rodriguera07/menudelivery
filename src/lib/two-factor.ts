import { randomInt } from 'crypto';

export const TWO_FACTOR_CODE_MINUTES = 5;

export function generateTwoFactorCode() {
  return String(randomInt(100000, 1000000)); // 6 dígitos
}

export function buildTwoFactorMessage(code: string) {
  return `*Menu Delivery*\nSeu código de verificação é *${code}*.\nVale por ${TWO_FACTOR_CODE_MINUTES} minutos. Não compartilhe com ninguém.`;
}
