/**
 * Bledy domenowe warstwy services/.
 * UI nie widzi surowych bledow Firebase — dostaje przewidywalny ServiceError.
 */
export type ServiceErrorCode =
  | 'validation/invalid-input'
  | 'auth/required'
  | 'auth/forbidden'
  | 'not-found'
  | 'network'
  | 'unavailable'
  | 'unknown';

export class ServiceError extends Error {
  readonly code: ServiceErrorCode;
  readonly cause?: unknown;

  constructor(code: ServiceErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.cause = cause;
  }
}

/**
 * Mapuje surowy blad Firebase (FirebaseError.code) na ServiceError.
 * Zawsze zwraca ServiceError — nigdy nie przepuszcza surowego bledu do UI.
 */
export function toServiceError(error: unknown, fallbackMessage: string): ServiceError {
  if (error instanceof ServiceError) {
    return error;
  }

  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';

  switch (code) {
    case 'permission-denied':
      return new ServiceError('auth/forbidden', 'Brak uprawnien do tej operacji.', error);
    case 'unauthenticated':
      return new ServiceError('auth/required', 'Wymagane logowanie.', error);
    case 'not-found':
      return new ServiceError('not-found', 'Nie znaleziono zasobu.', error);
    case 'unavailable':
      return new ServiceError('unavailable', 'Usluga chwilowo niedostepna.', error);
    case 'deadline-exceeded':
    case 'cancelled':
      return new ServiceError('network', 'Problem z polaczeniem sieciowym.', error);
    default:
      return new ServiceError('unknown', fallbackMessage, error);
  }
}
