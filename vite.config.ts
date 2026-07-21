import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Usuwa atrybut `crossorigin` ze znacznikow <script>/<link> generowanych przez Vite.
 * Na GitHub Pages (brak naglowka CORS) Safari/iOS blokuje skrypty z crossorigin,
 * co objawia sie bialym ekranem i bledem "Script error.".
 */
function stripCrossorigin(): Plugin {
  return {
    name: 'strip-crossorigin',
    transformIndexHtml(html) {
      return html.replace(/\s+crossorigin(=["'][^"']*["'])?/g, '');
    },
  };
}

// https://vitejs.dev/config/
// Na produkcji (GitHub Pages) aplikacja jest serwowana z podkatalogu /BurStars/.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/BurStars/' : '/',
  plugins: [react(), stripCrossorigin()],
  build: {
    // Szeroka kompatybilnosc, w tym starsze Safari na iOS.
    target: ['es2019', 'safari13'],
  },
  server: {
    host: true,
    port: 5173,
  },
}));
