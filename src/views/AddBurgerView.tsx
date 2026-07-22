import type { Burger, BurgerInput } from '../types/burger';
import { BurgerForm } from '../components/BurgerForm';
import { createBurger, updateBurger } from '../services/burgerService';
import { fileToCompressedDataUrl } from '../services/imageService';

interface AddBurgerViewProps {
  /** Jesli podany — tryb edycji istniejacego wpisu. */
  editing?: Burger | null;
  onDone: () => void;
  onCancel: () => void;
}

/**
 * Widok dodawania/edycji burgera (tylko dla wlasciciela). Spina formularz
 * z warstwa services: kompresuje zdjecie do Data URL (bez Storage) i zapisuje.
 * Wlasciciel jest juz zalogowany kontem Google, wiec zapis przechodzi reguly.
 */
export function AddBurgerView({ editing, onDone, onCancel }: AddBurgerViewProps) {
  async function handleSubmit(input: BurgerInput, photoFile: File | null) {
    let photos = input.photos ?? [];
    if (photoFile) {
      const dataUrl = await fileToCompressedDataUrl(photoFile);
      photos = [dataUrl];
    }

    if (editing) {
      await updateBurger(editing.id, { ...input, photos });
    } else {
      await createBurger({ ...input, photos });
    }
    onDone();
  }

  return (
    <section className="add-view">
      <h1 className="add-view__title">{editing ? 'Edytuj burgera' : 'Nowy burger'}</h1>
      <BurgerForm initial={editing ?? undefined} onSubmit={handleSubmit} onCancel={onCancel} />
    </section>
  );
}
