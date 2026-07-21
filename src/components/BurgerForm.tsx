import { useState, type FormEvent } from 'react';
import type { BurgerInput } from '../types/burger';
import { RatingStars } from './RatingStars';
import './BurgerForm.css';

interface BurgerFormProps {
  onSubmit: (input: BurgerInput) => Promise<void>;
  onCancel: () => void;
}

/**
 * Formularz dodawania burgera. Zbiera dane i przekazuje je w gore (do widoku),
 * ktory wola warstwe services. Formularz nie dotyka Firestore.
 */
export function BurgerForm({ onSubmit, onCancel }: BurgerFormProps) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [locationName, setLocationName] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length === 0) {
      setError('Podaj nazwe burgera.');
      return;
    }
    setBusy(true);
    setError(null);

    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const photos = photoUrl.trim().length > 0 ? [photoUrl.trim()] : [];

    try {
      await onSubmit({
        name,
        rating,
        locationName: locationName.trim() || undefined,
        tags,
        photos,
        notes: notes.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udalo sie zapisac.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="burger-form" onSubmit={handleSubmit}>
      <label className="field">
        <span className="field__label">Nazwa</span>
        <input
          className="field__input"
          type="text"
          value={name}
          maxLength={120}
          placeholder="np. Classic Cheeseburger"
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <div className="field">
        <span className="field__label">Ocena</span>
        <RatingStars value={rating} onChange={setRating} />
      </div>

      <label className="field">
        <span className="field__label">Lokalizacja</span>
        <input
          className="field__input"
          type="text"
          value={locationName}
          placeholder="np. Bar Burgerowy, Krakow"
          onChange={(e) => setLocationName(e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field__label">Tagi (po przecinku)</span>
        <input
          className="field__input"
          type="text"
          value={tagsText}
          placeholder="wolowina, smash, bekon"
          onChange={(e) => setTagsText(e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field__label">URL zdjecia</span>
        <input
          className="field__input"
          type="url"
          value={photoUrl}
          placeholder="https://…"
          onChange={(e) => setPhotoUrl(e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field__label">Notatki</span>
        <textarea
          className="field__input field__textarea"
          value={notes}
          rows={3}
          placeholder="Krotki opis wrazen…"
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>

      {error && <p className="burger-form__error">{error}</p>}

      <div className="burger-form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy}>
          Anuluj
        </button>
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? 'Zapisuje…' : 'Zapisz burgera'}
        </button>
      </div>
    </form>
  );
}
