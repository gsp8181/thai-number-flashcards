// Custom service worker for offline caching with version checking

const PRECACHE = 'offline-precache-v1'
const VERSION_CACHE = 'offline-version'

// Precache assets injected by Workbox
const PRECACHE_MANIFEST = self.__WB_MANIFEST || []
// Precache assets listed in PRECACHE_MANIFEST during install
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(PRECACHE)
    for (const entry of PRECACHE_MANIFEST || []) {
      try {
        const req = new Request(entry.url, {cache: 'no-cache'})
        const res = await fetch(req)
        if (res && res.ok) await cache.put(entry.url, res.clone())
      } catch (err) {
        // ignore individual fetch failures; they'll be handled later
      }
    }
  })())
  self.skipWaiting()
})

// On activation, claim clients and run an initial version check
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    self.clients.claim()
    try {
      await checkForRemoteVersionAndUpdate()
    } catch (e) {
      // ignore errors during activation
    }
  })())
})

// Utility: fetch remote /version.json (no-cache) and compare to cached copy
async function checkForRemoteVersionAndUpdate() {
  try {
    const res = await fetch('/version.json', {cache: 'no-store'})
    if (!res || !res.ok) return false
    const remote = await res.json()
    const remoteHash = remote && remote.hash
    if (!remoteHash) return false
    const vc = await caches.open(VERSION_CACHE)
    const cached = await vc.match('version')
    const cachedText = cached ? await cached.text() : null
    if (cachedText !== remoteHash) {
      // store new version hash
      await vc.put('version', new Response(remoteHash))
      // update precache entries (only when online)
      const precache = await caches.open(PRECACHE)
      for (const entry of PRECACHE_MANIFEST || []) {
        try {
          const r = await fetch(entry.url, {cache: 'no-store'})
          if (r && r.ok) await precache.put(entry.url, r.clone())
        } catch (err) {
          // ignore fetch errors (network issues)
        }
      }
      return true
    }
  } catch (err) {
    // likely offline - don't update
  }
  return false
}

// Simple fetch handlers: navigation -> serve cached index.html; images -> cache-first; api/data -> network-first
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET
  if (request.method !== 'GET') return

  // Navigation requests -> return cached index.html if available (SPA offline)
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(PRECACHE)
      const cached = await cache.match('index.html')
      if (cached) return cached
      try {
        const net = await fetch(request)
        return net
      } catch (e) {
        return new Response('Offline', {status: 503, statusText: 'Offline'})
      }
    })())
    return
  }

  // Images: cache-first
  if (url.pathname.match(/\.(?:png|jpg|jpeg|svg|webp)$/)) {
    event.respondWith((async () => {
      const cache = await caches.open(PRECACHE)
      const cached = await cache.match(request.url)
      if (cached) return cached
      try {
        const net = await fetch(request)
        if (net && net.ok) {
          await cache.put(request.url, net.clone())
        }
        return net
      } catch (e) {
        return cached || new Response(null, {status: 404})
      }
    })())
    return
  }

  // API/data: network-first with cache fallback
  if (url.pathname.includes('/api/') || url.pathname.includes('/data/')) {
    event.respondWith((async () => {
      const cache = await caches.open('api-cache')
      try {
        const net = await fetch(request)
        if (net && net.ok) await cache.put(request.url, net.clone())
        return net
      } catch (e) {
        const cached = await cache.match(request.url)
        return cached || new Response(null, {status: 504, statusText: 'Gateway Timeout'})
      }
    })())
    return
  }
})

// Allow pages to message the SW to trigger a version check (only works when online)
self.addEventListener('message', (event) => {
  if (!event.data) return
  if (event.data.type === 'CHECK_FOR_UPDATES') {
    event.waitUntil(checkForRemoteVersionAndUpdate())
  }
})
