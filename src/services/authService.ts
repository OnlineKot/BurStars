/**
 * authService — jedyna warstwa dostepu do Firebase Auth.
 *
 * Obejmuje logowanie zwyklego uzytkownika oraz weryfikacje dostepu
 * administracyjnego (ukryta funkcja "TEO + 7 klikniec"). Hasla NIE MA w kodzie —
 * jest weryfikowane przez Firebase Auth po stronie serwera.
 */
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  type Unsubscribe,
  type User,
} from 'firebase/auth';

import { auth } from '../lib/firebase';
import { ServiceError, toServiceError } from './serviceError';

/** Subskrypcja zmian stanu zalogowania. Zwraca funkcje odpinajaca. */
export function onAuthChange(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

/** Aktualnie zalogowany uzytkownik (lub null). */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Loguje anonimowo, jesli nikt nie jest zalogowany. Pozwala tworzyc wpisy
 * bez pelnej rejestracji. Zwraca aktywnego uzytkownika.
 */
export async function ensureSignedIn(): Promise<User> {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (error) {
    throw toServiceError(error, 'Nie udalo sie zalogowac.');
  }
}

/**
 * Weryfikacja dostepu administracyjnego wywolywana przez modal hasla.
 *
 * Konto administratora (email) pochodzi z konfiguracji (VITE_ADMIN_EMAIL),
 * a haslo jest podawane przez uzytkownika i sprawdzane przez Firebase Auth.
 * Zadne haslo nie jest przechowywane w kodzie ani porownywane lokalnie.
 *
 * Zwraca zalogowanego administratora przy powodzeniu.
 */
export async function verifyAdminAccess(password: string): Promise<User> {
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  if (!adminEmail) {
    throw new ServiceError(
      'validation/invalid-input',
      'Brak skonfigurowanego konta administratora (VITE_ADMIN_EMAIL).',
    );
  }
  if (!password) {
    throw new ServiceError('validation/invalid-input', 'Podaj haslo.');
  }
  try {
    const cred = await signInWithEmailAndPassword(auth, adminEmail, password);
    return cred.user;
  } catch (error) {
    // Firebase zwraca m.in. auth/wrong-password, auth/invalid-credential.
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code: unknown }).code)
        : '';
    if (
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential' ||
      code === 'auth/user-not-found'
    ) {
      throw new ServiceError('auth/forbidden', 'Nieprawidlowe haslo.', error);
    }
    throw toServiceError(error, 'Nie udalo sie zweryfikowac dostepu.');
  }
}

/** Wylogowuje biezacego uzytkownika. */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    throw toServiceError(error, 'Nie udalo sie wylogowac.');
  }
}
