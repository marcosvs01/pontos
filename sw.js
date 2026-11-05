const CACHE = 'pontos-6';
const APP = ['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(APP.map(f => new Request(f, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const isPage = e.request.mode === 'navigate';
  if (isPage && !/\/(index\.html)?$/.test(url.pathname)) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const key = isPage ? 'index.html' : e.request;
    const hit = await c.match(key, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r && r.ok) c.put(key, r.clone()); return r; });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  }));
});
