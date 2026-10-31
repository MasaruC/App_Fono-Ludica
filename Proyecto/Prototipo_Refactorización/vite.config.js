import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './', // Vital para empaquetado móvil Capacitor (rutas relativas en WebView)
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: false
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  }
});

