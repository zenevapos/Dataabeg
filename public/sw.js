// DataAbeg High-Performance Service Worker
const CACHE_NAME = 'dataabeg-pwa-v1';
const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/logo.svg',
  '/playstore-icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests and skip API / Firestore / auth calls
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('firestore.googleapis.com') ||
    event.request.url.includes('identitytoolkit.googleapis.com') ||
    event.request.url.includes('gladtidingsdata.com') ||
    event.request.url.includes('smeplug.ng')
  ) {
    return;
  }

  // Network first with cache fallback for HTML pages; Stale-while-revalidate for static assets
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/dashboard') || caches.match('/');
        }
        return new Response('Network error occurred. You appear to be offline.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

