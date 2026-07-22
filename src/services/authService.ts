/**
 * authService — jedyna warstwa dostepu do Firebase Auth.
 *
 * Model: aplikacja ma jednego wlasciciela (VITE_ADMIN_EMAIL). Wlasciciel loguje
 * sie kontem Google i tylko on moze dodawac/edytowac/usuwac wpisy. Pozostali
 * uzytkownicy ogladaja tresc bez logowania (odczyt publiczny).
 */
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type Unsubscribe,
  type User,
} from 'firebase/auth';

import { auth } from '../lib/firebase';
import { toServiceError } from './serviceError';

/** Email konta wlasciciela (jedyne z prawem zapisu). */
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

/** Czy podany uzytkownik to wlasciciel (zweryfikowany email zgodny z ADMIN_EMAIL). */
export function isOwner(user: User | null): boolean {
  return (
    !!user &&
    user.emailVerified &&
    !!user.email &&
    user.email.toLowerCase() === String(ADMIN_EMAIL).toLowerCase()
  );
}

/** Subskrypcja zmian stanu zalogowania. Zwraca funkcje odpinajaca. */
export function onAuthChange(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

/** Aktualnie zalogowany uzytkownik (lub null). */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Logowanie kontem Google (popup). Zwraca zalogowanego uzytkownika.
 * Sprawdzenie uprawnien wlasciciela robi warstwa wyzej (isOwner).
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    return cred.user;
  } catch (error) {
    throw toServiceError(error, 'Logowanie Google nie powiodlo sie.');
  }
}

/** Wylogowanie biezacego uzytkownika. */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    throw toServiceError(error, 'Nie udalo sie wylogowac.');
  }
}
