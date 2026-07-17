# Rapidinha — Design v2 (arquitetura + interface)

Redesign completo do sistema, usando os achados da auditoria de segurança e
performance (2026-07-15) como requisitos de projeto, não como remendos.
Decisões de hospedagem já tomadas: Cloudflare Pages + Supabase (`sa-east-1`)
com Supabase Realtime.

---

## Parte 1 — Arquitetura

### Princípio único

> **O servidor é a autoridade. O cliente é uma view.**

Todos os achados graves da auditoria (credencial no bundle, role em
`localStorage`, senha em texto plano, decremento de estoque no navegador)
derivam da mesma causa: o MVP tratava o navegador como dono dos dados. O v2
inverte isso — preço, estoque, papel do usuário e status de pedido têm uma
única fonte de verdade: o Postgres, protegido por RLS.

### 1. Autenticação — um caminho só

| Hoje | v2 |
|---|---|
| Dois caminhos (Supabase real + "demo" em `localStorage`), selecionados por env | **Só Supabase Auth em produção.** Sem Supabase configurado, produção mostra tela de indisponibilidade — nunca degrada para o modo demo |
| Contas demo com senha em texto plano no `localStorage` (SEC-04) | Modo demo **existe apenas em `import.meta.env.DEV`** (desenvolvimento e testes), tree-shaken do bundle de produção — mesmo mecanismo já aplicado à credencial admin no PR #11 |
| Sessão espelhada em `localStorage` próprio (`rapidinha-session`) | Sessão fica **somente** no storage do SDK Supabase; o app deriva o estado de `supabase.auth.onAuthStateChange` |

Resolve: SEC-04 e o resto de SEC-01. Arquivo alvo: `src/auth/demoAuth.ts`
(compilação condicional), `src/App.tsx` (remoção de `readSession`/`saveSession`).

### 2. Autorização — papel vem da tabela, não do cliente

| Hoje | v2 |
|---|---|
| `role` lido de `user_metadata`/`localStorage` (`App.tsx:138`) — falsificável no cliente (SEC-02) | O app carrega o **próprio perfil** de `public.profiles` (RLS: `profiles_select_own_or_management`) após o login e guarda em memória. O gate de `/admin` usa `profile.role`, vindo do servidor |
| Gate de rota é a única barreira | Gate de rota vira **UX**; a barreira real são as policies RLS de staff que já existem (`orders_update_staff`, `products_write_management`, `inventory_update_management`) — nenhuma mutação de admin funciona sem papel verdadeiro no banco |

Consequência importante: adulterar o cliente passa a dar acesso apenas a uma
tela vazia — toda leitura/escrita privilegiada falha no banco.

### 3. Dados — catálogo, estoque e pedidos saem do seed

| Hoje | v2 |
|---|---|
| `products`/`inventory`/`orders` são estado React a partir de `src/data/seed.ts` (`App.tsx:181-185`) | Leitura direta do Supabase com os tipos de `database.types.ts`. `src/domain` (Cart, InventoryItem…) permanece como camada de modelo da UI, hidratada do banco |
| Fila do admin é local e some no reload | Fila = `orders` com `status in ('queued','preparing','ready')`, via query + Realtime |

### 4. Escrita — toda mutação é RPC ou update coberto por RLS

- **Checkout:** RPC atômica `checkout(p_items, p_pickup_time, p_payment_method)`
  — decremento condicional `UPDATE inventory ... WHERE (quantity - reserved) >= q`
  na mesma transação do pedido (anti-oversell; detalhado em
  `docs/fase-2-checkout-atomico.md` a criar na implementação).
- **Admin:** avançar pedido, ajustar estoque/preço e pausar produto viram
  updates diretos nas tabelas, autorizados pelas policies de staff. O undo local
  (`adminHistory`) é substituído por `stock_movements` como trilha de auditoria.
- O cliente **nunca** envia preço, total ou papel.

### 5. Tempo real

- Publicação `supabase_realtime` nas tabelas `inventory` e `orders`.
- Canal de estoque: todos os clientes assinam `postgres_changes` de
  `inventory` (UPDATE) → quantidade atualiza ao vivo no cardápio.
- Canal de pedidos: aluno assina os próprios pedidos (RLS filtra), admin
  assina a fila. **A edge function `order-status` fica redundante e é
  removida** (resolve SEC-06 — endpoint órfão exposto).
- Edge function `customer-preferences` permanece (única function).

### 6. Deploy e plataforma

- **Cloudflare Pages** (PR #12): `_headers` com CSP/HSTS/etc., `_redirects`
  para SPA. GitHub Pages vira espelho estático de demonstração; Vercel opcional.
- CSP como restrição de design: **zero request externo** — fontes self-hosted,
  ícones inline, sem CDN.
- PWA (manifest + service worker) entra após a UI v2.

### 7. Orçamento de performance (vindo da auditoria)

| Item | Hoje (medido) | Orçamento v2 |
|---|---|---|
| JS inicial (gzip) | 144 KB, 1 chunk + admin split | ≤ 120 KB, split por rota (`/admin`, `/auth/*`, contas) |
| Logo | PNG 363 KB | SVG ou WebP ≤ 20 KB |
| Fontes | 0 baixadas (Inter declarado mas nunca carregado) | 1 arquivo woff2 subset (display) ≤ 40 KB; corpo em fonte de sistema |
| Assets mortos | `canteen-ordering.png` 1,9 MB no repo | removido |
| Cache | `max-age=600` | `/assets/*` imutável (já nos PRs #11/#12) |
| LCP | — | Hero textual, sem imagem no caminho crítico |

---

## Parte 2 — Interface (UI v2)

### Sujeito e tese

Cantina escolar com hora marcada: o aluno tem **um intervalo curto** e a
cantina tem **uma ficha de retirada**. A interface inteira se organiza em
torno desses dois objetos reais — o cardápio (quadro de preços) e a ficha
(código de retirada). O trabalho da tela principal é: escolher rápido,
confirmar, receber a ficha.

### Direção

**"Ficha de cantina"** — o vernáculo gráfico das cantinas brasileiras:
cardápio com linha pontilhada até o preço, carimbo de status, ficha numerada
de balcão. Moderno na execução (grotesca contemporânea, espaçamento
disciplinado), mas todos os dispositivos gráficos vêm do mundo real da
cantina — nada de dashboard genérico.

### Tokens

Paleta (reduz as 10 cores atuais para 5 com papéis claros):

| Token | Hex | Papel |
|---|---|---|
| `papel` | `#FCFBF7` | Fundo — branco quente de papel de ficha |
| `tinta` | `#231F1C` | Texto, quadro do cardápio |
| `vermelho` | `#C82828` | **Única cor de ação** (mantém a marca) + ficha |
| `verde-quadro` | `#2F5D50` | Disponibilidade, confirmações |
| `cinza-lapis` | `#7A736C` | Texto secundário, hairlines `#E7E2DA` |

Saem: wine, gold, red-soft, cool-soft e os gradientes de fundo do `body`.

Tipografia (compatível com CSP e com o orçamento de fontes):

| Papel | Fonte | Entrega |
|---|---|---|
| Display (títulos, preços grandes) | **Bricolage Grotesque** 600–800 | 1 woff2 subset self-hosted (~30 KB) |
| Corpo | Pilha de sistema (`system-ui, "Segoe UI", Roboto…`) | 0 KB |
| Códigos de retirada, preços tabulares | Pilha mono de sistema (`ui-monospace, "Cascadia Mono", Consolas…`) | 0 KB |

### Assinatura: a Ficha de Retirada

O momento pós-checkout deixa de ser um badge num painel e vira **uma ficha**:
cartão vermelho com borda perfurada (radial-gradient), código de retirada
grande em mono (`F-7K2`), horário e fila — o objeto que o aluno mostra no
balcão. É o único elemento "alto" da interface; todo o resto é quieto.

### Dispositivos de menu (substituem o visual de dashboard)

- **Linha pontilhada nome→preço** nos itens do cardápio (vernáculo de menu,
  não decoração): `Pão de queijo ........ R$ 5,90`.
- **Carimbos de status** no lugar dos pills: uppercase, borda 1.5px,
  letterspacing; `ESGOTADO` levemente rotacionado (-4°), como carimbo de
  borracha. Tons: verde-quadro (disponível), tinta (poucas unidades),
  vermelho (esgotado).
- **Cabeçalho como quadro**: faixa fina de `tinta` com o horário do próximo
  intervalo — a pressão de tempo é informação, não enfeite.
- Emojis de categoria saem; entra inicial do produto em display sobre papel
  (ou foto real quando existir), sem gradientes.

### Movimento (pouco e significativo)

1. **Atualização de estoque em tempo real**: quando o Realtime altera a
   quantidade, o número pisca uma vez (fundo `verde-quadro` → transparente,
   400ms). O design torna o realtime visível.
2. **Entrada da ficha**: scale 1.06→1 com rotação -1.5°→0 (180ms), como
   carimbo batendo.
3. Nada mais anima. `prefers-reduced-motion` desliga os dois.

### Acessibilidade (piso de qualidade)

Foco visível em tudo (`outline` 2px `vermelho` com offset), contraste AA nos
5 tokens (verificado: tinta/papel 15.9:1, vermelho/papel 5.9:1,
verde-quadro/papel 6.7:1), alvos ≥ 40px, formulários com label real,
carimbos nunca são a única codificação (sempre texto).

### Telas (mesma arquitetura de informação, pele nova)

| Tela | Mudança principal |
|---|---|
| Login/Cadastro | Painel único centrado em `papel`, logo SVG novo, sem card duplo |
| Cardápio (aluno) | Lista de menu com pontilhado, carimbos, carrinho à direita como "comanda" |
| Ficha (pós-pedido) | Assinatura acima; substitui o painel "Meu pedido" |
| Admin | Mesmos tokens, fila como coluna de fichas pequenas; sem MetricCards decorativos |

---

## Parte 3 — Fases revisadas (design → implementação)

| Fase | Escopo | Critério de pronto |
|---|---|---|
| 0 | Merge dos PRs #11 (auditoria) e #12 (Cloudflare) | branches integradas em `main` |
| 1 | **Fundação v2**: auth único (demo só em DEV), sessão via SDK, role de `profiles`, dados do banco | login real; `/admin` só com `profiles.role` staff; catálogo vem do Postgres |
| 2 | **Checkout atômico** (RPC) + remoção de `order-status` | teste de concorrência: 2 compras do último item → 1 sucesso, 1 `insufficient_stock` |
| 3 | **Realtime** (inventory + orders) | estoque e fila atualizam <1s entre dois navegadores |
| 4 | **UI v2** (tokens, ficha, menu, carimbos) + logo SVG + fontes | orçamento de performance da Parte 1 cumprido; Lighthouse a11y ≥ 95 |
| 5 | PWA + piloto (1 turma) | instalável; piloto sem oversell |

Cada fase = uma branch + PR com lint/testes/build verdes e fluxo exercitado.
