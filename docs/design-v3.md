# Rapidinha — Design v3 (marketplace de cantinas, estilo iFood)

Versão de comparação com o [design v2](design-v2.md). O v2 redesenha o app de
**uma** cantina; o v3 transforma o Rapidinha em **marketplace**: várias
cantinas do campus dentro do mesmo app, cada uma com cardápio, estoque, fila
e equipe próprios — o aluno descobre, escolhe e pede, como num iFood do campus.

Tudo da Parte 1 do v2 continua valendo (servidor como autoridade, auth único,
RLS, checkout atômico, realtime, Cloudflare + Supabase). O v3 é um **delta**
sobre essa fundação.

---

## 1. Modelo de dados — o que muda

```
canteens                        ← NOVA: a entidade central do marketplace
  id uuid pk
  slug text unique              (ex.: 'cantina-central', 'cafe-bloco-4')
  name text
  location text                 (bloco/prédio no campus)
  open_from time, open_until time
  prep_minutes int              (tempo médio de preparo)
  active boolean

canteen_staff                   ← NOVA: papel POR CANTINA (substitui o papel global)
  canteen_id uuid fk → canteens
  profile_id uuid fk → profiles
  role       'employee' | 'manager'
  pk (canteen_id, profile_id)

products      + canteen_id uuid fk → canteens
orders        + canteen_id uuid fk → canteens
inventory     (inalterada — 1:1 com products, herda a cantina)
profiles.role passa a ser 'customer' | 'admin'   (admin = dono da plataforma)
```

Regra de negócio herdada do iFood: **um pedido pertence a uma única cantina**.
Carrinho com itens de duas cantinas vira dois pedidos (ou o app mantém uma
comanda por cantina, que é o que o mockup faz).

## 2. Autorização — RLS por cantina

O v2 usa papel global (`profiles.role in ('employee','manager','admin')`).
No v3 as policies de staff passam a checar **vínculo com a cantina da linha**:

```sql
-- exemplo: atualizar pedidos só da própria cantina
create policy "orders_update_staff" on public.orders
for update to authenticated
using (
  exists (
    select 1 from public.canteen_staff cs
    where cs.profile_id = (select auth.uid())
      and cs.canteen_id = orders.canteen_id
  )
  or exists (select 1 from public.profiles p
             where p.id = (select auth.uid()) and p.role = 'admin')
);
```

Mesmo padrão para `products`, `inventory` e `stock_movements`. A RPC
`checkout` ganha validação de que **todos os itens pertencem à mesma cantina**
e grava `canteen_id` no pedido — o mecanismo anti-oversell não muda.

## 3. Navegação e telas

| Rota | Tela | Novidade vs v2 |
|---|---|---|
| `/` | **Descoberta**: busca, filtros por categoria, cards de cantina (bloco, tempo de preparo, fila ao vivo, aberta/fechada) | NOVA — a "home do iFood" |
| `/cantina/:slug` | Cardápio da cantina (o v2 inteiro vive aqui) | escopo por cantina |
| `/pedidos` | Fichas ativas e histórico, agrupadas por cantina | NOVA |
| `/gestao` | Painel da equipe — só as cantinas onde o usuário é staff; seletor se for staff de mais de uma | escopo por cantina |
| `/admin` | Dono da plataforma: cadastra cantinas e vincula equipes | NOVA |

Realtime: canais filtrados por cantina
(`postgres_changes … filter: canteen_id=eq.X`) — o aluno na tela da Cantina
Central não recebe eventos do Café do Bloco 4. Na home, um canal leve de fila
(`orders` com status `queued`, agregado por cantina) alimenta o "fila: N" dos
cards ao vivo.

## 4. UI — mesma identidade, paradigma de app

A direção "ficha de cantina" do v2 (paleta de 5 tons, Bricolage, pontilhado,
carimbos, ficha) **permanece** — é a marca. O que muda é o paradigma:

- **Mobile-first com navegação inferior** (Início · Pedidos · Perfil), como
  app de delivery — o uso real é no celular, andando pelo campus.
- **Card de cantina** é o novo objeto central da home: nome em display,
  bloco, tempo de preparo, fila ao vivo e carimbo ABERTA/FECHADA.
- **Uma comanda por cantina** (badge no card quando há itens), pedido e ficha
  sempre de uma cantina só; a ficha ganha o nome da cantina no canhoto.

## 5. Comparação v2 × v3

| Critério | v2 — uma cantina | v3 — marketplace |
|---|---|---|
| Migrations novas | 1 (RPC checkout) | 3–4 (canteens, canteen_staff, FKs + reescrita das policies de staff) |
| Complexidade RLS | papel global (já existe) | papel por cantina (reescrever ~10 policies) |
| Telas novas | 0 (pele nova nas existentes) | +3 (descoberta, pedidos, admin da plataforma) |
| Esforço estimado | ~1 semana-pessoa sobre a fundação | ~2,5–3 semanas-pessoa sobre a fundação |
| Faz sentido quando | 1 cantina piloto (estado atual) | ≥ 2 cantinas reais interessadas, ou parceria com a instituição |
| Risco | baixo | médio: complexidade paga antes de existir a 2ª cantina |

## 6. Recomendação

**Modelar o banco como v3 desde já; entregar a UI como v2.**

O caro de mudar depois é o schema e as policies — não a tela. Criar
`canteens`/`canteen_staff` agora, com **uma** linha de cantina e as policies
por vínculo, custa ~2 dias a mais na Fase 1 e evita uma migração dolorosa de
dados em produção quando a 2ª cantina chegar. A home de descoberta, `/pedidos`
e o admin da plataforma ficam em uma **Fase 6** que só é puxada quando houver
segunda cantina assinada — aí é só ligar a tela, o banco já estará pronto.

| Fase (revisada) | Escopo |
|---|---|
| 1 | Fundação **com schema multi-cantina** (canteens com 1 linha, staff por vínculo) |
| 2–5 | Iguais ao v2 (checkout, realtime, UI v2, PWA + piloto) |
| 6 (gatilho: 2ª cantina) | Home de descoberta, `/pedidos`, admin da plataforma, comanda por cantina |
