// Origens autorizadas a chamar as edge functions. Novas origens de deploy
// (ex.: outros domínios Vercel) devem ser adicionadas aqui.
const allowedOrigins = [
  'https://luiz192512.github.io',
  'https://digital-flavor-v2.vercel.app',
  'https://digital-flavor-luiz192512s-projects.vercel.app',
  'https://digital-flavor-git-main-luiz192512s-projects.vercel.app',
  'http://127.0.0.1:5173',
  'http://localhost:5173'
]

export function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? ''
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0]

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    Vary: 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  }
}

export function jsonResponse(body: unknown, status = 200, req?: Request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...(req ? corsHeadersFor(req) : {}),
      'Content-Type': 'application/json'
    }
  })
}
