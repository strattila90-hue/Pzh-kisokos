/* Firebase-ranglista beállítása.
   1. Hozz létre projektet: https://console.firebase.google.com
   2. Authentication → Sign-in method → Anonymous: bekapcsolás
   3. Firestore Database → létrehozás, majd a firestore.rules tartalmát másold a Rules fülre
   4. Projektbeállítások → Webalkalmazás hozzáadása → a kapott firebaseConfig értékeit írd be ide,
      és a "null" helyett ezt az objektumot add meg.
   Ha null marad, a játék ranglista nélkül, teljesen működik. */
window.PZH_FIREBASE = null;
/* Példa:
window.PZH_FIREBASE = {
  apiKey: "...",
  authDomain: "pzh-milliomos.firebaseapp.com",
  projectId: "pzh-milliomos",
  appId: "..."
};
*/
