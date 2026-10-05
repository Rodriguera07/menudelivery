import Link from 'next/link';
import { Logo } from '@/components/Logo';

export const metadata = {
  title: 'Termos de Uso — Menu Delivery',
  description: 'Regras de uso da plataforma Menu Delivery para lojistas e clientes.',
};

const ATUALIZADO_EM = '1 de outubro de 2026';

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-brand-wash">
      <header className="border-b border-line bg-surface/85 backdrop-blur">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 h-16 flex items-center">
          <Link href="/" aria-label="Menu Delivery — início"><Logo /></Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-5 sm:px-6 py-14">
        <p className="text-brand text-xs font-bold uppercase tracking-wider">Legal</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink mt-2">Termos de Uso</h1>
        <p className="text-sm text-muted mt-2">Última atualização: {ATUALIZADO_EM}</p>

        <div className="mt-10 space-y-8 text-ink leading-relaxed [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-2 [&_p]:text-muted [&_p]:mt-2 [&_li]:text-muted [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          <section>
            <p className="text-muted">
              Ao criar uma conta ou usar o Menu Delivery — seja como lojista ou como cliente — você concorda
              com estes termos. Leia com atenção antes de continuar.
            </p>
          </section>

          <section>
            <h2>1. O que é o Menu Delivery</h2>
            <p>O Menu Delivery é uma plataforma que permite a lojistas criar um cardápio online e receber pedidos, com o pedido sendo enviado formatado para o WhatsApp da loja e o pagamento via Pix feito diretamente na chave cadastrada pelo próprio lojista.</p>
          </section>

          <section>
            <h2>2. Cadastro e conta</h2>
            <ul>
              <li>Você deve fornecer informações verdadeiras no cadastro (nome, e-mail/telefone, WhatsApp, chave Pix quando aplicável);</li>
              <li>Você é responsável por manter sua senha em sigilo e por tudo que acontecer na sua conta;</li>
              <li>Lojistas são responsáveis pelo conteúdo do próprio cardápio: preços, descrições, fotos e disponibilidade dos produtos.</li>
            </ul>
          </section>

          <section>
            <h2>3. Pagamentos</h2>
            <p>O Menu Delivery não processa nem retém valores de pagamento. O Pix é gerado com a chave cadastrada pelo próprio lojista, e o valor vai direto da conta do cliente para a conta da loja — a plataforma não é parte nessa transação financeira e não se responsabiliza por erros na chave Pix cadastrada pelo lojista.</p>
          </section>

          <section>
            <h2>4. Pedidos e relação entre cliente e loja</h2>
            <p>A compra é feita diretamente entre cliente e loja. O Menu Delivery é um intermediário tecnológico — questões sobre qualidade do produto, prazo de entrega, trocas ou cancelamentos devem ser resolvidas diretamente com a loja através do WhatsApp informado.</p>
          </section>

          <section>
            <h2>5. Uso aceitável</h2>
            <p>É proibido usar a plataforma para:</p>
            <ul>
              <li>Cadastrar produtos ou serviços ilegais;</li>
              <li>Tentar acessar dados de outras lojas ou contas sem autorização;</li>
              <li>Enviar spam, tentar burlar limites de tentativa de login ou sobrecarregar a plataforma intencionalmente;</li>
              <li>Usar informações de outros usuários para fins diferentes dos previstos (ex.: usar o WhatsApp de um cliente para fins que não o pedido realizado).</li>
            </ul>
            <p>Contas que violarem essas regras podem ser suspensas ou encerradas.</p>
          </section>

          <section>
            <h2>6. Disponibilidade do serviço</h2>
            <p>Fazemos o possível para manter a plataforma no ar, mas não garantimos disponibilidade ininterrupta. Manutenções, falhas de infraestrutura de terceiros (ex.: provedor de WhatsApp, banco de dados) podem causar indisponibilidade temporária.</p>
          </section>

          <section>
            <h2>7. Mudanças nestes termos</h2>
            <p>Podemos atualizar estes termos de tempos em tempos. Mudanças relevantes serão comunicadas através da própria plataforma. O uso continuado após uma atualização significa que você concorda com os novos termos.</p>
          </section>

          <section>
            <h2>8. Contato</h2>
            <p>Dúvidas sobre estes termos? Escreva para <a href="mailto:contato@menudelivery.app" className="text-brand font-semibold">contato@menudelivery.app</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-line">
          <Link href="/" className="text-sm font-semibold text-brand">← Voltar para o início</Link>
        </div>
      </article>
    </main>
  );
}
