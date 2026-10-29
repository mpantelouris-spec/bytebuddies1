/* ByteBuddies cache-first static files — school Wi-Fi should not re-download models/JS. */
const CACHE = 'bb-static-v3'; // v3: drops the old full-size sprite/backdrop copies from devices
const KEEP = /\.(js|css|glb|gltf|png|jpe?g|webp|wasm|bin|woff2?|hex)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch { return; }
  if (url.origin !== self.location.origin) return;
  const path = url.pathname;
  if (path === '/' || path.endsWith('.html') || path.includes('bb-entry')) return;
  const cacheable = KEEP.test(path) || path.startsWith('/assets/') || path.startsWith('/draco/');
  if (!cacheable) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req);
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    } catch {
      return hit || Response.error();
    }
  })());
});
