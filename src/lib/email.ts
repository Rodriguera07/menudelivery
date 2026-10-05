import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// Best-effort, igual ao padrão do whatsapp-evolution.ts: sem a chave configurada,
// retorna {ok:false} em vez de derrubar o fluxo de "esqueci minha senha".
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<{ ok: boolean }> {
  if (!resend) return { ok: false };
  try {
    const { error } = await resend.emails.send({
      from: `Menu Delivery <${FROM}>`,
      to,
      subject: 'Redefinir sua senha — Menu Delivery',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#1D1B1A">Redefinir sua senha</h2>
          <p style="color:#3D3A37">Clique no link abaixo para escolher uma nova senha. Ele vale por 30 minutos e só pode ser usado uma vez.</p>
          <p style="margin:24px 0">
            <a href="${resetUrl}" style="background:#D0101F;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">Redefinir senha</a>
          </p>
          <p style="color:#6B6662;font-size:13px">Se você não pediu isso, ignore este e-mail — sua senha continua a mesma.</p>
        </div>
      `,
    });
    if (error) return { ok: false };
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
