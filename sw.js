/* Transitions — Service Worker
 * Minimal SW: enables PWA installability without aggressive caching.
 * Tool HTML and API calls are always fetched fresh from the network.
 */

var CACHE_NAME = 'transitions-shell-v1';

var SHELL_ASSETS = [
  '/transitions_index.html'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(SHELL_ASSETS).catch(function() {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  if (
    url.indexOf('api.anthropic.com') !== -1 ||
    url.indexOf('buy.stripe.com') !== -1 ||
    url.indexOf('cdn.jsdelivr.net') !== -1 ||
    url.indexOf('fonts.googleapis.com') !== -1 ||
    url.indexOf('fonts.gstatic.com') !== -1
  ) {
    return;
  }

  if (url.indexOf('.html') !== -1) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request);
    })
  );
});
