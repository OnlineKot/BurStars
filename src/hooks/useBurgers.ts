import { useCallback, useEffect, useState } from 'react';

import type { Burger, BurgerSort } from '../types/burger';
import { listBurgers } from '../services/burgerService';
import { ServiceError } from '../services/serviceError';

interface UseBurgersState {
  burgers: Burger[];
  loading: boolean;
  error: string | null;
  /** Ponowne pobranie listy. */
  reload: () => Promise<void>;
}

/**
 * useBurgers — spina warstwe services z UI. Komponenty korzystaja z tego hooka
 * i nie dotykaja Firestore bezposrednio.
 */
export function useBurgers(sort: BurgerSort = 'newest'): UseBurgersState {
  const [burgers, setBurgers] = useState<Burger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ten sam limit co statystyki (useStats), aby liczby sie zgadzaly
      const data = await listBurgers({ sort, max: 500 });
      setBurgers(data);
    } catch (err) {
      const message =
        err instanceof ServiceError ? err.message : 'Wystapil nieoczekiwany blad.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    void load();
  }, [load]);

  return { burgers, loading, error, reload: load };
}
