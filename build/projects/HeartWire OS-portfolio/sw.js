const CACHE_NAME = 'heartwire-v8.0.0';
const RUNTIME_CACHE = 'heartwire-runtime-v1';

// App shell (local) — cached first; CDN assets are optional runtime cache
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/sw.js',
  '/manifest.json',
  '/version.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-512-maskable.png',
  '/apple-touch-icon.png',
  '/og.png',
  '/favicon-32.png'
];

const CDN_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://unpkg.com/lucide@latest',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting(); // Activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Caching app shell');
      await cache.addAll(SHELL_ASSETS).catch(err => {
        console.warn('[SW] Some shell assets failed to cache:', err);
      });
      for (const url of CDN_ASSETS) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn('[SW] Optional CDN asset failed:', url, err);
        }
      }
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Take control of all pages immediately
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Always fetch version.json fresh (no cache) for update checks
  if (url.pathname.includes('version.json')) {
    event.respondWith(
      fetch(request, { cache: 'no-store' }).catch(() => {
        // If offline, return a default version
        return new Response(JSON.stringify({ version: '6.1.1' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Never cache service worker itself
  if (url.pathname.includes('sw.js')) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  // For same-origin requests, try cache first, then network
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        }).catch(() => {
          // If offline and not in cache, return offline page for HTML requests
          if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
    );
  } else {
    // For external resources (CDNs), use network-first with cache fallback
    event.respondWith(
      fetch(request).then((response) => {
        // Cache successful external resources
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // Fallback to cache if network fails
        return caches.match(request);
      })
    );
  }
});

// Message handler for manual update checks
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});