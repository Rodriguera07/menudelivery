// Envio de WhatsApp via Evolution API (self-hosted, protocolo WhatsApp Web/Baileys).
// Cada loja conecta o PRÓPRIO número escaneando um QR code — sem verificação de
// empresa no Meta e sem exigir templates pré-aprovados, então dá pra mandar texto
// livre a qualquer momento (pedido novo, aviso de status, 2FA do lojista).
// A instância na Evolution API é identificada pelo próprio Store.id.
// Best-effort: se EVOLUTION_API_URL/EVOLUTION_API_KEY não estiverem configuradas
// (serviço ainda não hospedado), toda função retorna ok:false sem lançar erro —
// o pedido/login continuam funcionando normalmente, só sem o envio automático.

type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

function config(): { url: string; apiKey: string } | null {
  const url = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  if (!url || !apiKey) return null;
  return { url: url.replace(/\/$/, ''), apiKey };
}

async function call(path: string, init: RequestInit): Promise<Result<any>> {
  const cfg = config();
  if (!cfg) return { ok: false, error: 'Evolution API não configurada (faltam credenciais).' };

  try {
    const res = await fetch(`${cfg.url}${path}`, {
      ...init,
      headers: { apikey: cfg.apiKey, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const message = body?.message ?? body?.error ?? `HTTP ${res.status}`;
      return { ok: false, error: Array.isArray(message) ? message.join(', ') : String(message) };
    }
    return { ok: true, data: body };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erro desconhecido ao chamar a Evolution API.' };
  }
}

/** Cria a instância da loja na Evolution API (idempotente: já existente não é erro). */
export async function createInstance(storeId: string): Promise<Result> {
  const res = await call('/instance/create', {
    method: 'POST',
    body: JSON.stringify({ instanceName: storeId, qrcode: true, integration: 'WHATSAPP-BAILEYS' }),
  });
  if (res.ok) return { ok: true, data: undefined };
  if (/already|exist/i.test(res.error)) return { ok: true, data: undefined };
  return res;
}

/** Busca o QR code (base64) para conectar o número da loja via WhatsApp. */
export async function fetchQrCode(storeId: string): Promise<Result<string>> {
  const res = await call(`/instance/connect/${storeId}`, { method: 'GET' });
  if (!res.ok) return res;
  const base64 = res.data?.base64 ?? res.data?.qrcode?.base64;
  if (!base64) return { ok: false, error: 'QR code não disponível (instância pode já estar conectada).' };
  return { ok: true, data: base64 };
}

/** Estado atual da conexão: 'open' (conectado), 'connecting' ou 'close'. */
export async function fetchConnectionState(storeId: string): Promise<Result<string>> {
  const res = await call(`/instance/connectionState/${storeId}`, { method: 'GET' });
  if (!res.ok) return res;
  const state = res.data?.instance?.state ?? res.data?.state;
  return { ok: true, data: state ?? 'close' };
}

/** Desconecta o número da loja (logout da sessão WhatsApp Web). */
export async function logoutInstance(storeId: string): Promise<Result> {
  return call(`/instance/logout/${storeId}`, { method: 'DELETE' });
}

/** Envia uma mensagem de texto pelo número conectado da loja. */
export async function sendText(storeId: string, to: string, message: string): Promise<{ ok: boolean; error?: string }> {
  const digits = to.replace(/\D/g, '');
  const number = digits.startsWith('55') ? digits : `55${digits}`;

  const res = await call(`/message/sendText/${storeId}`, {
    method: 'POST',
    body: JSON.stringify({ number, text: message }),
  });
  return res.ok ? { ok: true } : { ok: false, error: res.error };
}
