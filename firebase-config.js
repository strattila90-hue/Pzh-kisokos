/* PzH Milliomos – Firebase beállítás (ranglista + push értesítés).
   A "self" az oldalon és a service workerben (sw.js) is működik. */
self.PZH_FIREBASE = {
  apiKey: "AIzaSyB8RhAWVVv7KNY8RXOX_7xvuknbelHXnLc",
  authDomain: "pzhmilliomos.firebaseapp.com",
  projectId: "pzhmilliomos",
  messagingSenderId: "890717278504",
  appId: "1:890717278504:web:243f04f0a37f655fa7401d"
};
/* Push értesítéshez (mindenkinek, iPhone-ra is):
   Firebase konzol → Projektbeállítások (fogaskerék) → Cloud Messaging → Web Push certificates → Generate key pair
   → a kapott hosszú kulcsot másold az idézőjelek közé: */
self.PZH_VAPID = "BGX5ItBDmXsuFYx7vZBfK6la2NEBP-h4qEpOpD9d6s1Cn68WtY050vhwNE7ljHZT20Uwez5hBvJ34rXuAE_NYC8";
