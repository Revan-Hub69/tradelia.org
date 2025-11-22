#!/usr/bin/env node
/**
 * Post-Commit Auto-Version Hook
 *
 * Eseguito dopo ogni commit per:
 * 1. Verificare se la versione è cambiata
 * 2. Se sì, fare commit automatico del bump versione
 *
 * Academic References:
 * - Semantic Versioning 2.0.0 (SemVer)
 * - Conventional Commits specification
 */

import { execSync } from "child_process";
import {
  getCurrentVersion,
  incrementVersion,
  determineVersionType,
  getCommitMessages,
  updateVersionFiles,
} from "./auto-version.js";

function main() {
  try {
    // Ottieni versione corrente
    const currentVersion = getCurrentVersion();

    // Analizza ultimi commit (solo l'ultimo, quello appena fatto)
    const commitMessages = getCommitMessages();

    // Determina tipo di versione
    const versionType = determineVersionType(commitMessages);

    // Calcola nuova versione
    const newVersion = incrementVersion(currentVersion, versionType);

    // Se la versione non è cambiata, esci
    if (currentVersion === newVersion) {
      return 0;
    }

    // Aggiorna file di versione
    const updated = updateVersionFiles(newVersion);

    if (updated > 0) {
      // eslint-disable-next-line no-console
      console.log(`\n📦 Auto-version: ${currentVersion} → ${newVersion} (${versionType})`);
      // eslint-disable-next-line no-console
      console.log(`   Based on commit messages: ${commitMessages.length} commit(s)\n`);

      // Stage e commit automatico
      try {
        execSync("git add sw.js version.json assets/js/version-check.js", { stdio: "inherit" });
        execSync(`git commit -m "chore: bump version to ${newVersion}" --no-verify`, {
          stdio: "inherit",
        });
        // eslint-disable-next-line no-console
        console.log(`\n✅ Version bumped to ${newVersion} and committed automatically\n`);
      } catch (e) {
        console.error("❌ Error committing version bump:", e.message);
        return 1;
      }
    }

    return 0;
  } catch (error) {
    console.error("❌ Error in auto-version-post-commit:", error.message);
    return 1;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main());
}

export { main };
