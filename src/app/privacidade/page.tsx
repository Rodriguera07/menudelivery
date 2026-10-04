import Link from 'next/link';
import { Logo } from '@/components/Logo';

export const metadata = {
  title: 'Política de Privacidade — Menu Delivery',
  description: 'Como o Menu Delivery coleta, usa e protege os dados de lojistas e clientes.',
};

const ATUALIZADO_EM = '1 de outubro de 2026';

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-brand-wash">
      <header className="border-b border-line bg-surface/85 backdrop-blur">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 h-16 flex items-center">
          <Link href="/" aria-label="Menu Delivery — início"><Logo /></Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-5 sm:px-6 py-14">
        <p className="text-brand text-xs font-bold uppercase tracking-wider">Legal</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink mt-2">Política de Privacidade</h1>
        <p className="text-sm text-muted mt-2">Última atualização: {ATUALIZADO_EM}</p>

        <div className="mt-10 space-y-8 text-ink leading-relaxed [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-2 [&_p]:text-muted [&_p]:mt-2 [&_li]:text-muted [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          <section>
            <p className="text-muted">
              Esta política explica quais dados o Menu Delivery coleta, para que servem e quais direitos
              você tem sobre eles, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº
              13.709/2018). Ela se aplica tanto a lojistas quanto a clientes que usam a plataforma.
            </p>
          </section>

          <section>
            <h2>1. Quais dados coletamos</h2>
            <p><strong>De lojistas:</strong> nome do responsável, e-mail, senha (armazenada apenas como hash, nunca em texto puro), número de WhatsApp da loja, chave Pix, nome e categoria da loja, e as imagens que você enviar (logo, banner, fotos de produto).</p>
            <p><strong>De clientes:</strong> nome, telefone, e-mail (opcional), senha (hash), endereços de entrega cadastrados, e o histórico de pedidos feitos em cada loja.</p>
            <p><strong>Automaticamente:</strong> cookies de sessão (para manter você logado) e, quando habilitado, dados técnicos de uso agregados para monitoramento de erros e estatísticas de acesso.</p>
          </section>

          <section>
            <h2>2. Para que usamos esses dados</h2>
            <ul>
              <li>Criar e autenticar sua conta (lojista ou cliente);</li>
              <li>Processar e exibir pedidos entre cliente e loja;</li>
              <li>Enviar a mensagem formatada do pedido para o WhatsApp da loja;</li>
              <li>Gerar o QR Code de pagamento Pix com a chave cadastrada pela própria loja;</li>
              <li>Prevenir fraude e uso indevido (ex.: bloqueio temporário após várias tentativas de senha erradas);</li>
              <li>Diagnosticar e corrigir falhas técnicas da plataforma.</li>
            </ul>
          </section>

          <section>
            <h2>3. Com quem compartilhamos</h2>
            <p>Não vendemos dados pessoais. Compartilhamos o mínimo necessário com prestadores que operam a infraestrutura da plataforma:</p>
            <ul>
              <li><strong>Meta (WhatsApp Cloud API)</strong> — para entregar a mensagem do pedido no WhatsApp da loja;</li>
              <li><strong>Vercel</strong> — hospedagem da aplicação, banco de dados e armazenamento de imagens;</li>
              <li><strong>Resend</strong> — envio de e-mails transacionais (ex.: recuperação de senha);</li>
              <li>Ferramentas de monitoramento de erros, usadas apenas para identificar falhas técnicas, não para fins comerciais.</li>
            </ul>
            <p>O pagamento via Pix acontece diretamente entre cliente e loja, usando a chave Pix cadastrada pelo próprio lojista — a plataforma não processa nem retém esse valor.</p>
          </section>

          <section>
            <h2>4. Por quanto tempo guardamos</h2>
            <p>Mantemos os dados enquanto sua conta estiver ativa. Se você solicitar a exclusão da conta, removemos os dados pessoais identificáveis, exceto quando a lei exigir retenção (ex.: obrigações fiscais sobre pedidos já realizados).</p>
          </section>

          <section>
            <h2>5. Seus direitos</h2>
            <p>Conforme a LGPD, você pode solicitar a qualquer momento:</p>
            <ul>
              <li>Confirmação de quais dados temos sobre você e acesso a eles;</li>
              <li>Correção de dados incompletos ou desatualizados;</li>
              <li>Exclusão dos seus dados (sujeito às exceções legais citadas acima);</li>
              <li>Portabilidade dos seus dados a outro fornecedor;</li>
              <li>Revogação do consentimento, quando aplicável.</li>
            </ul>
            <p>Para exercer qualquer um desses direitos, entre em contato pelo e-mail abaixo.</p>
          </section>

          <section>
            <h2>6. Segurança</h2>
            <p>Senhas são armazenadas com hash (bcrypt), sessões usam cookies seguros e assinados, e o acesso aos dados de cada loja é isolado — um lojista nunca enxerga dados de outra loja.</p>
          </section>

          <section>
            <h2>7. Contato</h2>
            <p>Dúvidas sobre esta política ou sobre seus dados? Escreva para <a href="mailto:privacidade@menudelivery.app" className="text-brand font-semibold">privacidade@menudelivery.app</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-line">
          <Link href="/" className="text-sm font-semibold text-brand">← Voltar para o início</Link>
        </div>
      </article>
    </main>
  );
}
