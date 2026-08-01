import { useState } from 'react';
import type { Burger } from './types/burger';
import { BurgerListView } from './views/BurgerListView';
import { AddBurgerView } from './views/AddBurgerView';
import { StatsView } from './views/StatsView';
import { useSecretUnlock } from './hooks/useSecretUnlock';
import { useAuth } from './hooks/useAuth';
import { CodeGate } from './components/CodeGate';
import { signInWithGoogle, signOutUser, isOwner } from './services/authService';
import './styles/App.css';

type Screen = 'list' | 'add' | 'stats';

/**
 * Korzen aplikacji.
 * - Goscie: ladny widok tylko do ogladania (lista + statystyki).
 * - Wlasciciel (konto Google programistatf@gmail.com): tryb roboczy z
 *   dodawaniem/edycja/usuwaniem.
 *
 * Wejscie wlasciciela jest ukryte: wpisz "TEO" i kliknij 7x w tytul -> logowanie Google.
 */
export function App() {
  const { owner } = useAuth();
  const [screen, setScreen] = useState<Screen>('list');
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState<Burger | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showCodeGate, setShowCodeGate] = useState(false);

  async function handleOwnerLogin() {
    setNotice(null);
    try {
      const user = await signInWithGoogle();
      if (!isOwner(user)) {
        await signOutUser();
        setNotice('To konto nie ma uprawnien wlasciciela.');
      }
    } catch {
      setNotice('Logowanie nie powiodlo sie.');
    }
  }

  // Ukryte wejscie wlasciciela: "TEO" + 7 klikniec w tytul -> logowanie Google.
  // Na telefonie (brak klawiatury) 7 klikniec otwiera okienko na kod.
  const { registerTap } = useSecretUnlock({
    onUnlock: () => void handleOwnerLogin(),
    onCodeRequired: () => setShowCodeGate(true),
  });

  function goList() {
    setEditing(null);
    setReloadKey((k) => k + 1);
    setScreen('list');
  }

  return (
    <div className={`app${owner ? ' app--owner' : ''}`}>
      <header className="app__header">
        <h1 className="app__title" onClick={registerTap} title="BurStars">
          🍔 BurStars
        </h1>
        <p className="app__tagline">
          Skala Burgerowa
          {owner && <span className="app__badge">TRYB ROBOCZY</span>}
        </p>
        {owner && (
          <button
            type="button"
            className="app__logout"
            onClick={() => void signOutUser()}
            aria-label="Wyloguj"
          >
            Wyloguj
          </button>
        )}
      </header>

      {notice && (
        <div className="app__notice" role="status">
          {notice}
          <button type="button" onClick={() => setNotice(null)} aria-label="Zamknij">
            ✕
          </button>
        </div>
      )}

      <main className="app__main">
        {screen === 'list' && (
          <BurgerListView
            key={reloadKey}
            owner={owner}
            onEdit={(b) => {
              setEditing(b);
              setScreen('add');
            }}
          />
        )}
        {screen === 'add' && owner && (
          <AddBurgerView editing={editing} onDone={goList} onCancel={goList} />
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

        {owner && (
          <button
            type="button"
            className={`app__nav-btn app__nav-btn--primary${screen === 'add' ? ' is-active' : ''}`}
            onClick={() => {
              setEditing(null);
              setScreen('add');
            }}
          >
            <span className="app__nav-icon">＋</span>
            Dodaj
          </button>
        )}

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

      {showCodeGate && (
        <CodeGate
          onClose={() => setShowCodeGate(false)}
          onSubmit={(code) => {
            setShowCodeGate(false);
            if (code.trim().toUpperCase() === 'TEO') {
              void handleOwnerLogin();
            }
          }}
        />
      )}
    </div>
  );
}
