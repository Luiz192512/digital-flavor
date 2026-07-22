// Service worker do Rapidinha (PWA).
// Estratégia: assets com hash (imutáveis) em cache-first; navegação em
// network-first com fallback ao shell cacheado (funciona offline para abrir
// o app; dados vivos continuam exigindo rede — pedidos nunca são cacheados).
const CACHE = 'rapidinha-v1'
const SHELL = ['/', '/manifest.webmanifest']
// BUG-09: sem auto-versão por deploy, os assets com hash antigos se
// acumulariam para sempre. Limita o número de entradas de asset no cache,
// podando as mais antigas (a shell é preservada).
const MAX_ASSET_ENTRIES = 60

async function trimAssetCache() {
  const cache = await caches.open(CACHE)
  const keys = await cache.keys()
  const assetKeys = keys.filter((request) => {
    const path = new URL(request.url).pathname
    return path.startsWith('/assets/') || path.startsWith('/icons/')
  })

  const excess = assetKeys.length - MAX_ASSET_ENTRIES

  for (let index = 0; index < excess; index += 1) {
    await cache.delete(assetKeys[index])
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return
  }

  // Assets com hash do Vite: cache-first (imutáveis por nome).
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ??
          fetch(event.request).then((response) => {
            // BUG-03: só cachear respostas boas — cachear um 404/500 o tornaria
            // permanente (assets são cache-first).
            if (response.ok) {
              const copy = response.clone()
              void caches
                .open(CACHE)
                .then((cache) => cache.put(event.request, copy))
                .then(() => trimAssetCache())
            }
            return response
          })
      )
    )
    return
  }

  // Navegação SPA: network-first com fallback ao shell.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // BUG-03: só atualizar o shell com uma navegação bem-sucedida; senão
          // uma página de erro do host viraria o fallback offline.
          if (response.ok) {
            const copy = response.clone()
            void caches.open(CACHE).then((cache) => cache.put('/', copy))
          }
          return response
        })
        .catch(() => caches.match('/'))
    )
  }
})
