import { useState } from 'react';
import type { BurgerSort } from '../types/burger';
import { useBurgers } from '../hooks/useBurgers';
import { BurgerCard } from '../components/BurgerCard';
import './BurgerListView.css';

/**
 * Widok listy/galerii burgerow. Dane pobiera przez hook useBurgers
 * (ktory korzysta z warstwy services). Zaden dostep do Firestore tutaj.
 */
export function BurgerListView() {
  const [sort, setSort] = useState<BurgerSort>('newest');
  const { burgers, loading, error, reload } = useBurgers(sort);

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

      {!loading && !error && burgers.length === 0 && (
        <p className="list-view__status">Brak wpisow. Dodaj pierwszego burgera! 🍔</p>
      )}

      <div className="list-view__grid">
        {burgers.map((burger) => (
          <BurgerCard key={burger.id} burger={burger} />
        ))}
      </div>
    </section>
  );
}
