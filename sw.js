/* Offline működés: a játék fájljai a telepítéskor gyorsítótárba kerülnek. */
const CACHE = "pzh-milliomos-v3";
const CORE = ["./", "index.html", "firebase-config.js", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // Firebase / Firestore forgalom: mindig hálózat (a ranglista élő adat)
  if (/firestore|googleapis\.com\/identitytoolkit|securetoken/.test(u.href)) return;
  // saját fájlok: előbb gyorsítótár, háttérben frissítés
  if (u.origin === location.origin) {
    e.respondWith(caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(r => { if (r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  // betűtípusok, QR- és Firebase-könyvtár: gyorsítótár, ha egyszer már letöltődött
  if (/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com|gstatic\.com\/firebasejs/.test(u.href)) {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; })));
  }
});
