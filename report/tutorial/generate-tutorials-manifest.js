// /report/tutorial/generate-tutorials-manifest.js
// Script per generare tutorials-manifest.json automaticamente
// Scansiona /report/tutorial/data/ e genera manifest con tutti i tutorial JSON

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TUTORIALS_DATA_DIR = path.join(__dirname, 'data');
const MANIFEST_PATH = path.join(__dirname, 'tutorials-manifest.json');

// ===== SCAN TUTORIALS =====
function scanTutorials() {
  const tutorialFiles = [];
  
  if (!fs.existsSync(TUTORIALS_DATA_DIR)) {
    console.warn('[Generate Tutorials Manifest] Cartella data non trovata:', TUTORIALS_DATA_DIR);
    return tutorialFiles;
  }
  
  const files = fs.readdirSync(TUTORIALS_DATA_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isFile() && dirent.name.endsWith('.json'))
    .map(dirent => dirent.name);
  
  for (const file of files) {
    const filePath = path.join(TUTORIALS_DATA_DIR, file);
    
    try {
      // Verifica che il file JSON sia valido
      const content = fs.readFileSync(filePath, 'utf-8');
      JSON.parse(content);
      
      tutorialFiles.push(file);
      console.log(`[Generate Tutorials Manifest] Tutorial aggiunto: ${file}`);
    } catch (err) {
      console.warn(`[Generate Tutorials Manifest] File JSON non valido ${file}:`, err.message);
    }
  }
  
  // Ordina alfabeticamente
  tutorialFiles.sort();
  
  return tutorialFiles;
}

// ===== GENERATE MANIFEST =====
function generateManifest() {
  console.log('[Generate Tutorials Manifest] Scansione tutorial...');
  const tutorials = scanTutorials();
  
  const manifest = {
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
    tutorials: tutorials,
    total: tutorials.length
  };
  
  // Scrivi tutorials-manifest.json
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  
  console.log(`[Generate Tutorials Manifest] Manifest generato: ${tutorials.length} tutorial`);
  console.log(`[Generate Tutorials Manifest] Salvato in: ${MANIFEST_PATH}`);
  
  return manifest;
}

// ===== MAIN =====
if (import.meta.url === `file://${process.argv[1]}`) {
  generateManifest();
}

export { generateManifest, scanTutorials };

