# CardápioZap

Cardápio online multi-loja com pedido direto pelo WhatsApp — o cliente acessa pelo link
(`cardapiozap.app/[slug]`), monta o carrinho, paga via Pix/débito/crédito/dinheiro e o
pedido cai automaticamente no WhatsApp da loja. Cada lojista tem seu próprio painel admin
(produtos, preços, cupons, horários, relatório de vendas), com dados isolados por loja.

## Onde paramos (atualizado em 2026-09-28)

- **Protótipo validado**: `docs/prototype.html` — mockup navegável (HTML/JS puro, sem build)
  com todo o fluxo do cliente e do lojista, visual estilo iFood. Está publicado também em
  https://claude.ai/artifact/DCUJBvvKkcmkHDETGtHQnz — use como referência de design e de
  regras de negócio (cupons, comissão de 12%, horários por dia da semana, etc.) ao portar
  cada tela para componentes React de verdade.
- **Este projeto**: backend/app real em Next.js (App Router) + Prisma, criado em 2026-09-26
  para substituir o protótipo peça por peça. **Ainda não é um repositório git** — nada foi
  commitado, o progresso está só no disco.
- **Infra provisionada**: projeto linkado à Vercel (`rodrigos-projects-49d47660/cardapiozap`)
  e banco Postgres Neon já rodando em produção (região `gru1`/São Paulo, plano free), com as
  migrations do schema aplicadas. Credenciais em `.env` (Prisma/local) e `.env.local` (puxadas
  da Vercel via `vercel env pull`). Vercel Blob também provisionado (`cardapiozap-uploads`,
  acesso público, `BLOB_READ_WRITE_TOKEN` em `.env.local`) para upload de logo das lojas.
- **Feito até agora** (itens 1–8 do roteiro abaixo, todos testados ponta a ponta contra o Neon):
  1. Auth real de `Customer` e `Merchant` (bcrypt + JWT em cookie httpOnly), com cadastro de
     loja embutido no signup do lojista.
  2. CRUD de loja: produtos (com preço/promoção), cupons (percentual/fixo/frete grátis) e
     horário de funcionamento semanal, tudo isolado por `storeId`.
  3. Carrinho (client-side via `localStorage`) e checkout: aplica cupom, valida pedido mínimo
     e loja aberta, recalcula tudo no servidor e cria `Order` + `OrderItem`. Ao final mostra
     o número do pedido e um link `wa.me` pronto.
  4. Envio automático via WhatsApp Cloud API: ao criar o pedido, o servidor tenta mandar a
     mensagem formatada direto para o WhatsApp da loja (`src/lib/whatsapp-cloud.ts`,
     `POST /{phone_number_id}/messages` da Graph API) e grava `whatsappSentAt`. É
     best-effort — se `WHATSAPP_CLOUD_TOKEN`/`WHATSAPP_PHONE_NUMBER_ID` não estiverem
     configurados, ou a chamada falhar (ex.: fora da janela de sessão de 24h sem template
     aprovado), o pedido é criado normalmente e a tela de confirmação cai de volta no botão
     manual `wa.me`. **Ainda não testado contra a Cloud API de verdade** — falta o app no
     Meta for Developers (ver `.env.example` para o passo a passo de credenciais).
  5. Pix direto para o lojista (chave Pix própria, sem provedor/API nenhum): cada loja
     cadastra sua chave Pix em `/admin/loja` (campo `Store.pixKey`). No checkout com
     `paymentMethod: PIX`, o servidor gera localmente o payload "Pix Copia e Cola" (padrão
     EMV do Banco Central, `src/lib/pix-brcode.ts`, com CRC16 calculado na mão) e renderiza
     o QR code (`qrcode` npm, sem chamada de rede) na tela de confirmação (`PixPayment.tsx`).
     O dinheiro cai direto na conta do lojista — não passa pela plataforma, sem split. Sem
     confirmação automática: o lojista confirma manualmente clicando "Marcar como pago" na
     aba Pedidos do admin (`api/store/orders/[id]/pix-paid`), o que grava `pixPaidAt`; a
     tela do cliente faz polling em `api/stores/[slug]/orders/[id]/status` e atualiza sozinha
     quando isso acontece. Se a loja não tiver `pixKey` cadastrada, cai no texto "combine o
     Pix direto com a loja". **Testado ponta a ponta contra o Neon** (chave Pix cadastrada →
     pedido → QR renderizado → lojista marca como pago → status muda pro cliente).
  6. Painel do lojista — Pedidos e Mais vendidos: a aba Pedidos (`/admin`) agora lista todos
     os pedidos da loja com filtro por status, e o lojista avança o pedido pela máquina de
     estados `RECEIVED → PREPARING → OUT_FOR_DELIVERY → DELIVERED` (ou cancela a partir de
     qualquer estado não-terminal) via `api/store/orders/[id]/status`, que valida a transição
     no servidor (`src/lib/order-status.ts`) — não dá pra pular etapa nem reabrir um pedido
     entregue/cancelado. A confirmação de Pix (item 5) ficou junto na mesma lista, por pedido.
     A tela do cliente (`.../pedido/[id]`) agora mostra o status real (antes ficava travado em
     "RECEBIDO"). Nova aba **Mais vendidos** (`/admin/mais-vendidos`) mostra o faturamento dos
     últimos 7 dias (gráfico de barras em SVG, pedidos cancelados não contam) e o ranking dos
     produtos mais vendidos (usa o campo `Product.sold`, já incrementado desde o item 3).
     **Testado ponta a ponta contra o Neon**, incluindo transição de status inválida rejeitada
     pela API. O que ainda não existe: edição/reabertura de pedido e exportação de relatório.
  7. Upload de logo via Vercel Blob (store `cardapiozap-uploads`, acesso público): lojista
     envia PNG/JPG/WEBP até 4MB em `/admin/loja` (`LogoUploader.tsx`), a imagem é validada no
     servidor (`api/store/logo`) e a antiga é apagada do Blob ao trocar. A logo aparece no
     cardápio público e no cabeçalho do painel. **Testado ponta a ponta** (upload real via
     curl contra o Blob de produção, troca apaga o arquivo antigo — confirmado 404 na URL
     velha — e tipo inválido é rejeitado com 400).
  8. Rate limiting de login (5 tentativas erradas → 15 min de bloqueio, guardado no banco em
     `Merchant`/`Customer`, `src/lib/rate-limit.ts`) e 2FA por WhatsApp pro lojista (código de
     6 dígitos, sessão pendente curta antes do painel, bloqueado de ativar sem
     `WHATSAPP_CLOUD_TOKEN` configurado). Detalhes completos no roteiro, item 8 abaixo.
     **Testado ponta a ponta contra o Neon.**
- **Onboarding do lojista**: a `/` agora é uma landing page de verdade (hero + "Criar minha
  loja grátis" → `/admin/login?tab=signup`, que já abre na aba certa via `useSearchParams`).
  Depois do cadastro, em vez de cair direto no painel, o lojista passa por
  `/admin/bem-vindo` — tela mostrando o link da loja em destaque (montado a partir do host
  da própria requisição via `next/headers`, então funciona igual em localhost e em produção,
  sem domínio fixo no código), botão de copiar, e CTA pra já cadastrar produtos. O cabeçalho
  do painel (`admin/(dashboard)/layout.tsx`) ganhou um link fixo "Ver minha loja ↗️" que abre
  a vitrine em nova aba. **Testado ponta a ponta** (build de produção + fluxo via curl): landing
  → link com tab pré-selecionada → signup → bem-vindo com link correto → "Ver minha loja" no
  painel.
- **Redesign visual (landing + login do lojista)**: landing page (`src/app/page.tsx`) reescrita
  com hero em duas colunas (headline/CTA + mockup de cardápio/WhatsApp em CSS puro, sem
  imagens), seção "Como funciona" (3 passos) e seção de confiança/segurança (4 pontos, todos
  reais: isolamento por `storeId`, senha com bcrypt, WhatsApp Cloud API oficial, Pix direto na
  conta do lojista — nada inventado/fabricado). Tela `/admin/login` ganhou um painel lateral
  (visível em telas grandes) reforçando os mesmos pontos de confiança. Ícones em
  `src/components/icons.tsx` (SVG inline, sem lib nova). **Verificado via build de produção +
  checagem de conteúdo renderizado por curl — não inspecionado visualmente pixel a pixel**
  (sem ferramenta de screenshot neste ambiente); pedir validação visual ao usuário.
- **Fluxo de login do cliente com "next" seguro**: ao tentar acessar `/[slug]/carrinho` sem
  login, o redirect agora carrega `?next=/[slug]/carrinho`; depois de criar conta/entrar em
  `/[slug]/entrar`, o cliente volta direto pro carrinho (antes voltava pro cardápio e precisava
  clicar em "Ver carrinho" de novo). O `next` é validado no servidor (`entrar/page.tsx`) —
  só aceita caminhos que começam com `/[slug]`, nunca um destino externo vindo da URL (testado
  com `?next=https://evil.com`, cai de volta pro cardápio da própria loja).
- **Logotipo, tela de login do cliente e polimento geral**: criado `src/components/Logo.tsx`
  (marca própria — balão de conversa com linhas de cardápio dentro, com variante `inverse`
  pra usar em cima do gradiente da marca) substituindo o badge de texto "CZ" em todo o app;
  novo `src/app/icon.svg` (favicon, convenção nativa do Next.js, detectado automaticamente).
  A tela `/[slug]/entrar` (login do cliente) foi redesenhada: link "← Voltar ao cardápio",
  selo "Uma loja no CardápioZap" no rodapé, e animação de entrada. Adicionados utilitários de
  interação em `globals.css` (`.animate-fade-in-up`, `.card-hover`) usados na landing (cards
  com hover, mockup do celular com leve rotação ao passar o mouse) e nas telas de
  login/boas-vindas. Fundo unificado: `.bg-brand-wash` (também em `globals.css`) — um único
  gradiente radial suave (vermelho/laranja da marca sobre um branco quente `#fdfaf8`, em vez
  do cinza frio `bg-bg` padrão) reutilizado em `/`, `/admin/login`, `/[slug]/entrar` e
  `/admin/bem-vindo`, substituindo os blobs individuais que cada tela tinha antes (cada uma
  com posição/opacidade diferente) — agora as 4 telas usam exatamente o mesmo fundo.
  **Verificado via build de produção + checagem por curl, não inspecionado visualmente.**
- **Ajustes de feedback visual (3 pontos)**: (1) o painel esquerdo do `/admin/login` tinha um
  vão vazio entre o texto e a lista de confiança — preenchido com um mini-preview interativo
  do próprio painel (3 pedidos de exemplo + mini gráfico de barras, com hover). (2)
  `/admin/loja` era uma pilha de cards brancos sem hierarquia — reorganizado em seções com
  ícone + título + descrição ("Identidade da loja", "Entrega", "Pagamento Pix", "Horário de
  funcionamento", "Verificação em duas etapas"), mais um cabeçalho de página. (3) o cardápio
  público (`/[slug]`) ganhou banner com gradiente da marca, logo sobreposta (estilo perfil),
  chips de informação (taxa de entrega, pedido mínimo, aberto/fechado — com o horário de hoje
  quando cadastrado), navegação por categoria fixa no topo (quando há mais de uma) e um
  rodapé "Loja no CardápioZap". Nessa mesma passada corrigi um bug real que criei ao escrever
  o chip de horário: lojas sem `StoreHours` cadastrado mostravam "Fechado hoje" mesmo com
  `isOpen: true` — contradizia a fonte de verdade real (o toggle manual). Agora só mostra o
  horário de hoje quando ele existe; sem isso, cai num texto neutro ("Aberto agora"/"Fechado
  agora") baseado só em `isOpen`. **Testado ponta a ponta contra o Neon**, incluindo esse
  caso (loja sem horário → sem contradição; loja com horário de hoje cadastrado → mostra a
  faixa certa).
- **Segunda passada nas mesmas 2 telas** (a primeira foi sutil demais, o usuário confirmou
  visualmente que quase não mudou nada): `/admin/loja` ganhou um card de **preview ao vivo**
  no topo (`StorePreviewCard.tsx`) — mostra banner + logo + nome + tagline + badge
  aberto/fechado + chips de entrega/mínimo exatamente como o cliente vê, com link "Ver minha
  loja como cliente"; cada seção da página ganhou uma borda colorida grossa (`border-l-4`,
  uma cor por seção) em vez de só um ícone pequeno. O cardápio público (`/[slug]`) ganhou
  banner maior (h-36) com textura de pontos sutil, logo maior (24×24) sobrepondo mais forte,
  e os produtos deixaram de ser linhas simples com borda inferior pra virar **cards de
  verdade** (`Menu.tsx`): cada um com um quadrado colorido mostrando a inicial do nome (cor
  determinística por hash, cicla entre as 4 cores da marca — sem foto de produto ainda, mas
  não fica mais uma lista crua de texto) e cabeçalho de categoria com barra de acento
  colorida. **Verificado que o servidor realmente estava servindo o código novo** antes dessa
  segunda passada (não era problema de cache do navegador) — confirmado via curl direto
  contra a loja real do usuário (`siri-cascudo`) antes e depois da mudança.
- **Responsividade do painel (bug real, não só polimento) + redesign completo dos Pedidos**:
  o usuário mandou um print da aba Pedidos num monitor largo — o conteúdo (pensado
  mobile-first, `max-w-md`) ficava espremido no canto esquerdo, sobrando uma área cinza vazia
  enorme, e o print pegou justamente o estado vazio. Corrigido na base:
  `admin/(dashboard)/layout.tsx` e `AdminNav.tsx` agora envolvem header/nav/conteúdo num
  container `max-w-6xl mx-auto` — cascata pra todas as abas. Na sequência o usuário mandou o
  código-fonte de um quadro Kanban completo (mockup + captura de tela de referência) e pediu
  pra ficar "igual". Reescrito com dados reais do Neon (nada de mock):
  - `admin/(dashboard)/layout.tsx` — cabeçalho novo com fontes próprias (Bricolage Grotesque +
    DM Sans + IBM Plex Mono via `next/font/google`, isoladas do resto do app dentro de uma
    classe `.pp-root` — não mudou a fonte do site público nem do login), badge com iniciais da
    loja, toggle "Loja aberta/fechada" (antes vivia só em `/admin/loja`, agora é global e
    some do form de configurações pra não duplicar controle), "Copiar link da loja", "Ver
    minha loja", sino de notificação (ponto vermelho quando há pedido novo) — tudo em
    `HeaderControls.tsx` (client) + consultas ao Neon feitas no layout (server).
  - `AdminNav.tsx` — ícones por aba + contador de pedidos ativos ao lado de "Pedidos".
  - `admin/(dashboard)/page.tsx` + `PedidosBoard.tsx` — substituem o antigo `OrdersList.tsx`
    (removido). Página busca pedidos ativos (`RECEIVED`/`PREPARING`/`OUT_FOR_DELIVERY`,
    qualquer dia) + entregues **de hoje** + agregados do dia (faturamento, ticket médio,
    pedidos hoje, cancelados hoje) direto do Postgres. O quadro tem 4 colunas
    (Novos/Em preparo/Saiu p/ entrega/Entregues hoje), busca por número/cliente, badge
    "Atrasado" (>20 min sem avançar), confirmação inline pra cancelar, e o botão "Marcar Pix
    como pago" (que existia no design antigo) foi reincorporado — sem ele a feature do item 5
    teria regredido. O ícone de WhatsApp em cada card abre a mensagem formatada do pedido
    (reusa `buildOrderMessage`/`buildWaLink` — mesmo texto que iria automático se o item 4
    tivesse credenciais reais) direto pro WhatsApp da loja; o estado vazio ganhou botão
    "Compartilhar no WhatsApp" (abre `wa.me` com o link da loja pré-preenchido) além de
    copiar link. Cores/ícones/layout de cada peça seguem o exato código e a captura de tela
    que o usuário enviou. **Testado ponta a ponta contra o Neon**: 4 pedidos em 4 colunas
    diferentes, avanço de status validado pela máquina de estados existente, "Marcar Pix como
    pago" confirmado (inclusive continua disponível mesmo após a entrega, se ainda não
    confirmado), contador da aba Pedidos, estado vazio com o link de WhatsApp. Dados de teste
    limpos depois.
  - Ajuste rápido de espaçamento: o container `max-w-6xl mx-auto` que eu tinha colocado no
    cabeçalho/nav/conteúdo deixava tudo centralizado com margens grandes nas laterais ("cara
    de site institucional", nas palavras do usuário) em vez de ocupar a largura da tela como
    um app de verdade — a referência original não tinha nenhum limite de largura. Removido de
    `layout.tsx` e `AdminNav.tsx`; a aba `/admin/loja` (só formulários em coluna única) ganhou
    um `max-w-2xl` próprio, sem centralizar, pra não esticar os campos até a borda da tela.
- **Redesign completo: login do lojista + cardápio público** (código-fonte + captura de tela
  enviados pelo usuário, "siga conforme enviado"). Duas telas praticamente reescritas do zero,
  com o mesmo padrão visual isolado (`next/font/google` próprio, classe raiz `.lj-root`/
  `.lg-root`) já usado no painel — sem alterar a fonte/paleta do resto do site.
  - **`admin/login/page.tsx`**: assistente de cadastro em 2 etapas (dados da loja → dados de
    acesso) com barra de progresso, indicador de força de senha, prévia animada do painel à
    esquerda (dados ilustrativos, trocam a cada 2,6s — não é dado real, é só decoração, como
    o próprio código-fonte já dizia). Dois ajustes pra caber no que o backend exige e no que
    já existe de verdade: (1) o design não tinha campo pro nome do responsável — obrigatório
    no cadastro (`Merchant.ownerName`) — adicionei na etapa 2; (2) o 2FA por WhatsApp (item 8,
    feature real) não existia nesse design — reintegrado como uma terceira tela (código de 6
    dígitos) no mesmo estilo visual, ativada quando o login retorna `twoFactorRequired`.
    Removi o link "Esqueci minha senha" e o "Falar no WhatsApp" do design original: nenhum dos
    dois tem um destino real (não existe fluxo de recuperação de senha nem WhatsApp de suporte
    da plataforma) — um link morto/falso seria pior que não ter o link.
  - **`(store)/[slug]/LojaCardapio.tsx`** (substitui `Menu.tsx`, removido): cabeçalho fixo no
    desktop, capa com textura de pontos, cartão da loja com logo sobreposta, chips de
    entrega/mínimo, navegação por categoria sticky, seção "Mais pedidos" (destaque calculado
    de verdade — os 3 produtos com mais vendas, campo `Product.sold` já existente, só entram
    aqui se tiverem pelo menos 1 venda), sacola lateral fixa no desktop / barra + folha
    deslizante no celular. **O carrinho continua usando o hook `useCart` já existente**
    (localStorage por loja) — troquei o estado local `sacola` do design original por ele, senão
    o carrinho se perderia ao navegar pro checkout, que já lê desse mesmo hook. Produtos sem
    foto (`Product.photoUrl`, ninguém subiu foto ainda) caem num quadrado colorido com ícone
    por tipo (lanche/porção/bebida, deduzido do nome da categoria) em vez de aparecer vazio.
    Estado de sessão do cliente (nome + Sair vs. botão Entrar) preservado — não existia no
    design original, que sempre mostrava "Entrar". Não adicionei "tempo de entrega" (campo do
    tipo `Loja.tempoEntrega`): não existe no schema, e criar isso seria uma feature nova fora
    do que foi pedido — o componente já lida bem com ele ausente (esconde a informação).
  - **Testado ponta a ponta contra o Neon**: cadastro em 2 etapas → loja criada; login normal;
    login com 2FA (ativado manualmente no banco pra testar, mesma limitação de sempre — sem
    WhatsApp configurado o código não é entregue de verdade); cardápio com produto
    "mais pedido" calculado a partir de vendas reais; sessão do cliente refletida no
    cabeçalho; checkout completo (produto → pedido) funcionando depois da troca de carrinho.
    Dados de teste limpos, loja real do usuário (`siri-cascudo`) intacta o tempo todo.
- **Não testado com navegador real ainda**: os componentes client-side de carrinho (steppers
  de quantidade, barra flutuante "Ver carrinho", pré-preenchimento do endereço salvo) foram
  revisados por código e typecheck, mas não abertos num browser de verdade. O mesmo vale pro
  redesign visual desta seção — validado por HTML/build, não visualmente.

## Stack

- **Web (cliente + admin)**: Next.js 15 (App Router) + TypeScript + Tailwind
- **Banco de dados**: PostgreSQL via Prisma (schema multi-tenant em `prisma/schema.prisma`),
  hospedado no Neon via Vercel Marketplace
- **Auth**: JWT em cookie httpOnly (cliente e lojista são tabelas separadas — `Customer` e
  `Merchant`, cookies `cz_customer` e `cz_merchant`) — ver `src/lib/auth.ts`
- **Mobile**: React Native (Expo) — a decidir quando o backend estiver estável; ver decisão
  registrada de usar React Native (não Flutter) para reaproveitar o stack JS/TS do resto do
  portfólio (AgendaFácil, Pátio/TicketPark, Quiosque PDV)

## Como rodar

```bash
npm install
# .env e .env.local já existem neste ambiente com as credenciais do Neon.
# Em uma máquina nova: cp .env.example .env, preencher DATABASE_URL e JWT_SECRET,
# ou `vercel link` + `vercel env pull` para reusar o banco já provisionado.
npx prisma generate
npm run dev                # http://localhost:3000
```

Para testar o fluxo completo: cadastre uma loja em `/admin/login` (aba "Criar minha loja"),
adicione produtos em `/admin/produtos`, depois abra `/[slug-da-loja]` para montar um pedido
como cliente.

## Roteiro (próximos passos)

1. ~~**Auth real**~~ — feito.
2. ~~**CRUD de loja**~~ — feito.
3. ~~**Carrinho e checkout**~~ — feito.
4. ~~**Integração WhatsApp Cloud API**~~ — código pronto (`src/lib/whatsapp-cloud.ts`), mas
   falta configurar credenciais reais do Meta for Developers e testar ponta a ponta contra
   a Graph API. Hoje é best-effort com fallback pro link `wa.me` manual.
5. ~~**Pix direto para o lojista**~~ — feito e testado ponta a ponta. Cada loja usa a própria
   chave Pix (sem Mercado Pago/Stripe/nenhum provedor), QR gerado localmente, confirmação
   manual pelo lojista. Sem comissão automática — `commissionPct` continua só informativo;
   a monetização da plataforma vai ser uma mensalidade fixa (a implementar depois que o
   roteiro estiver completo), não uma comissão por pedido.
6. ~~**Painel do lojista — Pedidos e Mais vendidos**~~ — feito e testado ponta a ponta:
   lista completa de pedidos com filtro por status, máquina de estados validada no servidor,
   cancelamento, e aba Mais vendidos com gráfico de faturamento (7 dias) + ranking de produtos.
7. ~~**Onboarding de novos lojistas**~~ — feito e testado ponta a ponta. Landing page, tela de
   boas-vindas pós-cadastro e upload de logo via Vercel Blob (`src/app/api/store/logo/route.ts`
   — `POST` faz upload e apaga o blob antigo, `DELETE` remove; `LogoUploader.tsx` em
   `/admin/loja` com preview instantâneo). A logo aparece no cardápio público, no cabeçalho do
   painel e é validada no servidor (só PNG/JPG/WEBP, até 4MB).
8. ~~**Segurança de verdade**~~ — feito e testado ponta a ponta.
   - **Rate limiting** (`src/lib/rate-limit.ts`): guardado no banco, não em memória (memória
     não sobrevive entre invocações serverless) — `Merchant`/`Customer` ganharam
     `failedLoginAttempts`/`lockedUntil`. 5 senhas erradas bloqueiam a conta por 15 minutos
     (mesmo com a senha certa depois); mensagem de erro genérica em toda falha pra não revelar
     se o e-mail existe.
   - **2FA por WhatsApp do lojista**: ativa em `/admin/loja` (`TwoFactorToggle.tsx` →
     `api/store/merchant/two-factor`) — **bloqueado no servidor se `WHATSAPP_CLOUD_TOKEN`/
     `WHATSAPP_PHONE_NUMBER_ID` não estiverem configurados**, pra não deixar o lojista se
     trancar fora da própria conta ativando um 2FA que nunca vai chegar. Com 2FA ativo, login
     com senha certa não abre sessão direto: gera um código de 6 dígitos (`twoFactorCode` +
     expiração de 5 min em `Merchant`), manda por WhatsApp (reaproveita
     `sendWhatsAppText`), e abre uma sessão *pendente* de 10 min (`api/auth/merchant/login`)
     que só autoriza `api/auth/merchant/verify-2fa` — nunca o painel direto. Código errado
     conta pro mesmo bloqueio de 15 min; tem botão de reenviar (`api/auth/merchant/resend-2fa`).
   - Isolamento por `storeId` em toda query já estava feito e testado desde os itens 2 e 3.
   - **Testado ponta a ponta contra o Neon**: 5 senhas erradas → bloqueio 429 → senha certa
     também bloqueada enquanto trancado → desbloqueio → login normal; tentativa de ativar 2FA
     sem WhatsApp configurado rejeitada; fluxo completo de 2FA (login → sessão pendente →
     código errado rejeitado → código certo → sessão completa → painel acessível) testado
     ativando `twoFactor` manualmente no banco, já que o guard acima impede ativar pela UI
     sem credenciais reais do WhatsApp (mesma limitação do item 4 — só o envio de verdade
     pelo WhatsApp não foi exercitado).

## Estrutura

```
src/app/
  page.tsx                          → landing page (hero + CTA "Criar minha loja grátis")
  (store)/[slug]/page.tsx           → busca dados no Neon, repassa pra LojaCardapio.tsx
  (store)/[slug]/LojaCardapio.tsx   → cardápio público (client): capa, sacola, busca, categorias
  (store)/[slug]/entrar/            → cadastro/login do cliente
  (store)/[slug]/carrinho/          → checkout (cupom, endereço, pagamento)
  (store)/[slug]/pedido/[id]/       → confirmação do pedido + link wa.me
  admin/login/                      → cadastro/login do lojista (cria Store + Merchant)
  admin/bem-vindo/                  → tela pós-cadastro: link da loja em destaque + CTA
  admin/(dashboard)/                → layout protegido: cabeçalho+nav com fontes/visual
                                       próprios (Bricolage Grotesque/DM Sans, .pp-root)
    layout.tsx, AdminNav.tsx, HeaderControls.tsx  → cabeçalho (loja aberta, link, sino) + abas
    page.tsx, PedidosBoard.tsx        → quadro Kanban de pedidos (4 colunas, KPIs, busca)
    mais-vendidos/, produtos/, cupons/, loja/  → demais abas (loja/ com StorePreviewCard.tsx)
  api/auth/{customer,merchant}/     → signup/login/logout (JWT em cookie httpOnly)
  api/auth/merchant/{verify-2fa,resend-2fa}  → confirmação do código de 2FA no login
  api/store/{products,coupons,settings,hours}  → CRUD da loja logada (rotas do lojista)
  api/store/logo                    → upload/remoção da logo da loja (Vercel Blob)
  api/store/merchant/two-factor     → ativa/desativa o 2FA do lojista
  api/store/orders/[id]/status      → lojista avança/cancela o status do pedido (valida transição)
  api/store/orders/[id]/pix-paid    → lojista marca um pedido Pix como recebido
  api/stores/[slug]/{orders,coupons/validate}  → checkout público (rotas do cliente)
  api/stores/[slug]/orders/[id]/status  → cliente faz polling do status de pagamento Pix
src/lib/
  auth.ts          → hash de senha, JWT, sessões (cookie)
  validation.ts    → schemas zod de todos os formulários/rotas
  coupon.ts        → cálculo de desconto (compartilhado entre validar cupom e criar pedido)
  useCart.ts       → carrinho em localStorage (client-only)
  whatsapp.ts      → monta a mensagem e o link wa.me do pedido
  whatsapp-cloud.ts → envio automático da mensagem via WhatsApp Cloud API (Meta)
  pix-brcode.ts    → gera o payload "Pix Copia e Cola" (BR Code/EMV) local, sem provedor
  order-status.ts  → máquina de estados do pedido (labels, transição válida, próximo status)
  rate-limit.ts    → bloqueio de conta após várias senhas erradas (guardado no banco)
  two-factor.ts    → gera o código de 2FA e a mensagem enviada por WhatsApp
src/components/
  Logo.tsx         → marca CardápioZap (LogoMark + wordmark), variante inverse p/ fundo colorido
  icons.tsx        → ícones SVG inline reutilizados na landing e no login do lojista
prisma/schema.prisma                → modelo de dados multi-tenant
docs/prototype.html                 → protótipo de referência (design + fluxo completo)
```
