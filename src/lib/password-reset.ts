import { randomBytes, createHash } from 'crypto';
import { prisma } from '@/lib/prisma';

export const PASSWORD_RESET_MINUTES = 30;
const REQUEST_COOLDOWN_SECONDS = 60;

function hashToken(rawToken: string) {
  return createHash('sha256').update(rawToken).digest('hex');
}

type AccountRef = { merchantId: string } | { customerId: string };

// Cria um token novo pro e-mail de "esqueci minha senha". Retorna null se um
// token já foi emitido há menos de REQUEST_COOLDOWN_SECONDS (evita bombardear
// a caixa de entrada se alguém ficar reenviando o formulário).
export async function createPasswordResetToken(account: AccountRef): Promise<string | null> {
  const where = 'merchantId' in account ? { merchantId: account.merchantId } : { customerId: account.customerId };

  const last = await prisma.passwordResetToken.findFirst({ where, orderBy: { createdAt: 'desc' } });
  if (last && Date.now() - last.createdAt.getTime() < REQUEST_COOLDOWN_SECONDS * 1000) {
    return null;
  }

  const rawToken = randomBytes(32).toString('hex');
  await prisma.passwordResetToken.create({
    data: {
      ...where,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_MINUTES * 60_000),
    },
  });
  return rawToken;
}

// Valida e consome (marca como usado) um token recebido por link de e-mail.
export async function consumePasswordResetToken(rawToken: string): Promise<AccountRef | null> {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) return null;
  if (!record.merchantId && !record.customerId) return null;

  await prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });

  return record.merchantId ? { merchantId: record.merchantId } : { customerId: record.customerId as string };
}
