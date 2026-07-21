import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useSecretUnlock — logika ukrytej funkcji dostepu administratora.
 *
 * Warunek odblokowania: uzytkownik wpisze z klawiatury napis "TEO"
 * ORAZ kliknie (tap) wyznaczony element 7 razy. Po spelnieniu obu warunkow
 * wywolywany jest `onUnlock` (UI pokazuje wtedy modal hasla).
 *
 * Hook trzyma wylacznie logike wyzwalacza — nie zawiera zadnej prezentacji
 * ani weryfikacji hasla (to nalezy do authService).
 */
const SECRET_WORD = 'TEO';
const REQUIRED_TAPS = 7;
/** Po tylu ms bezczynnosci licznik klikniec sie resetuje. */
const TAP_RESET_MS = 2000;

interface UseSecretUnlockResult {
  /** Podepnij do onClick wyznaczonego elementu (np. logo/tytul). */
  registerTap: () => void;
  /** Aktualna liczba klikniec (do ewentualnego subtelnego feedbacku). */
  tapCount: number;
  /** Czy fraza "TEO" zostala juz wpisana. */
  wordTyped: boolean;
}

export function useSecretUnlock(onUnlock: () => void): UseSecretUnlockResult {
  const [tapCount, setTapCount] = useState(0);
  const [wordTyped, setWordTyped] = useState(false);

  const bufferRef = useRef('');
  const lastTapRef = useRef(0);
  const tapCountRef = useRef(0);
  const wordTypedRef = useRef(false);
  // Aktualna referencja do callbacku — bez re-bindowania listenera.
  const onUnlockRef = useRef(onUnlock);
  onUnlockRef.current = onUnlock;

  const reset = useCallback(() => {
    bufferRef.current = '';
    tapCountRef.current = 0;
    wordTypedRef.current = false;
    setTapCount(0);
    setWordTyped(false);
  }, []);

  const tryUnlock = useCallback(() => {
    if (wordTypedRef.current && tapCountRef.current >= REQUIRED_TAPS) {
      reset();
      onUnlockRef.current();
    }
  }, [reset]);

  // Nasluch klawiatury — wykrywa wpisanie "TEO" (niezaleznie od wielkosci liter).
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      // interesuja nas tylko pojedyncze znaki literowe
      if (event.key.length !== 1) return;
      const next = (bufferRef.current + event.key.toUpperCase()).slice(-SECRET_WORD.length);
      bufferRef.current = next;
      if (next === SECRET_WORD && !wordTypedRef.current) {
        wordTypedRef.current = true;
        setWordTyped(true);
        tryUnlock();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [tryUnlock]);

  const registerTap = useCallback(() => {
    const now = Date.now();
    // reset licznika, gdy zbyt dluga przerwa miedzy klikami
    if (now - lastTapRef.current > TAP_RESET_MS) {
      tapCountRef.current = 0;
    }
    lastTapRef.current = now;
    tapCountRef.current += 1;
    setTapCount(tapCountRef.current);
    tryUnlock();
  }, [tryUnlock]);

  return { registerTap, tapCount, wordTyped };
}
