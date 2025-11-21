/**
 * Vite Configuration - Build System
 * Best Practice Accademica 2024-2025
 */

import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // Performance: Chunk size warnings
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        dashboard: resolve(__dirname, "dashboard.html"),
        pricing: resolve(__dirname, "pricing.html"),
        accesso: resolve(__dirname, "accesso.html"),
        // Aggiungi altre pagine se necessario
      },
      output: {
        // Organizza output per mantenere struttura
        entryFileNames: "assets/js/[name]-[hash].js",
        chunkFileNames: "assets/js/chunks/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith(".css")) {
            return "assets/css/[name]-[hash][extname]";
          }
          if (assetInfo.name.match(/\.(png|jpg|jpeg|svg|gif|webp)$/)) {
            return "assets/img/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
        // Code splitting manuale per moduli dashboard
        manualChunks: (id) => {
          // Dashboard modules in chunk separato
          if (id.includes("assets/js/dashboard/")) {
            const moduleName = id.split("/").pop().replace(".js", "");
            return `dashboard-${moduleName}`;
          }
          // Vendor chunks
          if (id.includes("node_modules")) {
            if (id.includes("@supabase")) {
              return "vendor-supabase";
            }
            return "vendor";
          }
        },
      },
    },
    // Minificazione ottimizzata
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Rimuovi console in production
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info"], // Rimuovi funzioni pure
        passes: 2, // Multi-pass compression
      },
      format: {
        comments: false, // Rimuovi commenti
      },
    },
    // Source maps solo in development
    sourcemap: process.env.NODE_ENV === "development",
    // Target browsers moderni
    target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
    // CSS code splitting
    cssCodeSplit: true,
    // CSS minification (usa default di Vite - esbuild)
    // Asset inlining threshold (files < 4KB inline)
    assetsInlineLimit: 4096,
    // Report bundle size
    reportCompressedSize: true,
    // Compression
    brotliSize: true,
  },
  // Server per development
  server: {
    port: 3000,
    open: true,
    cors: true,
  },
  // Ottimizzazioni dipendenze
  optimizeDeps: {
    include: ["@supabase/supabase-js"],
    exclude: [], // Aggiungi moduli che non devono essere pre-bundlati
  },
  // Performance: Pre-bundling
  esbuild: {
    target: "es2020",
    legalComments: "none", // Rimuovi commenti legali
  },
  // Alias per import più puliti
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
      "@assets": resolve(__dirname, "./assets"),
      "@components": resolve(__dirname, "./assets/js"),
      "@styles": resolve(__dirname, "./assets/css"),
    },
  },
});
