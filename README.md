# PzH Milliomos

PzH 2000 HU kezelői felkészítő játék, egyetlen weboldalban:

- **Milliomos kvíz** – 232 kérdés, 50 kérdéses játék, 3 élet, 3 segítség, magyarázat a tananyag fejezetével
- **Tűzfeladat** – 12 lépés a löveg metszetén, véletlen feladattal és lőelemekkel, animációval
- **Lőszertároló** – húzd a helyére a tároló, rekesz és lőszerszállító rendszer megnevezéseit
- **Terepjárás** – árok, lépcső, emelkedő, oldaldőlés, gázló, híd: átjut vagy nem?
- **Lőszerraktár** – add a töltőkezelő kezébe a gránátot, gyújtót, töltetet, indítóöltényt; rossz tételnél robbanás és magyarázat
- **Kisokos** – tudásmorzsák, legendás tüzértettek, rekordok, a tüzérség jövője
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

## Frissítés

Ha módosítod az `index.html`-t, a `sw.js`-ben emeld a `CACHE` verziót (`pzh-milliomos-v2`), hogy a telefonok letöltsék az újat.

## Forrás

A kérdések a lövegkezelői tananyagból és a Rheinmetall kezelői képzés diáiból készültek; az Assegai lőszercsalád adatai kiegészítő anyagból. A tananyag „NEM NYILVÁNOS” jelölésű: nyilvános tárolóba tétel előtt egyeztess a parancsnokkal, vagy használj privát tárolót.
