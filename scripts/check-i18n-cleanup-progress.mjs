#!/usr/bin/env node
/**
 * Script per verificare i progressi della pulizia i18n
 * Mostra quanti file rimangono da correggere per categoria
 */

import { readFileSync } from 'fs';
import { execSync } from 'child_process';

const categories = {
  'lib/i18n': {
    files: [
      'lib/i18n/use-translations.ts',
      'lib/i18n/dictionaries.ts',
      'lib/i18n/paths.ts',
      'lib/i18n/api-messages.ts',
      'lib/i18n/dynamic-content.ts',
    ],
    check: (content) => {
      // Verifica se è un wrapper minimalista
      const isSimplified = 
        content.includes('always return') ||
        content.includes('Simplified') ||
        content.includes('Maintained for API compatibility');
      return isSimplified;
    }
  },
  'components/ui': {
    files: [
      'components/layout/LanguageToggle.tsx',
      'components/layout/HtmlLang.tsx',
      'components/layout/HreflangTags.tsx',
      'components/layout/InitialLanguageSelector.tsx',
      'components/ui/LanguageSwitch.tsx',
    ],
    check: (content) => {
      // Verifica se il file esiste ancora
      return false; // Se esiste, non è stato rimosso
    }
  },
  'app/layout': {
    files: [
      'app/layout.tsx',
    ],
    check: (content) => {
      // Verifica se i componenti i18n sono stati rimossi
      return !content.includes('LanguageSwitch') &&
             !content.includes('HtmlLang') &&
             !content.includes('HreflangTags') &&
             !content.includes('InitialLanguageSelector');
    }
  },
};

function checkFile(filePath, checkFn) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return checkFn(content);
  } catch (err) {
    // File non esiste = rimosso = ✅
    return true;
  }
}

function countRemainingFiles() {
  try {
    const result = execSync('node scripts/analyze-i18n-usage.mjs', { encoding: 'utf-8' });
    const lines = result.split('\n');
    const totalLine = lines.find(line => line.includes('Total files'));
    if (totalLine) {
      const match = totalLine.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    }
  } catch (err) {
    return -1;
  }
  return -1;
}

console.log('📊 Progresso Pulizia i18n\n');
console.log('='.repeat(50));

let totalDone = 0;
let totalFiles = 0;

for (const [category, config] of Object.entries(categories)) {
  console.log(`\n${category.toUpperCase()}:`);
  let done = 0;
  
  for (const file of config.files) {
    totalFiles++;
    const isDone = checkFile(file, config.check);
    if (isDone) {
      console.log(`  ✅ ${file}`);
      done++;
      totalDone++;
    } else {
      console.log(`  ⏳ ${file}`);
    }
  }
  
  const percentage = ((done / config.files.length) * 100).toFixed(0);
  console.log(`  Progresso: ${done}/${config.files.length} (${percentage}%)`);
}

const remaining = countRemainingFiles();
if (remaining >= 0) {
  console.log(`\n📈 File totali con i18n rimanenti: ${remaining}`);
}

const overallPercentage = ((totalDone / totalFiles) * 100).toFixed(0);
console.log(`\n🎯 Progresso Generale: ${totalDone}/${totalFiles} (${overallPercentage}%)`);
