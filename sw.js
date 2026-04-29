// =====================================================
// FireVision Service Worker — Offline-capable PWA
// =====================================================

const CACHE_NAME = 'firevision-v1';

// Core files to pre-cache on install
const PRECACHE_URLS = [
  './',
  './index.html',
  './home.html',
  './dashboard.html',
  './ai.html',
  './aero.html',
  './payload.html',
  './alerts.html',
  './scenario.html',
  './replay.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './assets/earth.jpg',
  './assets/satellite.glb',
  './my_model/model.json',
  './my_model/metadata.json',
  './my_model/weights.bin',
  './style/styles.css'
];

// ─── Install: pre-cache core assets ───
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching core assets');
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Some assets failed to pre-cache:', err);
        // Cache whatever succeeds, don't block install
        return Promise.allSettled(
          PRECACHE_URLS.map((url) => cache.add(url).catch(() => {}))
        );
      });
    })
  );
  self.skipWaiting();
});

// ─── Activate: clean old caches ───
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ─── Fetch: Network-first with cache fallback ───
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin API calls (weather, telegram) — always go to network
  if (url.hostname === 'api.open-meteo.com' || url.hostname === 'api.telegram.org') {
    return;
  }

  // For CDN resources (TensorFlow, Three.js, Pannellum etc): cache-first
  if (url.hostname.includes('cdn.jsdelivr.net') || url.hostname.includes('unpkg.com') || url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // For local assets: network-first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Fallback for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});
