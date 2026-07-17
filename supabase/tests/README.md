# Testes de banco — modelo v3 (multi-cantina)

Dois cenários obrigatórios antes de qualquer release que toque estoque/RLS:

1. **Concorrência (anti-oversell)** — duas compras simultâneas do último item
   devem resultar em exatamente 1 sucesso e 1 erro `insufficient_stock`.
2. **Isolamento entre cantinas** — staff de uma cantina não lê nem altera
   pedidos/produtos/estoque de outra; cliente não escala privilégio.

## Variante local (Supabase local / psql)

Requer Docker (`npx supabase start`). Os arquivos desta pasta são para esta
variante:

- `seed_test.sql` — massa de teste (2ª cantina, usuários, produto com estoque 1).
- `concurrency_session1.sql` / `concurrency_session2.sql` — rodar em dois psql
  em paralelo (a sessão 1 segura a transação 3s; a 2 deve bloquear e falhar
  com `insufficient_stock`).
- `isolation.sql` — asserts de RLS (contagens 0/1 e UPDATEs com 0 linhas).

## Variante hospedada (executada em 2026-07-17)

Sem Docker disponível, os mesmos cenários foram executados contra o projeto
hospedado via API REST (PostgREST), com massa de teste equivalente criada e
removida ao final:

1. 3 usuários de teste criados em `auth.users` + password grant
   (`/auth/v1/token`) para obter JWTs reais.
2. Concorrência: 2 `curl` paralelos em `/rest/v1/rpc/checkout` disputando
   estoque = 1 → resultado observado: HTTP 200 (order + pickup_code) e
   HTTP 400 `insufficient_stock`, com tempos sobrepostos (~0,29s cada).
3. Isolamento: `GET/PATCH /rest/v1/orders` e `PATCH /rest/v1/products` com
   JWT de staff/cliente → 0 linhas fora do escopo; `POST /rest/v1/canteen_staff`
   como cliente → HTTP 403 (violação de RLS).
4. Limpeza: apenas os IDs fixos de teste removidos; usuários reais e catálogo
   preservados.
