// RetailPoint service worker — NETWORK-FIRST so updated pages always load.
// Bump CACHE whenever you want to force every device to drop old copies.
const CACHE = 'retailpoint-v2-2';
const CORE = ['./', 'index.html', 'manifest.json'];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(CORE.map(function (u) { return cache.add(u).catch(function () {}); }));
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET') return;                       // never touch POSTs (Apps Script calls)
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;             // fonts, maps, Apps Script: leave to the browser

  event.respondWith(
    fetch(req, { cache: 'no-cache' })                     // always revalidate with the server
      .then(function (res) {
        const copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      })
      .catch(function () {                                // offline: fall back to cache
        return caches.match(req).then(function (r) { return r || caches.match('index.html'); });
      })
  );
});
