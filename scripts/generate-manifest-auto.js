// Script per generare automaticamente il manifest
// Eseguire questo script dopo aver aggiunto nuovi report o prima di un commit
import { generateManifest } from '../archivio/generate-manifest.js';

console.log('🔄 Generando manifest.json...');
const manifest = generateManifest();
console.log(`✅ Manifest generato con ${manifest.total_reports} report`);
process.exit(0);
