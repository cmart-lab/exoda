// Service worker: η εφαρμογή ανοίγει και χωρίς δίκτυο· με δίκτυο φέρνει πάντα την τελευταία έκδοση.
const CACHE = 'exoda-v12';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('exoda-') && k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== 'GET') return;
  // no-cache: ρωτάει πάντα τον server (φθηνά, με ETag), ώστε οι αλλαγές να φαίνονται στο επόμενο άνοιγμα
  const fresh = new Request(e.request.url, {cache: 'no-cache', credentials: 'same-origin'});
  e.respondWith(
    fetch(fresh)
      .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then(m => m || caches.match('./index.html')))
  );
});
