/* PzH Milliomos service worker – v1.32.0
   Offline működés: a játék fájljai gyorsítótárba kerülnek.
   Az oldal (index.html) hálózat-első: ha van net, mindig a legfrissebb jön, ha nincs, a tárolt. */
const VERSION = "1.32.0";
const CACHE = "pzh-milliomos-" + VERSION;
const CORE = ["./", "index.html", "firebase-config.js", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== "pzh-meta").map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("message", e => { if (e.data === "SKIP_WAITING") self.skipWaiting(); });
/* ---- Értesítések ---- */
/* 1) Firebase Cloud Messaging: a Firebase konzolból küldött kampány (Android, iPhone-Főképernyő, gép) */
try { importScripts("firebase-config.js"); } catch (e) {}
if (self.PZH_FIREBASE && self.PZH_VAPID && !/IDE_/.test(self.PZH_VAPID)) {
  try {
    importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js", "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");
    firebase.initializeApp(self.PZH_FIREBASE); firebase.messaging();
  } catch (e) {}
}
/* 2) Automatikus ellenőrzés a háttérben (Android, telepített app): új version.json esetén értesít */
function cmpV(a, b) { a = String(a).split(".").map(Number); b = String(b).split(".").map(Number); for (let i = 0; i < 3; i++) { const d = (a[i] || 0) - (b[i] || 0); if (d) return d > 0 ? 1 : -1; } return 0; }
async function checkNotify() {
  try {
    const r = await fetch("version.json?t=" + Date.now(), { cache: "no-store" }); const j = await r.json();
    if (cmpV(j.version, VERSION) <= 0) return;
    const c = await caches.open("pzh-meta"); const k = await c.match("notified"); const last = k ? await k.text() : "";
    if (last === j.version) return;
    await self.registration.showNotification("PzH Milliomos – új verzió: " + j.version, { body: j.notes || "Koppints a frissítéshez.", icon: "icon-192.png", badge: "icon-192.png", tag: "pzh-update", data: { url: "./" } });
    await c.put("notified", new Response(j.version));
  } catch (e) {}
}
self.addEventListener("periodicsync", e => { if (e.tag === "pzh-update") e.waitUntil(checkNotify()); });
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(ws => { for (const w of ws) { if ("focus" in w) return w.focus(); } return clients.openWindow("./"); }));
});
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
      const t = setTimeout(() => fromCache(req).then(fin), 7000);
      fetch(req.url, { cache: "no-store", credentials: "same-origin" }).then(r => { clearTimeout(t); fin(put(req, r)); })
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
