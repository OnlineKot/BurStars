import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useSecretUnlock — logika ukrytego wejscia wlasciciela.
 *
 * Desktop: wpisanie "TEO" z klawiatury + 7 klikniec w tytul -> onUnlock.
 * Mobile (brak klawiatury): 7 klikniec w tytul -> onCodeRequired
 * (UI pokazuje male okienko na kod; poprawny kod -> logowanie).
 *
 * Hook trzyma wylacznie logike wyzwalacza — zadnej prezentacji ani autoryzacji
 * (realne uprawnienia egzekwuje Firebase Auth + reguly Firestore).
 */
const SECRET_WORD = 'TEO';
const REQUIRED_TAPS = 7;
/** Po tylu ms bezczynnosci licznik klikniec sie resetuje. */
const TAP_RESET_MS = 2000;

interface UseSecretUnlockOptions {
  /** Warunek pelny (slowo z klawiatury + 7 klikniec). */
  onUnlock: () => void;
  /** 7 klikniec bez slowa — UI powinno poprosic o kod (sciezka mobilna). */
  onCodeRequired: () => void;
}

interface UseSecretUnlockResult {
  /** Podepnij do onClick wyznaczonego elementu (np. logo/tytul). */
  registerTap: () => void;
  /** Aktualna liczba klikniec (do ewentualnego subtelnego feedbacku). */
  tapCount: number;
}

export function useSecretUnlock({
  onUnlock,
  onCodeRequired,
}: UseSecretUnlockOptions): UseSecretUnlockResult {
  const [tapCount, setTapCount] = useState(0);

  const bufferRef = useRef('');
  const lastTapRef = useRef(0);
  const tapCountRef = useRef(0);
  const wordTypedRef = useRef(false);
  // Aktualne referencje do callbackow — bez re-bindowania listenerow.
  const onUnlockRef = useRef(onUnlock);
  const onCodeRequiredRef = useRef(onCodeRequired);
  onUnlockRef.current = onUnlock;
  onCodeRequiredRef.current = onCodeRequired;

  const reset = useCallback(() => {
    bufferRef.current = '';
    tapCountRef.current = 0;
    wordTypedRef.current = false;
    setTapCount(0);
  }, []);

  // Nasluch klawiatury — wykrywa wpisanie "TEO" (niezaleznie od wielkosci liter).
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key.length !== 1) return;
      const next = (bufferRef.current + event.key.toUpperCase()).slice(-SECRET_WORD.length);
      bufferRef.current = next;
      if (next === SECRET_WORD) {
        wordTypedRef.current = true;
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const registerTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current > TAP_RESET_MS) {
      tapCountRef.current = 0;
    }
    lastTapRef.current = now;
    tapCountRef.current += 1;
    setTapCount(tapCountRef.current);

    if (tapCountRef.current >= REQUIRED_TAPS) {
      const hadWord = wordTypedRef.current;
      reset();
      if (hadWord) {
        onUnlockRef.current();
      } else {
        onCodeRequiredRef.current();
      }
    }
  }, [reset]);

  return { registerTap, tapCount };
}
