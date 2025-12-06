#!/usr/bin/env node
/**
 * Script per analizzare l'uso di i18n nel progetto
 * Identifica tutti i file che usano i18n e li categorizza
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const i18nPatterns = [
  /useTranslations/,
  /getDictionary/,
  /buildLocalePath/,
  /getApiMessages/,
  /getLocaleFromRequest/,
  /detectLocaleFromRequest/,
  /getLocalizedField/,
  /getLocalizedTitle/,
  /getLocalizedDescription/,
  /localizeContentArray/,
  /locale\s*===\s*['"]en['"]/,
  /locale\s*!==\s*['"]en['"]/,
  /localePrefix/,
  /LanguageSwitch/,
  /HtmlLang/,
  /HreflangTags/,
  /InitialLanguageSelector/,
];

const categories = {
  'lib/i18n': [],
  'app/routes': [],
  'app/api': [],
  'components': [],
  'other': [],
};

function scanDirectory(dir, relativePath = '') {
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const relPath = join(relativePath, entry);
    
    // Skip node_modules, .git, .next, etc.
    if (entry.startsWith('.') || entry === 'node_modules' || entry === '.next' || entry === 'dist') {
      continue;
    }
    
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath, relPath);
    } else if (stat.isFile() && ['.ts', '.tsx', '.js', '.jsx'].includes(extname(entry))) {
      try {
        const content = readFileSync(fullPath, 'utf-8');
        const matches = i18nPatterns.filter(pattern => pattern.test(content));
        
        if (matches.length > 0) {
          const category = getCategory(relPath);
          categories[category].push({
            file: relPath,
            patterns: matches.map(p => p.toString()),
            lineCount: content.split('\n').length,
          });
        }
      } catch (err) {
        // Skip files that can't be read
      }
    }
  }
}

function getCategory(filePath) {
  if (filePath.startsWith('lib/i18n/')) {
    return 'lib/i18n';
  }
  if (filePath.startsWith('app/') && filePath.includes('/api/')) {
    return 'app/api';
  }
  if (filePath.startsWith('app/')) {
    return 'app/routes';
  }
  if (filePath.startsWith('components/')) {
    return 'components';
  }
  return 'other';
}

// Scan project
console.log('🔍 Scanning project for i18n usage...\n');
scanDirectory(projectRoot);

// Print results
console.log('📊 Results:\n');
for (const [category, files] of Object.entries(categories)) {
  if (files.length > 0) {
    console.log(`\n${category.toUpperCase()} (${files.length} files):`);
    files.forEach(({ file, patterns }) => {
      console.log(`  - ${file}`);
      console.log(`    Patterns: ${patterns.slice(0, 3).join(', ')}${patterns.length > 3 ? '...' : ''}`);
    });
  }
}

const total = Object.values(categories).reduce((sum, arr) => sum + arr.length, 0);
console.log(`\n✅ Total files with i18n usage: ${total}`);
