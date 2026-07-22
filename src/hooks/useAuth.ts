import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthChange, isOwner } from '../services/authService';

interface AuthState {
  user: User | null;
  /** Czy zalogowany uzytkownik jest wlascicielem (ma prawo edycji). */
  owner: boolean;
  /** Czy stan auth jest juz znany (po pierwszym callbacku Firebase). */
  ready: boolean;
}

/**
 * useAuth — spina stan Firebase Auth z UI. Komponenty nie dotykaja SDK.
 */
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
      setReady(true);
    });
    return unsub;
  }, []);

  return { user, owner: isOwner(user), ready };
}
