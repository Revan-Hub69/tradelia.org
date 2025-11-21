#!/usr/bin/env node
/**
 * Automatic Version Management Script
 *
 * Updates version across all files based on Semantic Versioning (MAJOR.MINOR.PATCH)
 *
 * Usage:
 *   node scripts/update-version.js patch   # 2.0.0 -> 2.0.1
 *   node scripts/update-version.js minor   # 2.0.0 -> 2.1.0
 *   node scripts/update-version.js major   # 2.0.0 -> 3.0.0
 *
 * Academic References:
 * - Semantic Versioning 2.0.0 (SemVer)
 * - W3C (2023). Service Workers. W3C Working Draft
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VERSION_FILES = {
  'sw.js': {
    pattern: /const VERSION = ['"]([\d.]+)['"];?/,
    replace: (version) => `const VERSION = '${version}';`,
  },
  'version.json': {
    pattern: /"version":\s*"([\d.]+)"/,
    replace: (version) => `"version": "${version}"`,
  },
  'assets/js/version-check.js': {
    pattern: /const CURRENT_VERSION = ['"]([\d.]+)['"];?/,
    replace: (version) => `const CURRENT_VERSION = '${version}';`,
  },
};

function parseVersion(versionString) {
  const parts = versionString.split('.').map(Number);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
    toString() {
      return `${this.major}.${this.minor}.${this.patch}`;
    },
  };
}

function incrementVersion(currentVersion, type) {
  const version = parseVersion(currentVersion);

  switch (type) {
    case 'major':
      version.major++;
      version.minor = 0;
      version.patch = 0;
      break;
    case 'minor':
      version.minor++;
      version.patch = 0;
      break;
    case 'patch':
      version.patch++;
      break;
    default:
      throw new Error(`Invalid version type: ${type}. Use 'major', 'minor', or 'patch'`);
  }

  return version.toString();
}

function getCurrentVersion() {
  const versionFile = path.join(__dirname, '..', 'version.json');
  if (!fs.existsSync(versionFile)) {
    return '2.0.0'; // Default
  }

  const content = fs.readFileSync(versionFile, 'utf8');
  const match = content.match(/"version":\s*"([\d.]+)"/);
  return match ? match[1] : '2.0.0';
}

function updateVersionInFile(filePath, newVersion, config) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const match = content.match(config.pattern);

  if (!match) {
    console.warn(`⚠️  Version pattern not found in ${filePath}`);
    return false;
  }

  const oldVersion = match[1];
  content = content.replace(config.pattern, config.replace(newVersion));
  fs.writeFileSync(fullPath, content, 'utf8');

  console.log(`✅ ${filePath}: ${oldVersion} → ${newVersion}`);
  return true;
}

function updateVersionTimestamp(version) {
  const versionFile = path.join(__dirname, '..', 'version.json');
  if (!fs.existsSync(versionFile)) {
    return;
  }

  let content = fs.readFileSync(versionFile, 'utf8');
  const timestamp = new Date().toISOString();

  // Update timestamp
  content = content.replace(/"timestamp":\s*"[^"]*"/, `"timestamp": "${timestamp}"`);

  fs.writeFileSync(versionFile, content, 'utf8');
  console.log(`✅ Updated timestamp: ${timestamp}`);
}

function main() {
  const type = process.argv[2];

  if (!type || !['major', 'minor', 'patch'].includes(type)) {
    console.error('❌ Usage: node scripts/update-version.js [major|minor|patch]');
    process.exit(1);
  }

  const currentVersion = getCurrentVersion();
  const newVersion = incrementVersion(currentVersion, type);

  console.log(`\n📦 Updating version: ${currentVersion} → ${newVersion} (${type})\n`);

  let successCount = 0;
  for (const [file, config] of Object.entries(VERSION_FILES)) {
    if (updateVersionInFile(file, newVersion, config)) {
      successCount++;
    }
  }

  // Update timestamp in version.json
  updateVersionTimestamp(newVersion);

  console.log(`\n✅ Version updated in ${successCount}/${Object.keys(VERSION_FILES).length} files`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Review changes`);
  console.log(`   2. Commit: git add -A && git commit -m "chore: bump version to ${newVersion}"`);
  console.log(`   3. Push: git push\n`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { incrementVersion, parseVersion, getCurrentVersion };
