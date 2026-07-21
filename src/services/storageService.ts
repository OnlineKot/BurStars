/**
 * storageService — jedyna warstwa dostepu do Firebase Storage.
 * Obsluguje wgrywanie zdjec burgerow (z telefonu: aparat lub galeria).
 */
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../lib/firebase';
import { ServiceError, toServiceError } from './serviceError';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_PREFIX = 'image/';

/** Oczyszcza nazwe pliku do bezpiecznej postaci w sciezce Storage. */
function safeFileName(name: string): string {
  const dot = name.lastIndexOf('.');
  const ext = dot >= 0 ? name.slice(dot).toLowerCase().replace(/[^a-z0-9.]/g, '') : '';
  return `${Date.now()}${ext || '.jpg'}`;
}

/**
 * Wgrywa zdjecie do Storage i zwraca publiczny URL do zapisania przy wpisie.
 * Waliduje typ i rozmiar; wymaga zalogowanego uzytkownika.
 */
export async function uploadBurgerPhoto(file: File): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new ServiceError('auth/required', 'Musisz byc zalogowany, aby dodac zdjecie.');
  }
  if (!file.type.startsWith(ALLOWED_PREFIX)) {
    throw new ServiceError('validation/invalid-input', 'Plik musi byc obrazem.');
  }
  if (file.size > MAX_BYTES) {
    throw new ServiceError('validation/invalid-input', 'Zdjecie moze miec maksymalnie 5 MB.');
  }

  try {
    const path = `burgers/${uid}/${safeFileName(file.name)}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file, { contentType: file.type });
    return await getDownloadURL(storageRef);
  } catch (error) {
    throw toServiceError(error, 'Nie udalo sie wgrac zdjecia.');
  }
}
