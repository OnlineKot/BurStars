import { useState, type FormEvent } from 'react';
import { verifyAdminAccess } from '../services/authService';
import { ServiceError } from '../services/serviceError';
import './PasswordModal.css';

interface PasswordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal prosby o haslo — pokazywany po odblokowaniu ukryta funkcja
 * (TEO + 7 klikniec). Weryfikacja idzie przez authService (Firebase Auth),
 * haslo nie jest porownywane lokalnie.
 */
export function PasswordModal({ onClose, onSuccess }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await verifyAdminAccess(password);
      onSuccess();
    } catch (err) {
      const message =
        err instanceof ServiceError ? err.message : 'Nie udalo sie zweryfikowac hasla.';
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Dostep administratora">
      <div className="modal">
        <h2 className="modal__title">🔒 Dostep administratora</h2>
        <p className="modal__subtitle">Podaj haslo, aby kontynuowac.</p>

        <form className="modal__form" onSubmit={handleSubmit}>
          <input
            className="modal__input"
            type="password"
            inputMode="text"
            autoComplete="current-password"
            placeholder="Haslo"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />

          {error && <p className="modal__error">{error}</p>}

          <div className="modal__actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={onClose}
              disabled={busy}
            >
              Anuluj
            </button>
            <button type="submit" className="btn btn--primary" disabled={busy || !password}>
              {busy ? 'Sprawdzam…' : 'Potwierdz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
