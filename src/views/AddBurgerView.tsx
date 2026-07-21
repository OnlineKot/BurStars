import type { BurgerInput } from '../types/burger';
import { BurgerForm } from '../components/BurgerForm';
import { createBurger } from '../services/burgerService';
import { ensureSignedIn } from '../services/authService';

interface AddBurgerViewProps {
  onDone: () => void;
  onCancel: () => void;
}

/**
 * Widok dodawania burgera. Spina formularz z warstwa services:
 * loguje uzytkownika (anonimowo, jesli trzeba) i zapisuje wpis.
 */
export function AddBurgerView({ onDone, onCancel }: AddBurgerViewProps) {
  async function handleSubmit(input: BurgerInput) {
    await ensureSignedIn();
    await createBurger(input);
    onDone();
  }

  return (
    <section className="add-view">
      <h1 className="add-view__title">Nowy burger</h1>
      <BurgerForm onSubmit={handleSubmit} onCancel={onCancel} />
    </section>
  );
}
