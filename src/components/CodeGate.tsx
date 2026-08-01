import { useState, type FormEvent } from 'react';
import './CodeGate.css';

interface CodeGateProps {
  onClose: () => void;
  /** Wywolywane z wpisanym kodem; walidacja nalezy do rodzica. */
  onSubmit: (code: string) => void;
}

/**
 * Male okienko na kod — mobilna sciezka ukrytego wejscia wlasciciela
 * (na telefonie nie ma jak wpisac "TEO" bez pola tekstowego).
 * To tylko bramka UI; realna autoryzacja = logowanie Google + reguly Firestore.
 */
export function CodeGate({ onClose, onSubmit }: CodeGateProps) {
  const [code, setCode] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(code);
  }

  return (
    <div className="codegate-backdrop" role="dialog" aria-modal="true" aria-label="Kod dostepu">
      <form className="codegate" onSubmit={handleSubmit}>
        <p className="codegate__label">Kod dostępu</p>
        <input
          className="codegate__input"
          type="text"
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
        />
        <div className="codegate__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Anuluj
          </button>
          <button type="submit" className="btn btn--primary" disabled={!code.trim()}>
            OK
          </button>
        </div>
      </form>
    </div>
  );
}
