// Envio real de mensagem via WhatsApp Business Cloud API (Meta).
// Mensagem de texto simples (sessão) — exige que o número da loja tenha uma janela de
// conversa aberta com o número da plataforma nas últimas 24h. Fora dessa janela a Meta
// rejeita mensagens de texto iniciadas pela empresa (é preciso um template aprovado).
// Por isso o envio é best-effort: se falhar, o pedido continua criado normalmente e o
// link manual wa.me (src/lib/whatsapp.ts) segue disponível como fallback na tela de confirmação.

const API_VERSION = 'v21.0';

export async function sendWhatsAppText(to: string, body: string): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    return { ok: false, error: 'WhatsApp Cloud API não configurada (faltam credenciais).' };
  }

  const digits = to.replace(/\D/g, '');
  const recipient = digits.startsWith('55') ? digits : `55${digits}`;

  try {
    const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'text',
        text: { body },
      }),
    });

    if (!res.ok) {
      const detail = await res.json().catch(() => null);
      const message = detail?.error?.message ?? `HTTP ${res.status}`;
      return { ok: false, error: message };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erro desconhecido ao chamar a Cloud API.' };
  }
}
