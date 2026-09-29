// Bloqueio de conta após várias senhas erradas — guardado no banco (não em memória),
// então funciona de verdade em serverless: cada tentativa é uma invocação isolada,
// um contador em memória se perderia entre uma chamada e outra.

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export function isLocked(lockedUntil: Date | null): { locked: boolean; retryAfterMinutes: number } {
  if (!lockedUntil || lockedUntil.getTime() <= Date.now()) {
    return { locked: false, retryAfterMinutes: 0 };
  }
  const retryAfterMinutes = Math.ceil((lockedUntil.getTime() - Date.now()) / 60_000);
  return { locked: true, retryAfterMinutes };
}

// Chamar após uma senha errada. Retorna os novos valores para gravar no registro.
export function registerFailedAttempt(currentAttempts: number): { failedLoginAttempts: number; lockedUntil: Date | null } {
  const attempts = currentAttempts + 1;
  if (attempts >= MAX_ATTEMPTS) {
    return { failedLoginAttempts: 0, lockedUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60_000) };
  }
  return { failedLoginAttempts: attempts, lockedUntil: null };
}

export const RATE_LIMIT = { MAX_ATTEMPTS, LOCKOUT_MINUTES };
