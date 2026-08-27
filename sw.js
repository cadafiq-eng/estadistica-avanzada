/* ══ HumAIno® · Estadística Avanzada · Service Worker v4.0 ══ */
const CACHE = 'hia-stats-v4';
const ASSETS = [
  '/estadistica-avanzada/',
  '/estadistica-avanzada/index.html',
  '/estadistica-avanzada/icon-192.png',
  '/estadistica-avanzada/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jstat/1.9.6/jstat.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap'
];

/* Instalación — precarga todos los assets */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* Activación — limpia cachés antiguas */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Fetch — network-first para HTML, cache-first para assets */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isNavigation = e.request.mode === 'navigate';

  if (isNavigation) {
    /* HTML: intenta red primero, cae a caché si sin conexión */
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    /* Assets: caché primero, luego red */
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
  }
});
