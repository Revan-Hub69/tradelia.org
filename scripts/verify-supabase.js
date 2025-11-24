#!/usr/bin/env node
/**
 * Script di verifica Supabase
 * Verifica connessione, tabelle, RLS, funzioni e configurazione
 */
/* eslint-disable no-console */

import { createClient } from "@supabase/supabase-js";

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, "green");
}

function error(message) {
  log(`✗ ${message}`, "red");
}

function warn(message) {
  log(`⚠ ${message}`, "yellow");
}

function info(message) {
  log(`ℹ ${message}`, "cyan");
}

function section(title) {
  console.log("\n" + "=".repeat(60));
  log(title, "bold");
  console.log("=".repeat(60));
}

// Check environment variables
function checkEnvVars() {
  section("1. Verifica Variabili d'Ambiente");

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL) {
    error("SUPABASE_URL non configurata");
    console.log("\n📋 COME CONFIGURARE:");
    console.log("  1. Vai su Supabase Dashboard > Settings > API");
    console.log('  2. Copia "Project URL"');
    console.log("  3. Su Vercel: Settings > Environment Variables > Aggiungi SUPABASE_URL");
    console.log("  4. In locale: crea .env.local con SUPABASE_URL=...");
    return false;
  } else {
    success(`SUPABASE_URL: ${SUPABASE_URL.substring(0, 30)}...`);
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    error("SUPABASE_SERVICE_ROLE_KEY non configurata");
    console.log("\n📋 COME CONFIGURARE:");
    console.log("  1. Vai su Supabase Dashboard > Settings > API");
    console.log('  2. Copia "service_role" key (quella SEGRETA, non anon!)');
    console.log(
      "  3. Su Vercel: Settings > Environment Variables > Aggiungi SUPABASE_SERVICE_ROLE_KEY"
    );
    console.log("  4. In locale: crea .env.local con SUPABASE_SERVICE_ROLE_KEY=...");
    return false;
  } else {
    success("SUPABASE_SERVICE_ROLE_KEY configurata");
  }

  if (!SUPABASE_ANON_KEY) {
    warn("SUPABASE_ANON_KEY non configurata (opzionale per server-side)");
  } else {
    success("SUPABASE_ANON_KEY configurata");
  }

  return true;
}

// Test connection
async function testConnection(supabase) {
  section("2. Test Connessione");

  try {
    // Simple query to test connection
    const { error } = await supabase.from("dashboard_access_tokens").select("count").limit(1);

    if (error) {
      if (error.code === "PGRST116") {
        error("Tabella dashboard_access_tokens non trovata");
        warn("Esegui gli script SQL in supabase/ per creare le tabelle");
      } else {
        error(`Errore connessione: ${error.message}`);
      }
      return false;
    }

    success("Connessione a Supabase riuscita");
    return true;
  } catch (err) {
    error(`Errore connessione: ${err.message}`);
    return false;
  }
}

// Check required tables
async function checkTables(supabase) {
  section("3. Verifica Tabelle");

  const requiredTables = [
    "dashboard_access_tokens",
    "dashboard_refresh_tokens",
    "user_roles",
    "education_modules",
    "education_lessons",
    "education_user_progress",
    "education_tests",
    "education_user_test_attempts",
    "asset_proposals",
    "asset_votes",
  ];

  const optionalTables = ["subscribers", "admin_emails", "credits_log", "payments", "invoices"];

  const results = {
    required: [],
    optional: [],
    missing: [],
  };

  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select("*").limit(1);
      if (error) {
        if (error.code === "PGRST116") {
          error(`Tabella ${table} NON ESISTE`);
          results.missing.push(table);
        } else {
          warn(`Tabella ${table} accessibile ma con errori: ${error.message}`);
          results.required.push({ name: table, status: "error", error: error.message });
        }
      } else {
        success(`Tabella ${table} esiste e accessibile`);
        results.required.push({ name: table, status: "ok" });
      }
    } catch (err) {
      error(`Errore verifica ${table}: ${err.message}`);
      results.missing.push(table);
    }
  }

  for (const table of optionalTables) {
    try {
      const { error } = await supabase.from(table).select("*").limit(1);
      if (error) {
        if (error.code === "PGRST116") {
          info(`Tabella opzionale ${table} non esiste (ok)`);
        } else {
          warn(`Tabella opzionale ${table}: ${error.message}`);
        }
      } else {
        success(`Tabella opzionale ${table} esiste`);
        results.optional.push({ name: table, status: "ok" });
      }
    } catch (err) {
      info(`Tabella opzionale ${table} non accessibile: ${err.message}`);
    }
  }

  if (results.missing.length > 0) {
    console.log("\n");
    error(`Tabelle mancanti (${results.missing.length}):`);
    results.missing.forEach((table) => {
      console.log(`  - ${table}`);
    });
    warn("\nEsegui gli script SQL in supabase/ per creare le tabelle mancanti");
  }

  return results.missing.length === 0;
}

// Check RLS policies
async function checkRLS(supabase) {
  section("4. Verifica RLS Policies");

  try {
    // Check if we can query RLS info (requires admin access)
    const { data, error } = await supabase.rpc("get_rls_policies", {});

    if (error) {
      // Try alternative method
      warn("Impossibile verificare RLS policies direttamente");
      info("Verifica manualmente in Supabase Dashboard > Authentication > Policies");
      return true; // Don't fail, just warn
    }

    if (data && data.length > 0) {
      success(`Trovate ${data.length} RLS policies`);
    } else {
      warn("Nessuna RLS policy trovata");
    }

    return true;
  } catch (err) {
    warn(`Errore verifica RLS: ${err.message}`);
    info("Verifica manualmente in Supabase Dashboard");
    return true; // Don't fail
  }
}

// Check functions
async function checkFunctions(supabase) {
  section("5. Verifica Funzioni Database");

  const requiredFunctions = ["notify_analysis_completed", "get_user_emails"];

  const results = [];

  for (const funcName of requiredFunctions) {
    try {
      // Try to call function (will fail if doesn't exist)
      const { error } = await supabase.rpc(funcName, {});

      if (error) {
        if (error.code === "42883" || error.message.includes("does not exist")) {
          error(`Funzione ${funcName} NON ESISTE`);
          results.push({ name: funcName, status: "missing" });
        } else {
          // Function exists but parameters wrong (expected)
          success(`Funzione ${funcName} esiste`);
          results.push({ name: funcName, status: "ok" });
        }
      } else {
        success(`Funzione ${funcName} esiste e funziona`);
        results.push({ name: funcName, status: "ok" });
      }
    } catch (err) {
      if (err.message.includes("does not exist")) {
        error(`Funzione ${funcName} NON ESISTE`);
        results.push({ name: funcName, status: "missing" });
      } else {
        warn(`Errore verifica ${funcName}: ${err.message}`);
        results.push({ name: funcName, status: "error" });
      }
    }
  }

  const missing = results.filter((r) => r.status === "missing");
  if (missing.length > 0) {
    warn(`\nFunzioni mancanti: ${missing.map((m) => m.name).join(", ")}`);
    info("Esegui gli script SQL in supabase/ per creare le funzioni");
  }

  return missing.length === 0;
}

// Check data samples
async function checkData(supabase) {
  section("6. Verifica Dati di Esempio");

  const checks = [];

  // Check education modules
  try {
    const { data, error } = await supabase
      .from("education_modules")
      .select("id, title, is_active")
      .eq("is_active", true)
      .limit(5);

    if (error) {
      warn(`Errore query education_modules: ${error.message}`);
    } else {
      if (data && data.length > 0) {
        success(`Trovati ${data.length} moduli educativi attivi`);
        checks.push({ name: "education_modules", count: data.length, status: "ok" });
      } else {
        warn("Nessun modulo educativo attivo trovato");
        checks.push({ name: "education_modules", count: 0, status: "empty" });
      }
    }
  } catch (err) {
    warn(`Errore verifica education_modules: ${err.message}`);
  }

  // Check user roles
  try {
    const { data, error } = await supabase.from("user_roles").select("email, role").limit(5);

    if (error) {
      if (error.code !== "PGRST116") {
        warn(`Errore query user_roles: ${error.message}`);
      }
    } else {
      if (data && data.length > 0) {
        success(`Trovati ${data.length} ruoli utente`);
        checks.push({ name: "user_roles", count: data.length, status: "ok" });
      } else {
        info("Nessun ruolo utente trovato (normale se non ci sono utenti)");
        checks.push({ name: "user_roles", count: 0, status: "empty" });
      }
    }
  } catch (err) {
    warn(`Errore verifica user_roles: ${err.message}`);
  }

  // Check access tokens
  try {
    const { data, error } = await supabase
      .from("dashboard_access_tokens")
      .select("id, email, plan_role, revoked")
      .eq("revoked", false)
      .limit(5);

    if (error) {
      warn(`Errore query dashboard_access_tokens: ${error.message}`);
    } else {
      if (data && data.length > 0) {
        success(`Trovati ${data.length} token attivi`);
        checks.push({ name: "dashboard_access_tokens", count: data.length, status: "ok" });
      } else {
        info("Nessun token attivo trovato (normale se non ci sono token)");
        checks.push({ name: "dashboard_access_tokens", count: 0, status: "empty" });
      }
    }
  } catch (err) {
    warn(`Errore verifica dashboard_access_tokens: ${err.message}`);
  }

  return checks;
}

// Check auth configuration
async function checkAuth(supabase) {
  section("7. Verifica Configurazione Auth");

  try {
    // Try to list users (requires service role)
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      error(`Errore accesso Auth Admin: ${error.message}`);
      warn("Verifica che SUPABASE_SERVICE_ROLE_KEY sia corretta");
      return false;
    }

    success(`Accesso Auth Admin funzionante`);
    info(`Trovati ${users?.users?.length || 0} utenti in Supabase Auth`);

    // Check email settings
    info("Verifica manualmente in Supabase Dashboard > Authentication > Settings:");
    info("  - Email templates configurati");
    info("  - SMTP settings (se usi email custom)");
    info("  - Email verification enabled/disabled");

    return true;
  } catch (err) {
    error(`Errore verifica Auth: ${err.message}`);
    return false;
  }
}

// Check storage buckets
async function checkStorage(supabase) {
  section("8. Verifica Storage Buckets");

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      warn(`Errore accesso Storage: ${error.message}`);
      return false;
    }

    if (buckets && buckets.length > 0) {
      success(`Trovati ${buckets.length} storage buckets`);
      buckets.forEach((bucket) => {
        info(`  - ${bucket.name} (${bucket.public ? "public" : "private"})`);
      });
    } else {
      info("Nessun storage bucket configurato (opzionale)");
    }

    return true;
  } catch (err) {
    warn(`Errore verifica Storage: ${err.message}`);
    return true; // Don't fail
  }
}

// Generate report
function generateReport(results) {
  section("Riepilogo Verifica");

  const passed = Object.values(results).filter((v) => v === true).length;
  const failed = Object.values(results).filter((v) => v === false).length;
  const warnings = Object.values(results).filter((v) => v === "warning").length;

  console.log("\n");
  log(`Risultati: ${passed} passati, ${failed} falliti, ${warnings} warning`, "bold");

  if (failed === 0) {
    success("\n✓ Tutte le verifiche critiche sono passate!");
  } else {
    error(`\n✗ ${failed} verifiche critiche sono fallite`);
    console.log("\nAzioni consigliate:");
    console.log("  1. Verifica le variabili d'ambiente (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)");
    console.log("  2. Esegui gli script SQL in supabase/ per creare tabelle/funzioni mancanti");
    console.log("  3. Verifica RLS policies in Supabase Dashboard");
    console.log("  4. Controlla i log di errore sopra per dettagli");
  }

  if (warnings > 0) {
    warn(`\n⚠ ${warnings} warning (non critici ma da verificare)`);
  }
}

// Main function
async function main() {
  console.log("\n");
  log("🔍 Verifica Configurazione Supabase", "bold");
  log("=====================================\n", "cyan");

  // Check environment
  if (!checkEnvVars()) {
    error("\nConfigurazione ambiente incompleta. Impossibile continuare.");
    process.exit(1);
  }

  // Initialize Supabase client
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const results = {};

  // Run checks
  results.connection = await testConnection(supabase);
  if (!results.connection) {
    error("\nConnessione fallita. Verifica SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  results.tables = await checkTables(supabase);
  results.rls = await checkRLS(supabase);
  results.functions = await checkFunctions(supabase);
  results.data = await checkData(supabase);
  results.auth = await checkAuth(supabase);
  results.storage = await checkStorage(supabase);

  // Generate report
  generateReport(results);

  // Exit code
  const hasFailures = Object.values(results).some((r) => r === false);
  process.exit(hasFailures ? 1 : 0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    error(`\nErrore fatale: ${err.message}`);
    console.error(err);
    process.exit(1);
  });
}

export { main as verifySupabase };
