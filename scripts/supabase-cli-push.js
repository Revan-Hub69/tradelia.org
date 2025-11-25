#!/usr/bin/env node
/**
 * Script per eseguire file SQL usando Supabase CLI
 *
 * Questo script usa Supabase CLI (deve essere installato)
 * che è il metodo UFFICIALE e più affidabile.
 *
 * Uso:
 *   npm run supabase:cli:push <file.sql>
 *   npm run supabase:cli:push:all
 */

/* eslint-disable no-console */
import { readFileSync, writeFileSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..");

// ===== CONFIGURAZIONE =====

const SUPABASE_URL = process.env.SUPABASE_URL;

if (!SUPABASE_URL) {
  console.error("❌ Errore: SUPABASE_URL non configurata");
  console.error("");
  console.error("Configura SUPABASE_URL nel file .env.local o come variabile d'ambiente");
  process.exit(1);
}

// Estrai project ref da URL
const projectRefMatch = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
if (!projectRefMatch) {
  console.error("❌ Errore: Impossibile estrarre project ref da SUPABASE_URL");
  console.error("   Formato atteso: https://<ref>.supabase.co");
  process.exit(1);
}

const PROJECT_REF = projectRefMatch[1];

// ===== FUNZIONI =====

/**
 * Verifica se Supabase CLI è installato
 */
function checkCLIInstalled() {
  try {
    execSync("supabase --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Esegue un file SQL usando Supabase CLI
 */
async function pushSQLFileCLI(filePath) {
  const fullPath = join(PROJECT_ROOT, "supabase", filePath);

  try {
    console.log(`📄 Leggendo: ${filePath}...`);
    const sqlContent = readFileSync(fullPath, "utf-8");

    if (!sqlContent.trim()) {
      console.warn(`⚠️  File vuoto: ${filePath}`);
      return { success: false, error: "File vuoto" };
    }

    // Crea file temporaneo
    const tempFile = join(PROJECT_ROOT, ".temp-sql-exec.sql");
    writeFileSync(tempFile, sqlContent, "utf-8");

    try {
      console.log(`🚀 Eseguendo: ${filePath}...`);

      // Usa Supabase CLI per eseguire SQL
      // Metodo 1: Se il progetto è linkato
      try {
        execSync(`supabase db execute -f "${tempFile}"`, {
          cwd: PROJECT_ROOT,
          stdio: "inherit",
        });
        console.log(`✅ Completato: ${filePath}`);
        return { success: true };
      } catch {
        // Se non è linkato, prova con project ref diretto
        console.log("⚠️  Progetto non linkato, uso project ref diretto...");

        // Nota: Questo richiede autenticazione CLI
        // L'utente deve aver fatto `supabase login` prima
        execSync(`supabase db execute -f "${tempFile}" --project-ref ${PROJECT_REF}`, {
          cwd: PROJECT_ROOT,
          stdio: "inherit",
        });

        console.log(`✅ Completato: ${filePath}`);
        return { success: true };
      }
    } finally {
      // Rimuovi file temporaneo
      try {
        unlinkSync(tempFile);
      } catch {
        // Ignora errori di rimozione
      }
    }
  } catch (error) {
    console.error(`❌ Errore in ${filePath}:`);
    console.error(`   ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Lista tutti i file SQL disponibili
 */
async function listSQLFiles() {
  const fs = await import("fs");
  const supabaseDir = join(PROJECT_ROOT, "supabase");
  const files = fs
    .readdirSync(supabaseDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  return files;
}

// ===== MAIN =====

async function main() {
  // Verifica CLI installato
  if (!checkCLIInstalled()) {
    console.error("❌ Supabase CLI non installato");
    console.error("");
    console.error("Installa con:");
    console.error("   npm install -g supabase");
    console.error("");
    console.error("Oppure usa:");
    console.error("   npm run supabase:push (metodo API)");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "all" || command === "--all") {
    const files = await listSQLFiles();
    console.log("📋 File SQL trovati:");
    files.forEach((f, i) => console.log(`   ${i + 1}. ${f}`));
    console.log("");
    console.log("🚀 Eseguendo tutti i file...");
    console.log("");

    const results = [];
    for (const file of files) {
      const result = await pushSQLFileCLI(file);
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
    console.error("❌ Uso: npm run supabase:cli:push <file.sql>");
    console.error("   oppure: npm run supabase:cli:push:all");
    process.exit(1);
  }

  // Esegui file specifico
  await pushSQLFileCLI(command);
}

main().catch((error) => {
  console.error("❌ Errore fatale:");
  console.error(error);
  process.exit(1);
});
