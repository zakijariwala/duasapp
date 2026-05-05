/* sw.js — Raaz-o-Neyaz Service Worker */

const VERSION = 'v4';
const CORE = `core-${VERSION}`;
const LINES = `lines-${VERSION}`;

const CORE_ASSETS = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './categories.json',
  './nav.json',
  './search.json',
  './deep_search.json',
  './audio.json',
];

// ── Install: cache core assets ─────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CORE).then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: remove old caches ────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CORE && k !== LINES)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first for line files, network-first for others ────────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Line JSON files — cache on first visit
  if (url.pathname.includes('/duas_data/lines/')) {
    e.respondWith(
      caches.open(LINES).then(async cache => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        const res = await fetch(e.request);
        if (res.ok) cache.put(e.request, res.clone());
        return res;
      })
    );
    return;
  }

  // Core assets — cache-first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});