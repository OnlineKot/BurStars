import type { Timestamp } from 'firebase/firestore';

/**
 * Ocena burgera w skali 1-10 (liczba calkowita).
 * Typ pomocniczy — walidacja zakresu odbywa sie w warstwie services.
 */
export type BurgerRating = number;

/**
 * Wspolrzedne geograficzne miejsca (opcjonalne).
 */
export interface GeoPoint {
  lat: number;
  lng: number;
}

/**
 * Pelny wpis burgera odczytany z Firestore.
 * `id` pochodzi z identyfikatora dokumentu, nie z pol danych.
 */
export interface Burger {
  id: string;
  /** Nazwa burgera / lokalu. */
  name: string;
  /** Ocena 1-10. */
  rating: BurgerRating;
  /** UID wlasciciela wpisu (Firebase Auth). */
  ownerUid: string;
  /** Nazwa lokalizacji, np. "Bar Burgerowy, Krakow". */
  locationName?: string;
  /** Wspolrzedne (jesli podane). */
  geo?: GeoPoint;
  /** Adresy URL zdjec (Firebase Storage lub zewnetrzne). */
  photos: string[];
  /** Tagi, np. ["wolowina", "smash", "bekon"]. */
  tags: string[];
  /** Dodatkowe notatki tekstowe (bez Markdownu — czysty string). */
  notes?: string;
  /** Data utworzenia wpisu. */
  createdAt: Timestamp;
  /** Data ostatniej modyfikacji. */
  updatedAt?: Timestamp;
}

/**
 * Dane wejsciowe przy tworzeniu wpisu (bez pol generowanych przez system:
 * id, ownerUid, createdAt, updatedAt).
 */
export interface BurgerInput {
  name: string;
  rating: BurgerRating;
  locationName?: string;
  geo?: GeoPoint;
  photos?: string[];
  tags?: string[];
  notes?: string;
}

/**
 * Dane wejsciowe przy aktualizacji — wszystkie pola opcjonalne.
 */
export type BurgerUpdate = Partial<BurgerInput>;

/**
 * Opcje sortowania listy burgerow.
 */
export type BurgerSort = 'newest' | 'topRated';
