import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import type { Burger, BurgerInput } from '../types/burger';
import './BurgerForm.css';

interface BurgerFormProps {
  /** Wartosci poczatkowe (tryb edycji). */
  initial?: Burger;
  /** Zapis: dane wpisu + opcjonalny plik zdjecia (kompresowany przez widok). */
  onSubmit: (input: BurgerInput, photoFile: File | null) => Promise<void>;
  onCancel: () => void;
}

/**
 * Formularz dodawania/edycji burgera. Zbiera dane (ocena dziesietna, zdjecie
 * z telefonu) i przekazuje je w gore. Nie dotyka Firebase.
 */
export function BurgerForm({ initial, onSubmit, onCancel }: BurgerFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [ratingText, setRatingText] = useState(initial ? String(initial.rating) : '7.5');
  const [locationName, setLocationName] = useState(initial?.locationName ?? '');
  const [tagsText, setTagsText] = useState(initial?.tags.join(', ') ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initial?.photos[0] ?? null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (photoPreview && photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  function clearPhoto() {
    if (photoPreview && photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
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
          // puste stringi celowo: przy edycji nadpisuja (czyszcza) stare wartosci
          locationName: locationName.trim(),
          tags,
          notes: notes.trim(),
          // brak podgladu = uzytkownik usunal zdjecie -> zapisz pusta liste;
          // nowy plik i tak nadpisze to pole warstwe wyzej
          photos: photoPreview === null ? [] : initial?.photos ?? [],
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
          maxLength={200}
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
          maxLength={2000}
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
          {busy ? 'Zapisuje…' : initial ? 'Zapisz zmiany' : 'Zapisz burgera'}
        </button>
      </div>
    </form>
  );
}
