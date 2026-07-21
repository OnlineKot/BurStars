import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import type { BurgerInput } from '../types/burger';
import './BurgerForm.css';

interface BurgerFormProps {
  /** Zapis: dane wpisu + opcjonalny plik zdjecia (wgrywany przez widok). */
  onSubmit: (input: BurgerInput, photoFile: File | null) => Promise<void>;
  onCancel: () => void;
}

/**
 * Formularz dodawania burgera. Zbiera dane (w tym ocene dziesietna, np. 7.5,
 * oraz zdjecie z telefonu) i przekazuje je w gore. Nie dotyka Firebase.
 */
export function BurgerForm({ onSubmit, onCancel }: BurgerFormProps) {
  const [name, setName] = useState('');
  const [ratingText, setRatingText] = useState('7.5');
  const [locationName, setLocationName] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [notes, setNotes] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  function clearPhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (name.trim().length === 0) {
      setError('Podaj nazwe burgera.');
      return;
    }
    const rating = Number(ratingText.replace(',', '.'));
    if (Number.isNaN(rating) || rating < 1 || rating > 10) {
      setError('Ocena musi byc liczba od 1 do 10 (np. 7.5).');
      return;
    }

    setBusy(true);
    setError(null);

    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      await onSubmit(
        {
          name,
          rating,
          locationName: locationName.trim() || undefined,
          tags,
          notes: notes.trim() || undefined,
        },
        photoFile,
      );
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

      <label className="field">
        <span className="field__label">Ocena (1–10, np. 7.5)</span>
        <input
          className="field__input"
          type="number"
          inputMode="decimal"
          step="0.1"
          min="1"
          max="10"
          value={ratingText}
          onChange={(e) => setRatingText(e.target.value)}
        />
      </label>

      <div className="field">
        <span className="field__label">Zdjecie</span>
        {photoPreview ? (
          <div className="photo-picker">
            <img className="photo-picker__preview" src={photoPreview} alt="Podglad zdjecia" />
            <button type="button" className="btn btn--ghost" onClick={clearPhoto}>
              Usun zdjecie
            </button>
          </div>
        ) : (
          <label className="photo-picker__drop">
            <input
              ref={fileInputRef}
              className="photo-picker__input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
            />
            <span>📷 Zrob zdjecie lub wybierz z galerii</span>
          </label>
        )}
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
