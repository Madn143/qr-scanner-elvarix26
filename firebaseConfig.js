// firebaseConfig.js
// ─────────────────────────────────────────────────────────────────────────────
// Firebase v10 Modular SDK — Configured for elvarix26 project.
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBLJmkWXSjmS2kbz-uJYzSqoDlu5FeNNBM",
  authDomain: "elvarix26.firebaseapp.com",
  projectId: "elvarix26",
  storageBucket: "elvarix26.firebasestorage.app",
  messagingSenderId: "773443130796",
  appId: "1:773443130796:android:7167bc16334552c3455609",
};

// Prevent re-initialisation on hot-reload (Expo fast-refresh)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use persistentLocalCache so the app works with intermittent connectivity
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  // Already initialised (hot-reload guard)
  db = getFirestore(app);
}

export { db };

// ─────────────────────────────────────────────────────────────────────────────
// Firestore Collection References
// ─────────────────────────────────────────────────────────────────────────────
export const COLLECTIONS = {
  ATTENDEES: "Attendees",
  RECEPTION_LOGS: "Reception_Logs",
  SNACK_LOGS: "Snack_Logs",
  FOOD_LOGS: "Food_Logs",
};
