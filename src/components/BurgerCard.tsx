import type { Burger } from '../types/burger';
import { RatingStars } from './RatingStars';
import './BurgerCard.css';

interface BurgerCardProps {
  burger: Burger;
}

/** Formatuje Firestore Timestamp na czytelna date (bez zewnetrznych bibliotek). */
function formatDate(burger: Burger): string {
  try {
    const date = burger.createdAt.toDate();
    return new Intl.DateTimeFormat('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return '';
  }
}

/**
 * Karta pojedynczego burgera. Komponent prezentacyjny — dane dostaje przez propsy.
 * Tresc renderowana natywnymi elementami HTML (bez Markdownu).
 */
export function BurgerCard({ burger }: BurgerCardProps) {
  const cover = burger.photos[0];

  return (
    <article className="burger-card">
      {cover ? (
        <img className="burger-card__photo" src={cover} alt={burger.name} loading="lazy" />
      ) : (
        <div className="burger-card__photo burger-card__photo--placeholder" aria-hidden="true">
          🍔
        </div>
      )}

      <div className="burger-card__body">
        <header className="burger-card__header">
          <h2 className="burger-card__name">{burger.name}</h2>
          <RatingStars value={burger.rating} />
        </header>

        {burger.locationName && (
          <p className="burger-card__location">📍 {burger.locationName}</p>
        )}

        {burger.tags.length > 0 && (
          <ul className="burger-card__tags">
            {burger.tags.map((tag) => (
              <li key={tag} className="burger-card__tag">
                #{tag}
              </li>
            ))}
          </ul>
        )}

        {burger.notes && <p className="burger-card__notes">{burger.notes}</p>}

        <footer className="burger-card__footer">
          <time className="burger-card__date">{formatDate(burger)}</time>
        </footer>
      </div>
    </article>
  );
}
