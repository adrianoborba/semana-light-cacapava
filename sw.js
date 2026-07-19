const CACHE = 'sl-cache-v1';
const STATIC_FILES = [
  '/index.html',
  '/manifest.json',
  '/logo3d.png',
  '/icon-192.png',
  '/icon-512.png',
  '/products.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const path = url.pathname;

  if (path.startsWith('/api/')) {
    return;
  }

  if (path.startsWith('/imagens/')) {
    if (path.endsWith('.mp4') || path.endsWith('.webm') || path.endsWith('.mov')) {
      e.respondWith(videoCache(e.request));
    } else {
      e.respondWith(networkFirst(e.request));
    }
    return;
  }

  if (path === '/products.json') {
    e.respondWith(networkFirst(e.request));
    return;
  }

  if (url.origin === location.origin) {
    e.respondWith(cacheFirst(e.request));
  }
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  return cached || fetch(req);
}

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    const cache = await caches.open(CACHE);
    cache.put(req, res.clone());
    return res;
  } catch {
    return caches.match(req);
  }
}

async function videoCache(req) {
  const cached = await caches.match(req);
  if (cached) return cached;

  try {
    const res = await fetch(req);
    if (res.status === 200) {
      const cache = await caches.open(CACHE);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    return cached || new Response('', { status: 503 });
  }
}
