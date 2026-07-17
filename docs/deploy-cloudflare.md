# Deploy no Cloudflare Pages

O Rapidinha é uma SPA (Vite + React). O Cloudflare Pages serve o conteúdo
estático de `dist/` a partir de um POP no Brasil (GRU), com free tier de
requisições/banda ilimitadas e sem restrição de uso comercial.

## Arquivos de configuração no repositório

- `public/_redirects` — fallback de SPA: qualquer rota não-estática cai em
  `/index.html` com status 200 (necessário para o `BrowserRouter`).
- `public/_headers` — headers de segurança (CSP, HSTS, X-Frame-Options,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy) e cache imutável
  para `/assets/*`. O Vite copia `public/` para a raiz de `dist/`, então o
  Cloudflare Pages lê esses arquivos automaticamente.

## Passos no painel do Cloudflare (feitos por você)

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git** → selecione o repositório `Luiz192512/digital-flavor`.
2. Configuração de build:
   - **Framework preset:** `Vite` (ou None).
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** defina a variável `NODE_VERSION = 20` (ou superior).
3. **Environment variables** (Production e Preview) — as mesmas do `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - (opcional) `VITE_SUPABASE_PASSWORD_AUTH = true`
4. Salve e faça o primeiro deploy. A URL será `https://<projeto>.pages.dev`.
5. **Supabase:** em Authentication → URL Configuration, adicione o domínio
   `https://<projeto>.pages.dev` (e o custom domain, se houver) às
   *Redirect URLs*, para o OAuth/redirect de senha funcionarem.
6. **CORS das edge functions:** adicione a origem `https://<projeto>.pages.dev`
   à allowlist em `supabase/functions/_shared/cors.ts` e re-deploy das functions.

## Observações

- O deploy Vercel e o GitHub Pages podem coexistir; os scripts de Analytics do
  Vercel só carregam quando o host termina em `.vercel.app` (ver `src/main.tsx`).
- O `vercel.json` segue válido para o deploy Vercel; no Cloudflare quem vale é o
  `public/_headers`.
