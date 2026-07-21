import { useStats } from '../hooks/useStats';
import './StatsView.css';

/**
 * Widok statystyk. Dane liczy hook useStats (oparty o warstwe services).
 * Prezentacja natywnymi elementami HTML — bez Markdownu.
 */
export function StatsView() {
  const { stats, loading, error } = useStats();

  if (loading) {
    return <p className="stats-view__status">Licze statystyki…</p>;
  }
  if (error) {
    return <p className="stats-view__status stats-view__status--error">{error}</p>;
  }
  if (!stats || stats.total === 0) {
    return <p className="stats-view__status">Brak danych. Dodaj pierwszego burgera! 🍔</p>;
  }

  const maxBucket = Math.max(...stats.distribution.map((d) => d.count), 1);

  return (
    <section className="stats-view">
      <div className="stats-cards">
        <div className="stat-card">
          <span className="stat-card__value">{stats.total}</span>
          <span className="stat-card__label">wpisow</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{stats.averageRating.toFixed(1)}</span>
          <span className="stat-card__label">srednia ocena</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{stats.best?.rating.toFixed(1)}</span>
          <span className="stat-card__label">najlepszy</span>
        </div>
      </div>

      {stats.best && (
        <p className="stats-view__highlight">
          🏆 Najlepszy: <strong>{stats.best.name}</strong> ({stats.best.rating.toFixed(1)}/10)
        </p>
      )}

      <div className="stats-block">
        <h2 className="stats-block__title">Rozklad ocen</h2>
        <ul className="histogram">
          {stats.distribution.map((d) => (
            <li key={d.rating} className="histogram__row">
              <span className="histogram__label">{d.rating}</span>
              <span className="histogram__bar-track">
                <span
                  className="histogram__bar"
                  style={{ width: `${(d.count / maxBucket) * 100}%` }}
                />
              </span>
              <span className="histogram__count">{d.count}</span>
            </li>
          ))}
        </ul>
      </div>

      {stats.topTags.length > 0 && (
        <div className="stats-block">
          <h2 className="stats-block__title">Najczestsze tagi</h2>
          <ul className="stats-tags">
            {stats.topTags.map((t) => (
              <li key={t.tag} className="stats-tag">
                #{t.tag} <span className="stats-tag__count">{t.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
