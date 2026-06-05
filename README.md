# Digital Flavor

Sistema web para pedidos antecipados e gestao sustentavel de cantinas escolares.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Supabase Auth + PostgreSQL + Row Level Security
- Vercel para deploy
- Vitest, Testing Library e Playwright

## Requisitos avaliativos

- Interface front-end responsiva para aluno e gestao da cantina.
- Modelagem orientada a objetos em `src/domain`.
- Estruturas de dados: lista, fila FIFO e pilha.
- Proposta de valor: reduzir filas, controlar estoque e diminuir desperdicio de alimentos.
- Estudo das cores aplicado ao design: verde para sustentabilidade, azul para operacao, laranja para acao/compra e vermelho para risco.

## Como rodar

```bash
npm install
npm run dev
```

## Variaveis de ambiente

Crie `.env.local` com:

```bash
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
```

Sem essas variaveis, a interface continua funcionando com dados locais de demonstracao.

## Supabase

A migration inicial esta em `supabase/migrations/20260604225344_initial_digital_flavor_schema.sql`.

Ela cria:

- perfis de usuario;
- produtos;
- estoque;
- pedidos;
- itens de pedido;
- pagamentos;
- movimentacoes de estoque;
- RLS por perfil.

## Validacao

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

## Deploy na Vercel

O projeto inclui `vercel.json` para build Vite:

- build command: `npm run build`
- output directory: `dist`
- environment variables: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
