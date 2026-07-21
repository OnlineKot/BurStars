import { useEffect, useState } from 'react';
import type { Burger } from '../types/burger';
import { listBurgers } from '../services/burgerService';
import { ServiceError } from '../services/serviceError';

export interface BurgerStats {
  total: number;
  averageRating: number;
  best: Burger | null;
  worst: Burger | null;
  /** Liczba wpisow wg zaokraglonej oceny (1..10). */
  distribution: { rating: number; count: number }[];
  /** Najczestsze tagi (do 5). */
  topTags: { tag: string; count: number }[];
}

function computeStats(burgers: Burger[]): BurgerStats {
  if (burgers.length === 0) {
    return { total: 0, averageRating: 0, best: null, worst: null, distribution: [], topTags: [] };
  }

  const sum = burgers.reduce((acc, b) => acc + b.rating, 0);
  const average = Math.round((sum / burgers.length) * 10) / 10;

  let best = burgers[0];
  let worst = burgers[0];
  for (const b of burgers) {
    if (b.rating > best.rating) best = b;
    if (b.rating < worst.rating) worst = b;
  }

  const buckets = new Map<number, number>();
  for (const b of burgers) {
    const r = Math.round(b.rating);
    buckets.set(r, (buckets.get(r) ?? 0) + 1);
  }
  const distribution = Array.from({ length: 10 }, (_, i) => i + 1).map((rating) => ({
    rating,
    count: buckets.get(rating) ?? 0,
  }));

  const tagCounts = new Map<string, number>();
  for (const b of burgers) {
    for (const tag of b.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const topTags = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { total: burgers.length, averageRating: average, best, worst, distribution, topTags };
}

interface UseStatsState {
  stats: BurgerStats | null;
  loading: boolean;
  error: string | null;
}

/** Pobiera wpisy i liczy statystyki po stronie klienta. */
export function useStats(): UseStatsState {
  const [stats, setStats] = useState<BurgerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    listBurgers({ sort: 'newest', max: 500 })
      .then((burgers) => {
        if (active) setStats(computeStats(burgers));
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof ServiceError ? err.message : 'Nie udalo sie pobrac statystyk.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { stats, loading, error };
}
