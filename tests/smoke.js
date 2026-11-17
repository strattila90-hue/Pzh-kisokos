/* PzH Milliomos – gyorsteszt.
   Futtatás:  npm install && npx playwright install chromium && npm test
   Saját kis webszervert indít a tároló gyökeréből, telefonméretű böngészőben valódi kattintásokkal
   végigmegy a fő funkciókon, és hibakóddal lép ki, ha bármi eltörik. Külső hálózati kérést nem enged át,
   így a valódi ranglistára (Firebase) semmi nem kerül fel. */
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ROOT = path.join(__dirname, "..");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".png": "image/png", ".webmanifest": "application/manifest+json" };
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");

let pass = 0, fail = 0;
function ok(name, cond, extra) { if (cond) { pass++; console.log("  ok   " + name); } else { fail++; console.log("  HIBA " + name + (extra ? "  →  " + extra : "")); } }

function staticChecks() {
  console.log("Fájlok és verziók");
  const app = read("app.js"), sw = read("sw.js"), html = read("index.html"), ver = JSON.parse(read("version.json")).version;
  const av = (app.match(/var APP_VERSION="([^"]+)"/) || [])[1], sv = (sw.match(/const VERSION = "([^"]+)"/) || [])[1];
  ok("version.json, app.js és sw.js verziója egyezik (" + ver + ")", ver === av && ver === sv, [ver, av, sv].join(" / "));
  for (const f of ["app.css", "data.js", "app.js"]) ok("index.html a(z) " + f + "?v=" + ver + " fájlt tölti be", html.includes('"' + f + "?v=" + ver + '"'));
  ok("a változásnapló első sora az aktuális verzió", app.includes('var CHANGELOG=[["' + ver + '"'));
  const bank = new Function(read("data.js") + ";return BANK;")();
  ok("kérdésbank: " + bank.length + " kérdés, mind ép", bank.length > 200 && bank.every(q => q.q && Array.isArray(q.o) && q.o.length === 3 && q.a >= 0 && q.a < 3 && q.t), "hibás kérdés a data.js-ben");
}

async function browserChecks(base) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, serviceWorkers: "block", colorScheme: "dark" });
  await ctx.route(u => u.origin !== base, r => r.abort());
  const p = await ctx.newPage();
  p.on("pageerror", e => { fail++; console.log("  HIBA JavaScript-hiba: " + String(e.stack || e).slice(0, 500)); });
  p.on("dialog", d => d.accept().catch(() => {}));
  const cur = () => p.evaluate(() => curSec());
  const visible = () => p.evaluate(() => [...document.querySelectorAll(".wrap > section")].filter(s => !s.classList.contains("hide")).map(s => s.id).join(","));
  const width = () => p.evaluate(() => document.documentElement.scrollWidth);
  const hidden = id => p.evaluate(id => document.getElementById(id).classList.contains("hide"), id);
  const home = async () => { await p.evaluate(() => { try { S = null; } catch (e) {} pendingGo = null; route("home"); }); await p.waitForTimeout(250); };
  const wait = ms => p.waitForTimeout(ms);

  console.log("Indulás");
  await p.goto(base + "/index.html", { waitUntil: "load" }); await wait(1500);
  ok("a főmenü betölt", (await visible()) === "home");
  ok("megjelenik a Napi tudtad-e? ablak", !(await hidden("dayModal")));
  await p.keyboard.press("Escape"); await wait(250);
  ok("Esc bezárja", await hidden("dayModal"));

  console.log("Főmenü gombjai");
  const gos = await p.evaluate(() => [...new Set([...document.querySelectorAll("#home [data-go]")].map(b => b.dataset.go))]);
  for (const g of gos) {
    await home();
    await p.evaluate(g => document.querySelector('#home [data-go="' + g + '"]').click(), g); await wait(600);
    const v = await visible();
    ok("menü → " + g + " (" + v + ")", v.length > 0 && !v.includes(",") && v !== "home", v);
  }

  console.log("Kvíz");
  await home(); await p.evaluate(() => route("start")); await wait(250);
  await p.click("#startBtn"); await wait(700);
  ok("a kvíz elindul", (await cur()) === "game");
  await p.click("#l50"); await wait(300);
  ok("az 50:50 kivesz egy választ", (await p.locator("#answers .ans.gone").count()) === 1);
  let answered = 0;
  for (let i = 0; i < 3 && (await cur()) === "game"; i++) {
    await p.locator("#answers .ans:not([disabled])").first().click(); answered++; await wait(1900);
    if (await p.locator("#nextBtn:visible").count()) { if ((await cur()) === "game" && i < 2) { await p.click("#nextBtn"); await wait(500); } }
  }
  ok("lehet válaszolni (" + answered + " válasz)", answered >= 1);
  if ((await cur()) === "game") { await p.evaluate(() => { finish("stop"); }); await wait(500); }
  ok("a játék végén az eredmény-képernyő jön", (await cur()) === "end");
  ok("témakörönkénti bontás látszik", (await p.locator("#endTopics .etrow").count()) >= 1);

  console.log("Kisokos");
  await home(); await p.evaluate(() => route("kis")); await wait(500);
  const views = await p.evaluate(() => [...document.querySelectorAll("#kisViews button")].map(b => b.textContent.trim()));
  for (let i = 0; i < views.length; i++) {
    await p.evaluate(i => document.querySelectorAll("#kisViews button")[i].click(), i); await wait(500);
    const r = await p.evaluate(() => { const v = [...document.querySelectorAll("#kis .kv")].filter(x => !x.classList.contains("hide")); return { n: v.length, len: v[0] ? v[0].innerText.trim().length : 0 }; });
    ok("nézet: " + views[i], r.n === 1 && r.len > 20 && (await width()) <= 390, JSON.stringify(r));
  }
  await p.evaluate(() => document.querySelectorAll("#kisViews button")[0].click()); await wait(300);
  await p.locator("#kisGrid > *").first().click(); await wait(400);
  ok("kártya megnyílik", !(await hidden("cardModal")));
  await p.keyboard.press("Escape"); await wait(250);
  ok("Esc bezárja a kártyát", await hidden("cardModal"));
  await p.fill("#kisQ", "MRSI"); await wait(400);
  ok("a keresés ad találatot (MRSI)", (await p.locator("#kisGrid > *").count()) > 0);

  console.log("Vissza gomb");
  await p.fill("#kisQ", ""); await p.locator("#kisGrid > *").first().click(); await wait(400);
  await p.evaluate(() => history.back()); await wait(400);
  ok("nyitott kártyánál a vissza az ablakot zárja", (await hidden("cardModal")) && (await cur()) === "kis", await cur());
  await p.evaluate(() => history.back()); await wait(400);
  ok("alképernyőről a vissza a főmenübe visz", (await cur()) === "home", await cur());
  await p.evaluate(() => route("start")); await wait(200); await p.click("#startBtn"); await wait(600);
  await p.evaluate(() => history.back()); await wait(400);
  ok("játék közben a vissza megerősítést kér", (await cur()) === "game" && !(await hidden("exitModal")));
  await p.evaluate(() => history.back()); await wait(400);
  ok("újabb vissza: a kérdés eltűnik, a játék folytatódik", (await cur()) === "game" && (await hidden("exitModal")));

  console.log("Beállítások");
  await home(); await p.evaluate(() => route("set")); await wait(300);
  for (const id of ["cfMusic", "cfSfx", "cfGore", "cfBlast"]) {
    const a = await p.getAttribute("#" + id, "aria-checked"); await p.click("#" + id); await wait(120);
    ok("kapcsoló: " + id, a !== (await p.getAttribute("#" + id, "aria-checked"))); await p.click("#" + id);
  }
  const bg = () => p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const dark = await bg();
  await p.click('#thSeg [data-th="light"]'); await wait(200);
  ok("téma: Világos átszínezi az oldalt", (await bg()) !== dark && (await p.evaluate(() => document.documentElement.getAttribute("data-theme"))) === "light");
  await p.click('#thSeg [data-th="dark"]'); await wait(200);
  ok("téma: Sötét visszaállítja", (await bg()) === dark);
  await p.click('#thSeg [data-th="auto"]'); await wait(150);
  ok("téma: Auto leveszi a felülírást", (await p.evaluate(() => document.documentElement.hasAttribute("data-theme"))) === false);
  await p.click('#fzSeg [data-fz="1.4"]'); await wait(200);
  for (const r of ["set", "home", "start", "kis", "stats", "rank", "share"]) { await p.evaluate(r => route(r), r); await wait(300); const w = await width(); ok("legnagyobb betűnél nem lóg ki: " + r, w <= 390, w + " px"); }
  await p.evaluate(() => route("set")); await p.click('#fzSeg [data-fz="1.2"]');

  console.log("Játékok");
  for (const r of ["sim", "dd", "ter", "hangar", "htd"]) { await home(); await p.evaluate(r => route(r), r); await wait(700); const v = await visible(); ok("elindul: " + r + " (" + v + ")", v.length > 0 && v !== "home"); }

  console.log("Újratöltés");
  await home(); await p.reload({ waitUntil: "load" }); await wait(1000);
  ok("újratöltés után a főmenü jön, hiba nélkül", (await visible()) === "home");
  await browser.close();
}

(async () => {
  const server = http.createServer((req, res) => {
    let f = decodeURIComponent(req.url.split("?")[0]); if (f.endsWith("/")) f += "index.html";
    const full = path.join(ROOT, f);
    if (!full.startsWith(ROOT) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(full)] || "application/octet-stream", "Cache-Control": "no-store" }); fs.createReadStream(full).pipe(res);
  });
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.address().port;
  try { staticChecks(); await browserChecks(base); }
  catch (e) { fail++; console.log("  HIBA a teszt megszakadt: " + String(e.stack || e).slice(0, 800)); }
  server.close();
  console.log("\nÖSSZESEN: " + pass + " ok, " + fail + " hiba");
  process.exit(fail ? 1 : 0);
})();
