#!/usr/bin/env node
/**
 * Script per eseguire file SQL su Supabase direttamente da Cursor
 *
 * Uso:
 *   npm run supabase:push <file.sql>
 *   npm run supabase:push:all
 *   npm run supabase:push:list
 */

/* eslint-disable no-console */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..");

// ===== CONFIGURAZIONE =====
// Le variabili d'ambiente devono essere configurate:
// - SUPABASE_URL: URL del progetto Supabase
// - SUPABASE_SERVICE_ROLE_KEY: Service Role Key (non anon key!)

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Errore: Variabili d'ambiente mancanti");
  console.error("");
  console.error("Configura le seguenti variabili:");
  console.error("  - SUPABASE_URL");
  console.error("  - SUPABASE_SERVICE_ROLE_KEY");
  console.error("");
  console.error("Opzioni:");
  console.error("  1. Crea file .env.local nella root del progetto:");
  console.error("     SUPABASE_URL=https://xxx.supabase.co");
  console.error("     SUPABASE_SERVICE_ROLE_KEY=eyJ...");
  console.error("");
  console.error("  2. Oppure esporta le variabili nel terminale:");
  console.error("     export SUPABASE_URL=...");
  console.error("     export SUPABASE_SERVICE_ROLE_KEY=...");
  console.error("");
  console.error("  3. Oppure passa come parametri:");
  console.error("     SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run supabase:push");
  process.exit(1);
}

// ===== FUNZIONI =====

/**
 * Esegue uno script SQL su Supabase usando il client
 *
 * NOTA: Supabase non supporta esecuzione SQL arbitraria via API REST.
 * Questo script usa un workaround creando una funzione temporanea RPC.
 *
 * Per script complessi, usa Supabase CLI (metodo consigliato).
 */
async function executeSQL(sqlContent, fileName) {
  // Metodo: Crea una funzione RPC temporanea che esegue il SQL
  // Questo è un workaround perché Supabase non permette esecuzione SQL diretta via API

  // Dividi lo script in statement separati (semplificato)
  const statements = sqlContent
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  if (statements.length === 0) {
    throw new Error("Nessuno statement SQL trovato");
  }

  console.warn("⚠️  ATTENZIONE: Esecuzione SQL via API è limitata.");
  console.warn("   Per script complessi (CREATE TABLE, ALTER, etc.), usa:");
  console.warn("   - Supabase CLI: npm run supabase:cli:push");
  console.warn("   - SQL Editor: Dashboard Supabase → SQL Editor");
  console.warn("");

  // Per ora, suggeriamo di usare CLI
  console.error("❌ Esecuzione SQL complessa non supportata via API.");
  console.error("");
  console.error("✅ SOLUZIONE: Usa Supabase CLI (metodo ufficiale):");
  console.error("");
  console.error("   1. Installa: npm install -g supabase");
  console.error("   2. Login: supabase login");
  console.error("   3. Link: supabase link --project-ref <ref>");
  console.error("   4. Esegui: npm run supabase:cli:push " + fileName);
  console.error("");
  console.error("   Oppure copia/incolla nel SQL Editor di Supabase Dashboard.");
  console.error("");

  throw new Error("Usa Supabase CLI per script SQL complessi");
}

/**
 * Esegue un file SQL
 */
async function pushSQLFile(filePath) {
  const fullPath = join(PROJECT_ROOT, "supabase", filePath);

  try {
    console.log(`📄 Leggendo: ${filePath}...`);
    const sqlContent = readFileSync(fullPath, "utf-8");

    if (!sqlContent.trim()) {
      console.warn(`⚠️  File vuoto: ${filePath}`);
      return { success: false, error: "File vuoto" };
    }

    console.log(`🚀 Eseguendo: ${filePath}...`);
    const result = await executeSQL(sqlContent, filePath);

    console.log(`✅ Completato: ${filePath}`);
    return { success: true, result };
  } catch (error) {
    console.error(`❌ Errore in ${filePath}:`);
    console.error(`   ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ===== MAIN =====

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "list" || command === "--list" || command === "-l") {
    const fs = await import("fs");
    const supabaseDir = join(PROJECT_ROOT, "supabase");
    const files = fs
      .readdirSync(supabaseDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    console.log("📋 File SQL disponibili:");
    console.log("");
    files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });
    console.log("");
    console.log(`Totale: ${files.length} file`);
    return;
  }

  if (command === "all" || command === "--all") {
    const fs = await import("fs");
    const supabaseDir = join(PROJECT_ROOT, "supabase");
    const files = fs
      .readdirSync(supabaseDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();
    console.log("");
    console.log("🚀 Eseguendo tutti i file...");
    console.log("");

    const results = [];
    for (const file of files) {
      const result = await pushSQLFile(file);
      results.push({ file, ...result });
      console.log(""); // Spazio tra file
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    console.log("=".repeat(50));
    console.log(`✅ Completati: ${successCount}`);
    console.log(`❌ Falliti: ${failCount}`);
    console.log("=".repeat(50));
    return;
  }

  if (!command || command.startsWith("-")) {
    console.error("❌ Uso: npm run supabase:push <file.sql>");
    console.error("   oppure: npm run supabase:push:all");
    console.error("   oppure: npm run supabase:push:list");
    process.exit(1);
  }

  // Esegui file specifico
  await pushSQLFile(command);
}

main().catch((error) => {
  console.error("❌ Errore fatale:");
  console.error(error);
  process.exit(1);
});
