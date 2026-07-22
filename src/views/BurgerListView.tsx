import { useState } from 'react';
import type { Burger, BurgerSort } from '../types/burger';
import { useBurgers } from '../hooks/useBurgers';
import { BurgerCard } from '../components/BurgerCard';
import { deleteBurger } from '../services/burgerService';
import { ServiceError } from '../services/serviceError';
import './BurgerListView.css';

interface BurgerListViewProps {
  /** Tryb wlasciciela — pokazuje przyciski edycji/usuwania na kartach. */
  owner?: boolean;
  onEdit?: (burger: Burger) => void;
}

/**
 * Widok listy/galerii burgerow. Dane pobiera przez hook useBurgers
 * (ktory korzysta z warstwy services). Zaden dostep do Firestore tutaj.
 */
export function BurgerListView({ owner, onEdit }: BurgerListViewProps) {
  const [sort, setSort] = useState<BurgerSort>('newest');
  const { burgers, loading, error, reload } = useBurgers(sort);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleDelete(burger: Burger) {
    if (!window.confirm(`Usunac wpis „${burger.name}"?`)) return;
    setActionError(null);
    try {
      await deleteBurger(burger.id);
      await reload();
    } catch (err) {
      setActionError(err instanceof ServiceError ? err.message : 'Nie udalo sie usunac.');
    }
  }

  return (
    <section className="list-view">
      <div className="list-view__toolbar">
        <div className="segmented" role="tablist" aria-label="Sortowanie">
          <button
            type="button"
            role="tab"
            aria-selected={sort === 'newest'}
            className={`segmented__btn${sort === 'newest' ? ' is-active' : ''}`}
            onClick={() => setSort('newest')}
          >
            Najnowsze
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={sort === 'topRated'}
            className={`segmented__btn${sort === 'topRated' ? ' is-active' : ''}`}
            onClick={() => setSort('topRated')}
          >
            Najlepsze
          </button>
        </div>
      </div>

      {loading && <p className="list-view__status">Laduje burgery…</p>}

      {error && (
        <div className="list-view__status list-view__status--error">
          <p>{error}</p>
          <button type="button" className="btn btn--ghost" onClick={() => void reload()}>
            Sprobuj ponownie
          </button>
        </div>
      )}

      {actionError && <p className="list-view__status list-view__status--error">{actionError}</p>}

      {!loading && !error && burgers.length === 0 && (
        <p className="list-view__status">Brak wpisow jeszcze. Zajrzyj pozniej! 🍔</p>
      )}

      <div className="list-view__grid">
        {burgers.map((burger) => (
          <BurgerCard
            key={burger.id}
            burger={burger}
            owner={owner}
            onEdit={onEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </section>
  );
}
