/**
 * imageService — przygotowanie zdjec bez Firebase Storage.
 *
 * Zdjecie z telefonu jest kompresowane i skalowane w przegladarce, a nastepnie
 * zapisywane jako Data URL (string) bezposrednio w dokumencie Firestore.
 * Dzieki temu aplikacja dziala na darmowym planie Spark (bez Storage).
 */
import { ServiceError } from './serviceError';

/** Maksymalny wymiar (dluzszy bok) po przeskalowaniu. */
const MAX_DIMENSION = 1000;
/** Jakosc kompresji JPEG (0-1). */
const JPEG_QUALITY = 0.72;
/** Limit rozmiaru wynikowego Data URL (~700 kB — margines pod limit 1 MB dokumentu). */
const MAX_RESULT_BYTES = 700 * 1024;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new ServiceError('unknown', 'Nie udalo sie odczytac pliku.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new ServiceError('validation/invalid-input', 'Nieprawidlowy obraz.'));
    img.src = src;
  });
}

function fitDimensions(w: number, h: number, max: number): { width: number; height: number } {
  if (w <= max && h <= max) return { width: w, height: h };
  const scale = w >= h ? max / w : max / h;
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

/** Szacuje rozmiar w bajtach zakodowanego Data URL (czesc base64). */
function dataUrlByteSize(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] ?? '';
  return Math.floor((base64.length * 3) / 4);
}

/**
 * Konwertuje plik obrazu na skompresowany Data URL (JPEG) gotowy do zapisu
 * w Firestore. Skaluje do MAX_DIMENSION i obniza jakosc, aby zmiescic sie
 * w limicie dokumentu.
 */
export async function fileToCompressedDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new ServiceError('validation/invalid-input', 'Plik musi byc obrazem.');
  }

  const sourceUrl = await readAsDataUrl(file);
  const img = await loadImage(sourceUrl);
  const { width, height } = fitDimensions(img.width, img.height, MAX_DIMENSION);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new ServiceError('unknown', 'Nie udalo sie przetworzyc zdjecia.');
  }
  ctx.drawImage(img, 0, 0, width, height);

  // Stopniowo obnizaj jakosc, jesli wynik jest za duzy.
  let quality = JPEG_QUALITY;
  let result = canvas.toDataURL('image/jpeg', quality);
  while (dataUrlByteSize(result) > MAX_RESULT_BYTES && quality > 0.4) {
    quality -= 0.1;
    result = canvas.toDataURL('image/jpeg', quality);
  }

  if (dataUrlByteSize(result) > MAX_RESULT_BYTES) {
    throw new ServiceError(
      'validation/invalid-input',
      'Zdjecie jest zbyt duze — sprobuj mniejszym lub prostszym obrazem.',
    );
  }

  return result;
}
