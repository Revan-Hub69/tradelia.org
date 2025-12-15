#!/usr/bin/env node

/**
 * Script per correggere errori ricorrenti con ErrorBoundary in Next.js build
 * 
 * Problema: Next.js a volte ha problemi a riconoscere class components come JSX
 * Soluzione: Crea un wrapper funzionale per ErrorBoundary
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Cerca automaticamente file che usano ErrorBoundary
function findFilesWithErrorBoundary(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules, .git, etc.
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...findFilesWithErrorBoundary(fullPath));
      }
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        // Cerca uso diretto di <ErrorBoundary> (non wrapper)
        if (content.includes('<ErrorBoundary>') && !content.includes('ErrorBoundaryWrapper')) {
          files.push(path.relative(rootDir, fullPath));
        }
      } catch (err) {
        // Skip file se non può essere letto
      }
    }
  }
  
  return files;
}

// File da controllare e correggere
let filesToCheck = [
  'components/dashboard/utilities/StrategyBuilder.tsx',
];

// Cerca automaticamente altri file (opzionale, commentato per performance)
// const componentsDir = path.join(rootDir, 'components');
// filesToCheck = [...filesToCheck, ...findFilesWithErrorBoundary(componentsDir)];

function fixErrorBoundaryUsage(filePath) {
  const fullPath = path.join(rootDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File non trovato: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  let modified = false;

  // Verifica se usa ErrorBoundary
  if (!content.includes('ErrorBoundary')) {
    console.log(`✓ ${filePath}: Non usa ErrorBoundary, skip`);
    return false;
  }

  // Verifica se ha già il wrapper funzionale
  if (content.includes('const ErrorBoundaryWrapper')) {
    console.log(`✓ ${filePath}: Ha già il wrapper, skip`);
    return false;
  }

  // Cerca l'import di ErrorBoundary
  const importPattern = /import\s+{\s*ErrorBoundary\s*}\s+from\s+['"]@\/components\/errors\/ErrorBoundary['"];?/;
  
  if (!importPattern.test(content)) {
    console.log(`⚠️  ${filePath}: Import di ErrorBoundary non trovato nel formato atteso`);
    return false;
  }

  // Aggiungi wrapper funzionale dopo l'import
  const wrapperCode = `
// Wrapper funzionale per ErrorBoundary (class component)
const ErrorBoundaryWrapper = ({ children }: { children: React.ReactNode }) => {
  return <ErrorBoundary>{children}</ErrorBoundary>;
};
`;

  // Trova la posizione dopo l'ultimo import
  const importLines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < importLines.length; i++) {
    if (importLines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    } else if (lastImportIndex !== -1 && importLines[i].trim() === '') {
      // Trovato spazio vuoto dopo gli import
      break;
    }
  }

  if (lastImportIndex === -1) {
    console.log(`⚠️  ${filePath}: Non riesco a trovare dove inserire il wrapper`);
    return false;
  }

  // Inserisci il wrapper dopo gli import
  const insertIndex = lastImportIndex + 1;
  importLines.splice(insertIndex, 0, wrapperCode.trim());
  content = importLines.join('\n');

  // Sostituisci <ErrorBoundary> con <ErrorBoundaryWrapper>
  content = content.replace(/<ErrorBoundary>/g, '<ErrorBoundaryWrapper>');
  content = content.replace(/<\/ErrorBoundary>/g, '</ErrorBoundaryWrapper>');

  // Scrivi il file modificato
  fs.writeFileSync(fullPath, content, 'utf-8');
  modified = true;
  console.log(`✓ ${filePath}: Corretto - aggiunto wrapper funzionale`);

  return modified;
}

// Esegui correzioni
console.log('🔧 Correzione ErrorBoundary in corso...\n');

let totalFixed = 0;
for (const file of filesToCheck) {
  if (fixErrorBoundaryUsage(file)) {
    totalFixed++;
  }
}

console.log(`\n✅ Completato: ${totalFixed} file corretti`);
