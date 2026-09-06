// Minimal service worker — its main job here is simply to exist, since
// PWABuilder and Android's TWA requirements check for a registered service
// worker before treating a site as an installable PWA. It also adds basic
// offline resilience: if the network is unreachable, the app still loads
// from cache instead of showing a browser error screen.

// Relative paths throughout this file deliberately — this site is hosted
// at a GitHub Pages PROJECT URL (username.github.io/reponame/), so an
// absolute path like "/index.html" would incorrectly resolve to the
// account's root domain instead of the project subfolder.
const CACHE_NAME = 'retailpoint-shell-v1';
const APP_SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL).catch(function () {
        // Non-fatal — some hosts serve index.html at multiple paths;
        // failing to pre-cache one shouldn't block install.
      });
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  // Network-first: always try the live server (so login/clock-in data is
  // never stale), falling back to cache only if the network is unreachable.
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request);
    })
  );
});
