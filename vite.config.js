/**
 * Vite Configuration - Build System
 * Best Practice Accademica 2024-2025
 */

import { defineConfig } from "vite";
import { resolve } from "path";
import { copyFileSync, mkdirSync, readdirSync, statSync } from "fs";
import { join } from "path";

// Plugin per copiare file statici necessari (icons, favicons, etc.)
function copyStaticFiles() {
  return {
    name: "copy-static-files",
    closeBundle() {
      const staticDirs = ["icons", "favicons"];
      const outDir = resolve(__dirname, "dist");

      staticDirs.forEach((dir) => {
        const srcDir = resolve(__dirname, dir);
        const destDir = join(outDir, dir);

        try {
          if (!statSync(srcDir).isDirectory()) {
            return;
          }

          mkdirSync(destDir, { recursive: true });

          const files = readdirSync(srcDir);
          files.forEach((file) => {
            const srcPath = join(srcDir, file);
            const destPath = join(destDir, file);

            if (statSync(srcPath).isFile()) {
              copyFileSync(srcPath, destPath);
            }
          });

          console.log(`✅ Copiata cartella: ${dir}/`);
        } catch (error) {
          if (error.code !== "ENOENT") {
            console.warn(`⚠️  Impossibile copiare ${dir}/:`, error.message);
          }
        }
      });
    },
  };
}

export default defineConfig({
  root: ".",
  publicDir: false, // Non usare publicDir, tutti i file statici sono nella root
  plugins: [copyStaticFiles()],
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
    // Minificazione (usa esbuild - default di Vite, veloce e incluso)
    minify: "esbuild",
    // esbuild è incluso in Vite e non richiede dipendenze aggiuntive
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
  // Performance: Pre-bundling e minificazione
  esbuild: {
    target: "es2020",
    legalComments: "none", // Rimuovi commenti legali
    drop: ["console", "debugger"], // Rimuovi console e debugger in production
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
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
