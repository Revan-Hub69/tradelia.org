// /report/reports/generate-reports-manifest.js
// Script per generare reports-manifest.json automaticamente
// Scansiona /report/reports/ e genera manifest con tutti i report ID

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORTS_DIR = path.join(__dirname);
const MANIFEST_PATH = path.join(__dirname, 'reports-manifest.json');

// ===== SCAN REPORTS =====
function scanReports() {
  const reportIds = [];

  if (!fs.existsSync(REPORTS_DIR)) {
    console.warn('[Generate Reports Manifest] Cartella reports non trovata:', REPORTS_DIR);
    return reportIds;
  }

  const reportDirs = fs
    .readdirSync(REPORTS_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const reportId of reportDirs) {
    const reportPath = path.join(REPORTS_DIR, reportId);
    const headerPath = path.join(reportPath, 'header.json');
    const manifestPath = path.join(reportPath, 'manifest.json');

    // Verifica che esista almeno header.json o manifest.json
    if (!fs.existsSync(headerPath) && !fs.existsSync(manifestPath)) {
      console.warn(
        `[Generate Reports Manifest] header.json o manifest.json non trovati per ${reportId}`
      );
      continue;
    }

    reportIds.push(reportId);
    console.log(`[Generate Reports Manifest] Report aggiunto: ${reportId}`);
  }

  // Ordina alfabeticamente
  reportIds.sort();

  return reportIds;
}

// ===== GENERATE MANIFEST =====
function generateManifest() {
  console.log('[Generate Reports Manifest] Scansione report...');
  const reports = scanReports();

  const manifest = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    reports: reports,
    total: reports.length,
  };

  // Scrivi reports-manifest.json
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log(`[Generate Reports Manifest] Manifest generato: ${reports.length} report`);
  console.log(`[Generate Reports Manifest] Salvato in: ${MANIFEST_PATH}`);

  return manifest;
}

// ===== MAIN =====
if (import.meta.url === `file://${process.argv[1]}`) {
  generateManifest();
}

export { generateManifest, scanReports };
