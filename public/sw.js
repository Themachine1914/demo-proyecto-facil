const CACHE = 'facil-demo-v10'

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  const isAppShell =
    event.request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname === '/sw.js' ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')

  if (isAppShell) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }))
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone()
        caches.open(CACHE).then((cache) => cache.put(event.request, copy))
        return response
      })
      .catch(() => caches.match(event.request).then((cached) => cached || Promise.reject())),
  )
})
