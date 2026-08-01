/**
 * burgerService — jedyna warstwa z bezposrednim dostepem do Firestore
 * dla kolekcji `burgers`. Komponenty UI korzystaja wylacznie z tych funkcji
 * (najczesciej przez hooki), nigdy nie importuja firebase/firestore.
 *
 * Kazda funkcja:
 *  - jest typowana (wejscie/wyjscie),
 *  - waliduje dane wejsciowe,
 *  - lapie bledy Firebase i zamienia je na ServiceError.
 */
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as fsLimit,
  serverTimestamp,
  Timestamp,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';

import { db, auth } from '../lib/firebase';
import type { Burger, BurgerInput, BurgerUpdate, BurgerSort } from '../types/burger';
import { ServiceError, toServiceError } from './serviceError';

const COLLECTION = 'burgers';

/** Odwzorowanie dokumentu Firestore -> model Burger (id z dokumentu). */
function mapDoc(snapshot: QueryDocumentSnapshot<DocumentData>): Burger {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: data.name as string,
    rating: data.rating as number,
    ownerUid: data.ownerUid as string,
    locationName: data.locationName as string | undefined,
    geo:
      typeof data.lat === 'number' && typeof data.lng === 'number'
        ? { lat: data.lat, lng: data.lng }
        : undefined,
    photos: Array.isArray(data.photos) ? (data.photos as string[]) : [],
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    notes: data.notes as string | undefined,
    createdAt: data.createdAt as Timestamp,
    updatedAt: data.updatedAt as Timestamp | undefined,
  };
}

/** Zwraca UID zalogowanego uzytkownika lub rzuca ServiceError. */
function requireUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new ServiceError('auth/required', 'Musisz byc zalogowany, aby wykonac te akcje.');
  }
  return uid;
}

/** Waliduje ocene: liczba 1-10 (dozwolone dziesietne, np. 7.5). */
function assertRating(rating: number): void {
  if (typeof rating !== 'number' || Number.isNaN(rating) || rating < 1 || rating > 10) {
    throw new ServiceError('validation/invalid-input', 'Ocena musi byc liczba od 1 do 10.');
  }
}

/** Zaokragla ocene do jednego miejsca po przecinku (np. 7.53 -> 7.5). */
function normalizeRating(rating: number): number {
  return Math.round(rating * 10) / 10;
}

/** Waliduje nazwe: niepusty string, max 120 znakow. */
function assertName(name: string): void {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new ServiceError('validation/invalid-input', 'Nazwa nie moze byc pusta.');
  }
  if (trimmed.length > 120) {
    throw new ServiceError('validation/invalid-input', 'Nazwa moze miec maksymalnie 120 znakow.');
  }
}

/** Buduje obiekt zapisu do Firestore z danych wejsciowych (bez undefined). */
function buildWriteData(input: BurgerInput | BurgerUpdate): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (input.name !== undefined) out.name = input.name.trim();
  if (input.rating !== undefined) out.rating = normalizeRating(input.rating);
  if (input.locationName !== undefined) out.locationName = input.locationName.trim();
  if (input.geo !== undefined) {
    out.lat = input.geo.lat;
    out.lng = input.geo.lng;
  }
  if (input.photos !== undefined) out.photos = input.photos;
  if (input.tags !== undefined) out.tags = input.tags;
  if (input.notes !== undefined) out.notes = input.notes.trim();
  return out;
}

/**
 * Tworzy nowy wpis burgera. Zwraca id utworzonego dokumentu.
 */
export async function createBurger(input: BurgerInput): Promise<string> {
  const uid = requireUid();
  assertName(input.name);
  assertRating(input.rating);

  try {
    const payload = {
      ...buildWriteData(input),
      // pola wymagane, wypelniane systemowo
      name: input.name.trim(),
      rating: normalizeRating(input.rating),
      ownerUid: uid,
      photos: input.photos ?? [],
      tags: input.tags ?? [],
      createdAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, COLLECTION), payload);
    return ref.id;
  } catch (error) {
    throw toServiceError(error, 'Nie udalo sie zapisac burgera.');
  }
}

/**
 * Pobiera pojedynczy wpis po id. Zwraca null, gdy nie istnieje.
 */
export async function getBurgerById(id: string): Promise<Burger | null> {
  if (!id) {
    throw new ServiceError('validation/invalid-input', 'Brak identyfikatora wpisu.');
  }
  try {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) {
      return null;
    }
    return mapDoc(snap as QueryDocumentSnapshot<DocumentData>);
  } catch (error) {
    throw toServiceError(error, 'Nie udalo sie pobrac burgera.');
  }
}

export interface ListBurgersOptions {
  /** Filtr: tylko wpisy danego uzytkownika. */
  ownerUid?: string;
  /** Sortowanie: najnowsze lub najwyzej oceniane. */
  sort?: BurgerSort;
  /** Maksymalna liczba wynikow. */
  max?: number;
}

/**
 * Zwraca liste wpisow wg opcji filtrowania/sortowania.
 */
export async function listBurgers(options: ListBurgersOptions = {}): Promise<Burger[]> {
  const { ownerUid, sort = 'newest', max = 50 } = options;

  try {
    const constraints: QueryConstraint[] = [];
    if (ownerUid) {
      constraints.push(where('ownerUid', '==', ownerUid));
    }
    if (sort === 'topRated') {
      constraints.push(orderBy('rating', 'desc'));
      constraints.push(orderBy('createdAt', 'desc'));
    } else {
      constraints.push(orderBy('createdAt', 'desc'));
    }
    constraints.push(fsLimit(max));

    const q = query(collection(db, COLLECTION), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(mapDoc);
  } catch (error) {
    throw toServiceError(error, 'Nie udalo sie pobrac listy burgerow.');
  }
}

/**
 * Aktualizuje istniejacy wpis. Waliduje pola, jesli sa obecne.
 */
export async function updateBurger(id: string, patch: BurgerUpdate): Promise<void> {
  const uid = requireUid();
  if (!id) {
    throw new ServiceError('validation/invalid-input', 'Brak identyfikatora wpisu.');
  }
  if (patch.name !== undefined) assertName(patch.name);
  if (patch.rating !== undefined) assertRating(patch.rating);

  try {
    const data = {
      ...buildWriteData(patch),
      // reguly wymagaja ownerUid == uid piszacego; wlasciciel przejmuje wpis
      ownerUid: uid,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(doc(db, COLLECTION, id), data);
  } catch (error) {
    throw toServiceError(error, 'Nie udalo sie zaktualizowac burgera.');
  }
}

/**
 * Usuwa wpis po id.
 */
export async function deleteBurger(id: string): Promise<void> {
  requireUid();
  if (!id) {
    throw new ServiceError('validation/invalid-input', 'Brak identyfikatora wpisu.');
  }
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    throw toServiceError(error, 'Nie udalo sie usunac burgera.');
  }
}
