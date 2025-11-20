/**
 * Vite Configuration - Build System
 * Best Practice Accademica 2024-2025
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        pricing: resolve(__dirname, 'pricing.html'),
        accesso: resolve(__dirname, 'accesso.html'),
        // Aggiungi altre pagine se necessario
      },
      output: {
        // Organizza output per mantenere struttura
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (assetInfo.name.match(/\.(png|jpg|jpeg|svg|gif|webp)$/)) {
            return 'assets/img/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    // Minificazione
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Mantieni console in dev
        drop_debugger: true
      }
    },
    // Source maps per debugging
    sourcemap: false, // Disabilita in production
    // Target browsers
    target: 'es2020',
    // CSS code splitting
    cssCodeSplit: true
  },
  // Server per development
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  // Ottimizzazioni
  optimizeDeps: {
    include: ['@supabase/supabase-js']
  },
  // Alias per import più puliti
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@assets': resolve(__dirname, './assets'),
      '@components': resolve(__dirname, './assets/js'),
      '@styles': resolve(__dirname, './assets/css')
    }
  }
});

