/**
 * Script per deploy manuale su Vercel
 * Usa quando hai raggiunto il limite di deploy automatici
 *
 * Uso: node scripts/deploy-vercel.js
 *
 * eslint-disable no-console -- CLI script, console output is expected
 */

import { execSync } from "child_process";

console.log("🚀 Deploy Manuale Vercel\n");

// Verifica se vercel CLI è installato
try {
  execSync("vercel --version", { stdio: "ignore" });
  console.log("✅ Vercel CLI trovato\n");
} catch {
  console.error("❌ Vercel CLI non installato!\n");
  console.log("Installa con: npm i -g vercel\n");
  console.log("Poi esegui: vercel login\n");
  console.log("E infine: vercel --prod\n");
  process.exit(1);
}

// Verifica se è loggato
try {
  execSync("vercel whoami", { stdio: "ignore" });
  console.log("✅ Sei loggato su Vercel\n");
} catch {
  console.error("❌ Non sei loggato su Vercel!\n");
  console.log("Esegui: vercel login\n");
  process.exit(1);
}

// Verifica che ci siano modifiche da deployare
try {
  const gitStatus = execSync("git status --porcelain", { encoding: "utf8" });
  if (gitStatus.trim()) {
    console.log("⚠️  Ci sono modifiche non committate:\n");
    console.log(gitStatus);
    console.log("\nVuoi continuare comunque? (s/n)");
    // In un ambiente interattivo, potresti voler chiedere conferma
    // Per ora procediamo
  }
} catch {
  // Git non disponibile o non in un repo, continua comunque
}

// Mostra ultimo commit
try {
  const lastCommit = execSync("git log -1 --oneline", { encoding: "utf8" });
  console.log("📝 Ultimo commit:");
  console.log(lastCommit.trim());
  console.log("");
} catch {
  // Ignora se git non disponibile
}

// Deploy
console.log("🚀 Avvio deploy in produzione...\n");
console.log("Questo bypassa il limite di deploy automatici.\n");

try {
  execSync("vercel --prod", { stdio: "inherit" });
  console.log("\n✅ Deploy completato con successo!");
} catch {
  console.error("\n❌ Errore durante il deploy");
  console.error("Verifica i log sopra per dettagli");
  process.exit(1);
}
