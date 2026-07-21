import type { BurgerInput } from '../types/burger';
import { BurgerForm } from '../components/BurgerForm';
import { createBurger } from '../services/burgerService';
import { ensureSignedIn } from '../services/authService';
import { fileToCompressedDataUrl } from '../services/imageService';

interface AddBurgerViewProps {
  onDone: () => void;
  onCancel: () => void;
}

/**
 * Widok dodawania burgera. Spina formularz z warstwa services:
 * loguje uzytkownika (anonimowo, jesli trzeba), kompresuje zdjecie do Data URL
 * (bez Storage) i zapisuje wpis w Firestore.
 */
export function AddBurgerView({ onDone, onCancel }: AddBurgerViewProps) {
  async function handleSubmit(input: BurgerInput, photoFile: File | null) {
    await ensureSignedIn();

    let photos = input.photos ?? [];
    if (photoFile) {
      const dataUrl = await fileToCompressedDataUrl(photoFile);
      photos = [dataUrl];
    }

    await createBurger({ ...input, photos });
    onDone();
  }

  return (
    <section className="add-view">
      <h1 className="add-view__title">Nowy burger</h1>
      <BurgerForm onSubmit={handleSubmit} onCancel={onCancel} />
    </section>
  );
}
