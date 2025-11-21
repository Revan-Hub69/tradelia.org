// Script per configurare git hooks (opzionale)
// Esegui questo script una volta per configurare gli hook automatici
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hooksDir = path.join(__dirname, '..', '.git', 'hooks');
const preCommitHook = path.join(hooksDir, 'pre-commit');
const postMergeHook = path.join(hooksDir, 'post-merge');

const preCommitContent = `#!/bin/sh
# Auto-generated hook per generare manifest.json
node ${path.join(__dirname, '..', 'archivio', 'generate-manifest.js').replace(/\\/g, '/')}
git add archivio/manifest.json
`;

const postMergeContent = `#!/bin/sh
# Auto-generated hook per rigenerare manifest.json dopo merge
node ${path.join(__dirname, '..', 'archivio', 'generate-manifest.js').replace(/\\/g, '/')}
`;

try {
  // Verifica se .git è una directory (non un file worktree)
  const gitPath = path.join(__dirname, '..', '.git');
  const gitStat = fs.statSync(gitPath);

  if (!gitStat.isDirectory()) {
    console.log('⚠️  .git è un file (worktree), non è possibile creare hook automatici');
    console.log('📝 Esegui manualmente: npm run generate-manifest');
    process.exit(0);
  }

  // Crea directory hooks se non esiste
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  // Crea pre-commit hook
  fs.writeFileSync(preCommitHook, preCommitContent, 'utf-8');
  fs.chmodSync(preCommitHook, '755');
  console.log('✅ Pre-commit hook creato');

  // Crea post-merge hook
  fs.writeFileSync(postMergeHook, postMergeContent, 'utf-8');
  fs.chmodSync(postMergeHook, '755');
  console.log('✅ Post-merge hook creato');

  console.log('🎉 Hooks configurati con successo!');
} catch (error) {
  console.error('❌ Errore durante la configurazione degli hook:', error.message);
  console.log('📝 Esegui manualmente: npm run generate-manifest');
  process.exit(1);
}
