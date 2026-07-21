/**
 * Inicjalizacja Firebase (modulowy SDK v10+, tree-shakeable).
 *
 * To jedyne miejsce, w ktorym tworzymy instancje `app`, `db` i `auth`.
 * Warstwa services/ importuje stad gotowe instancje; komponenty UI — nigdy.
 */
import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

/**
 * Podpiecie lokalnych emulatorow (Firestore + Auth), gdy
 * VITE_USE_FIREBASE_EMULATORS === "true". Wykonywane jednorazowo.
 */
const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';

if (useEmulators) {
  // Firestore emulator: domyslnie host 127.0.0.1:8080 (zgodnie z firebase.json).
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  // Auth emulator: domyslnie 127.0.0.1:9099.
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  // Log tylko w dev, aby bylo jasne ze nie laczymy sie z produkcja.
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info('[BurStars] Polaczono z lokalnymi emulatorami Firebase.');
  }
}
