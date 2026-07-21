import { useState } from 'react';
import { BurgerListView } from './views/BurgerListView';
import { AddBurgerView } from './views/AddBurgerView';
import { StatsView } from './views/StatsView';
import { PasswordModal } from './components/PasswordModal';
import { useSecretUnlock } from './hooks/useSecretUnlock';
import './styles/App.css';

type Screen = 'list' | 'add' | 'stats';

/**
 * Korzen aplikacji. Prosty router stanowy (bez zewnetrznej biblioteki routingu)
 * — wystarczajacy dla mobilnego UX z dolnym paskiem nawigacji.
 *
 * Ukryta funkcja: wpisanie "TEO" + 7 klikniec w tytul otwiera modal hasla.
 */
export function App() {
  const [screen, setScreen] = useState<Screen>('list');
  const [reloadKey, setReloadKey] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Wyzwalacz ukrytej funkcji — tytul jest elementem "klikanym 7 razy".
  const { registerTap } = useSecretUnlock(() => setShowPasswordModal(true));

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title" onClick={registerTap} title="BurStars">
          🍔 BurStars
        </h1>
        <p className="app__tagline">
          Skala Burgerowa {isAdmin && <span className="app__badge">ADMIN</span>}
        </p>
      </header>

      <main className="app__main">
        {screen === 'list' && <BurgerListView key={reloadKey} />}
        {screen === 'add' && (
          <AddBurgerView
            onDone={() => {
              setReloadKey((k) => k + 1);
              setScreen('list');
            }}
            onCancel={() => setScreen('list')}
          />
        )}
        {screen === 'stats' && <StatsView key={reloadKey} />}
      </main>

      <nav className="app__nav">
        <button
          type="button"
          className={`app__nav-btn${screen === 'list' ? ' is-active' : ''}`}
          onClick={() => setScreen('list')}
        >
          <span className="app__nav-icon">🍔</span>
          Lista
        </button>
        <button
          type="button"
          className={`app__nav-btn app__nav-btn--primary${screen === 'add' ? ' is-active' : ''}`}
          onClick={() => setScreen('add')}
        >
          <span className="app__nav-icon">＋</span>
          Dodaj
        </button>
        <button
          type="button"
          className={`app__nav-btn${screen === 'stats' ? ' is-active' : ''}`}
          onClick={() => {
            setReloadKey((k) => k + 1);
            setScreen('stats');
          }}
        >
          <span className="app__nav-icon">📊</span>
          Statystyki
        </button>
      </nav>

      {showPasswordModal && (
        <PasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => {
            setIsAdmin(true);
            setShowPasswordModal(false);
          }}
        />
      )}
    </div>
  );
}
