import './RatingStars.css';

interface RatingStarsProps {
  /** Ocena 1-10. */
  value: number;
  /** Tryb interaktywny — pozwala zmieniac ocene. */
  onChange?: (value: number) => void;
}

/**
 * Prezentacja oceny 1-10 jako rzad "gwiazdek" (burgerowych 🍔).
 * Komponent czysto prezentacyjny — brak dostepu do bazy.
 */
export function RatingStars({ value, onChange }: RatingStarsProps) {
  const interactive = typeof onChange === 'function';
  const items = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div
      className="rating-stars"
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`Ocena ${value} na 10`}
    >
      {items.map((n) => {
        const active = n <= value;
        const symbol = active ? '🍔' : '·';
        if (interactive) {
          return (
            <button
              key={n}
              type="button"
              className={`rating-stars__item${active ? ' is-active' : ''}`}
              aria-label={`Ustaw ocene ${n}`}
              aria-pressed={n === value}
              onClick={() => onChange?.(n)}
            >
              {symbol}
            </button>
          );
        }
        return (
          <span
            key={n}
            className={`rating-stars__item${active ? ' is-active' : ''}`}
            aria-hidden="true"
          >
            {symbol}
          </span>
        );
      })}
      <span className="rating-stars__value">{value}/10</span>
    </div>
  );
}
