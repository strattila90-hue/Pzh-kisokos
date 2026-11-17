# PzH Milliomos

PzH 2000 HU kezelői felkészítő játék, egyetlen weboldalban:

- **Milliomos kvíz** – 251 kérdés, 50 kérdéses játék, 3 élet, 3 segítség, magyarázat a tananyag fejezetével
- **Hibáim gyakorló** – az elrontott kérdések külön listába kerülnek; ha háromszor egymás után jól válaszolsz rá, kikerül
- **Témakörök** – témánkénti százalék, koppintásra 10 kérdéses gyakorlás, „Leggyengébb gyakorlása” gomb
- **Tűzfeladat** – 12 lépés a löveg metszetén, véletlen feladattal és lőelemekkel, animációval
- **Lőszertároló** – húzd a helyére a tároló, rekesz és lőszerszállító rendszer megnevezéseit
- **Terepjárás** – árok, lépcső, emelkedő, oldaldőlés, gázló, híd: átjut vagy nem?
- **Lőszerraktár** – add a töltőkezelő kezébe a gránátot, gyújtót, töltetet, indítóöltényt; rossz tételnél robbanás és magyarázat
- **Kisokos** – 500+ kártya (tudásmorzsák, legendák, rekordok, szabálykártyák a tananyagból), nézetekkel:
  - *Kártyák* – keresés, témakörök, ★ kedvencek; a rövidítések (MRSI, V0, L52…) koppintásra megmagyarázzák magukat
  - *Gyűjtemény* – témakörönkénti haladás, ★ ritka Legenda-sorozat, „Neked ajánlott” a gyenge kvíz-témakörökhöz, gyakori hibáid tanulságai
  - *Játék* – Igaz vagy hamis? (60 mp, húzással) és 3 kérdéses gyorsteszt 5 új kártya után, jutalompontokkal
  - *Interaktív* – csúszkás ballisztikai kártyák (két szögcsoport, vonás, töltethőmérséklet, szórási ellipszis, L52, repülési idő)
  - *Szótár*, *Számok* (a HTD adatai táblázatban), *Idővonal*, *Térkép* (offline Európa- és világtérkép)
  - *Hallgatás* – egy témakör felolvasása kártyáról kártyára; *Zsebkönyv* – A6-os nyomtatás vagy PDF
  - A kvízben rossz válasz után: „Bővebben a Kisokosban” – a kérdéshez illő kártyák
  - *A hét kártyája* és *kártyajavaslat*: a parancsnok kitűz egy kártyát és heti kérdést, a játékosok kártyát javasolhatnak (PK sáv → 📚 Kisokos)
- **Ranglista** – csak becenév, Firebase-en (opcionális)

Telepíthető alkalmazásként (PWA), és első megnyitás után **hálózat nélkül is működik**.

## Fájlok

| Fájl | Mi van benne |
|---|---|
| `index.html` | az oldal váza (HTML, rajzok) – kicsi, minden megnyitáskor frissen töltődik |
| `app.css` | a teljes megjelenés |
| `data.js` | a kvíz kérdésbankja (`BANK`) |
| `app.js` | a program és a Kisokos kártyái |
| `sw.js`, `version.json`, `manifest.webmanifest`, ikonok | offline működés, frissítés, telepítés |
| `firebase-config.js`, `firestore.rules` | ranglista (opcionális) |
| `parancsnok-….html` | a parancsnoki változat belépője |
| `tests/`, `package.json`, `.github/` | automatikus teszt – a játékhoz nem kell |

A négy fő fájlnak (`index.html`, `app.css`, `data.js`, `app.js`) **együtt, egy mappában** kell lennie; az `index.html` önmagában már nem indul el.

## Közzététel GitHub Pages-en

1. Töltsd fel a mappa tartalmát egy új GitHub-tárolóba (pl. `pzh-milliomos`).
2. Settings → Pages → Source: *Deploy from a branch*, Branch: `main`, mappa: `/ (root)` → Save.
3. Pár perc múlva elérhető: `https://<felhasználónév>.github.io/pzh-milliomos/`
4. Telefonon: megnyitás után *Hozzáadás a kezdőképernyőhöz* – ettől kezdve offline is indul.

## Ranglista bekapcsolása (Firebase)

1. [Firebase konzol](https://console.firebase.google.com) → új projekt.
2. **Authentication → Sign-in method → Anonymous** bekapcsolása (a játékosnak nem kell regisztrálnia, csak becenevet ad).
3. **Firestore Database** létrehozása, a **Rules** fülre a `firestore.rules` tartalma.
4. **Projektbeállítások → Webalkalmazás hozzáadása**, a kapott `firebaseConfig` értékeit írd a `firebase-config.js`-be.
5. Authentication → Settings → **Authorized domains**: add hozzá a `<felhasználónév>.github.io` domaint.

A ranglistán csak a becenév és a pontszámok szerepelnek. Ha a `firebase-config.js` `null`, a játék ranglista nélkül, teljesen működik.

> **v1.44 – Firestore-szabályok frissítése:** a heti kártyához és a kártyajavaslatokhoz új gyűjtemények kellenek (`kisweek`, `kisweekst`, `kissug`, `kisadds`). A Firebase konzol → Firestore → **Rules** fülre másold be újra a `firestore.rules` teljes tartalmát, és nyomd meg a *Publish* gombot. Enélkül a Kisokos többi része működik, csak a heti kártya és a javaslatküldés nem.

## Frissítés

Bármelyik fájl módosítása után emeld a verziószámot **mind a négy helyen**, különben a telefonok a régi, tárolt példányt használják tovább:

1. `app.js` – `var APP_VERSION="…"` (és egy új sor a `CHANGELOG` elejére)
2. `sw.js` – `const VERSION = "…"`
3. `version.json` – `"version"`
4. `index.html` – a három `?v=…` (`app.css?v=`, `data.js?v=`, `app.js?v=`)

A teszt ellenőrzi, hogy a négy hely egyezik.

## Teszt

```bash
npm install
```

```bash
npx playwright install chromium
```

```bash
npm test
```

A `tests/smoke.js` telefonméretű böngészőben, valódi kattintásokkal végigmegy a menün, a kvízen, a Kisokos nézetein, a beállításokon, a vissza gombon és a játékok indításán. Külső hálózati kérést nem enged át, így a valódi ranglistára semmi nem kerül. GitHubon minden feltöltéskor magától lefut (Actions fül → *Gyorsteszt*).

## Forrás

A kérdések a lövegkezelői tananyagból és a Rheinmetall kezelői képzés diáiból készültek; az Assegai lőszercsalád adatai kiegészítő anyagból. A tananyag „NEM NYILVÁNOS” jelölésű: nyilvános tárolóba tétel előtt egyeztess a parancsnokkal, vagy használj privát tárolót.
