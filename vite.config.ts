import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// Na produkcji (GitHub Pages) aplikacja jest serwowana z podkatalogu /BurStars/,
// wiec ustawiamy odpowiedni `base`. W dev serwujemy z roota.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/BurStars/' : '/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
}));
