/* PzH Milliomos service worker – v1.8.1
   Offline működés: a játék fájljai gyorsítótárba kerülnek.
   Az oldal (index.html) hálózat-első: ha van net, mindig a legfrissebb jön, ha nincs, a tárolt. */
const VERSION = "1.8.1";
const CACHE = "pzh-milliomos-" + VERSION;
const CORE = ["./", "index.html", "firebase-config.js", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("message", e => { if (e.data === "SKIP_WAITING") self.skipWaiting(); });
function put(req, r) { if (r && r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; }
function fromCache(req) { return caches.match(req).then(h => h || caches.match("index.html")).then(h => h || caches.match("./")); }
self.addEventListener("fetch", e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== "GET") return;
  if (u.pathname.endsWith("/version.json") || u.pathname.endsWith("/sw.js")) return;          // mindig hálózat
  if (/firestore|identitytoolkit|securetoken/.test(u.href)) return;                           // élő ranglista
  const page = req.mode === "navigate" || u.pathname.endsWith("/") || /index\.html$|firebase-config\.js$/.test(u.pathname);
  if (u.origin === location.origin && page) {                                                  // hálózat-első, 4 mp után tárolt
    e.respondWith(new Promise(resolve => {
      let done = false;
      const fin = r => { if (!done && r) { done = true; resolve(r); } };
      const t = setTimeout(() => fromCache(req).then(fin), 4000);
      fetch(req).then(r => { clearTimeout(t); fin(put(req, r)); })
        .catch(() => { clearTimeout(t); fromCache(req).then(h => { if (!done) { done = true; resolve(h || Response.error()); } }); });
    }));
    return;
  }
  if (u.origin === location.origin) {                                                          // ikonok, manifest: tárolt-első
    e.respondWith(caches.match(req).then(h => h || fetch(req).then(r => put(req, r))));
    return;
  }
  if (/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com|gstatic\.com\/firebasejs/.test(u.href)) {
    e.respondWith(caches.match(req).then(h => h || fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r; })));
  }
});
