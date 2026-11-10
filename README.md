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

Minden tartalom az `index.html`-ben van. Telepíthető alkalmazásként (PWA), és első megnyitás után **hálózat nélkül is működik**.

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

Ha módosítod az `index.html`-t, a `sw.js`-ben emeld a `VERSION` értékét (pl. `1.44.0`), és a `version.json`-t is, hogy a telefonok letöltsék az újat.

## Forrás

A kérdések a lövegkezelői tananyagból és a Rheinmetall kezelői képzés diáiból készültek; az Assegai lőszercsalád adatai kiegészítő anyagból. A tananyag „NEM NYILVÁNOS” jelölésű: nyilvános tárolóba tétel előtt egyeztess a parancsnokkal, vagy használj privát tárolót.
