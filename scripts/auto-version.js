#!/usr/bin/env node
/**
 * Automatic Version Increment on Push
 *
 * Analyzes commit messages to determine version bump type:
 * - [major] or BREAKING: major version bump
 * - [minor] or feat: minor version bump
 * - [patch] or fix: patch version bump (default)
 *
 * Academic References:
 * - Semantic Versioning 2.0.0 (SemVer)
 * - Conventional Commits specification
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { incrementVersion, getCurrentVersion } from "./update-version.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getCommitMessages(limit = 10) {
  try {
    // Get commit messages since last tag, or last N commits if no tag
    const hasTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo ""', {
      encoding: "utf8",
    }).trim();

    if (hasTag) {
      return execSync(`git log ${hasTag}..HEAD --pretty=format:"%s"`, { encoding: "utf8" })
        .split("\n")
        .filter(Boolean);
    } else {
      return execSync(`git log -${limit} --pretty=format:"%s"`, { encoding: "utf8" })
        .split("\n")
        .filter(Boolean);
    }
  } catch {
    return [];
  }
}

function determineVersionType(commitMessages) {
  // Check for major version indicators
  const majorKeywords = ["[major]", "breaking", "BREAKING", "major"];
  const hasMajor = commitMessages.some((msg) =>
    majorKeywords.some((keyword) => msg.toLowerCase().includes(keyword))
  );

  if (hasMajor) {
    return "major";
  }

  // Check for minor version indicators
  const minorKeywords = ["[minor]", "feat:", "feature:", "minor"];
  const hasMinor = commitMessages.some((msg) =>
    minorKeywords.some((keyword) => msg.toLowerCase().includes(keyword))
  );

  if (hasMinor) {
    return "minor";
  }

  // Default to patch
  return "patch";
}

function updateVersionFiles(newVersion) {
  const VERSION_FILES = {
    "sw.js": {
      pattern: /const VERSION = ['"]([\d.]+)['"];?/,
      replace: (version) => `const VERSION = '${version}';`,
    },
    "version.json": {
      pattern: /"version":\s*"([\d.]+)"/,
      replace: (version) => `"version": "${version}"`,
    },
    "assets/js/version-check.js": {
      pattern: /const CURRENT_VERSION = ['"]([\d.]+)['"];?/,
      replace: (version) => `const CURRENT_VERSION = '${version}';`,
    },
  };

  let updated = 0;
  for (const [file, config] of Object.entries(VERSION_FILES)) {
    const fullPath = path.join(__dirname, "..", file);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, "utf8");
      const match = content.match(config.pattern);
      if (match && match[1] !== newVersion) {
        content = content.replace(config.pattern, config.replace(newVersion));
        fs.writeFileSync(fullPath, content, "utf8");
        updated++;
      }
    }
  }

  // Update timestamp
  const versionFile = path.join(__dirname, "..", "version.json");
  if (fs.existsSync(versionFile)) {
    let content = fs.readFileSync(versionFile, "utf8");
    const timestamp = new Date().toISOString();
    content = content.replace(/"timestamp":\s*"[^"]*"/, `"timestamp": "${timestamp}"`);
    fs.writeFileSync(versionFile, content, "utf8");
  }

  return updated;
}

function main() {
  try {
    const currentVersion = getCurrentVersion();
    const commitMessages = getCommitMessages();
    const versionType = determineVersionType(commitMessages);
    const newVersion = incrementVersion(currentVersion, versionType);

    const updated = updateVersionFiles(newVersion);

    if (updated > 0) {
      // eslint-disable-next-line no-console
      console.log(`\n📦 Auto-version: ${currentVersion} → ${newVersion} (${versionType})`);
      // eslint-disable-next-line no-console
      console.log(`   Based on commit messages: ${commitMessages.length} commit(s)\n`);

      // Stage version files (l'utente farà il commit manualmente)
      try {
        execSync("git add sw.js version.json assets/js/version-check.js", { stdio: "inherit" });
        // eslint-disable-next-line no-console
        console.log(
          `\n💡 Version files staged. Remember to commit: git commit -m "chore: bump version to ${newVersion}"`
        );
      } catch {
        // Ignore if git add fails (not in git repo or files not changed)
      }
    }

    return 0;
  } catch (error) {
    console.error("❌ Error in auto-version:", error.message);
    return 1;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main());
}

export { determineVersionType, getCommitMessages, updateVersionFiles, main };
