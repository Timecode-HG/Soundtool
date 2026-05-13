/* ═══════════════════════════════════════════════════════════════
   CineScript · Service Worker
   Cache-Strategie: Cache-First mit Hintergrund-Update
   Cached: HTML, Icons, Manifest + PDF.js (extern)
═══════════════════════════════════════════════════════════════ */

const VERSION = 'cs-v3';

/* Alle lokalen Dateien beim Install sofort cachen */
const LOCAL_ASSETS = [
  './cinescript_tonbericht.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png'
];

/* Externe Abhängigkeiten (PDF.js CDN) */
const CDN_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
];

/* ── Install ─────────────────────────────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION).then(async cache => {
      /* Lokale Dateien: müssen alle da sein → addAll */
      await cache.addAll(LOCAL_ASSETS);
      /* CDN-Dateien: best-effort (kein Fehler wenn offline) */
      await Promise.allSettled(
        CDN_ASSETS.map(url =>
          fetch(url, { cache: 'no-cache' })
            .then(res => { if (res.ok) cache.put(url, res); })
            .catch(() => {})
        )
      );
    }).then(() => self.skipWaiting())
  );
});

/* ── Activate ────────────────────────────────────────────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch: Cache-First mit Netzwerk-Fallback ────────────────── */
self.addEventListener('fetch', event => {
  /* Nur GET-Anfragen behandeln */
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  /* Navigation (HTML) → immer aus Cache, Netz als Fallback */
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('./cinescript_tonbericht.html')
        .then(cached => cached || fetch(event.request))
        .catch(() => caches.match('./cinescript_tonbericht.html'))
    );
    return;
  }

  /* Alles andere: Cache-First, dann Netz + in Cache schreiben */
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        /* Im Hintergrund aktualisieren (Stale-While-Revalidate) */
        const refresh = fetch(event.request).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(VERSION).then(c => c.put(event.request, clone));
          }
          return res;
        }).catch(() => {});
        return cached;
      }
      /* Nicht im Cache: Netz holen und cachen */
      return fetch(event.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(VERSION).then(c => c.put(event.request, clone));
        }
        return res;
      }).catch(() => caches.match('./cinescript_tonbericht.html'));
    })
  );
});
