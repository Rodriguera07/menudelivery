export const TWO_FACTOR_CODE_MINUTES = 5;

export function generateTwoFactorCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 dígitos
}

export function buildTwoFactorMessage(code: string) {
  return `*CardápioZap*\nSeu código de verificação é *${code}*.\nVale por ${TWO_FACTOR_CODE_MINUTES} minutos. Não compartilhe com ninguém.`;
}
