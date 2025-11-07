// /archivio/generate-manifest.js
// Script per generare manifest.json automaticamente
// Scansiona /report/reports/ e genera manifest con tutti i report

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORTS_DIR = path.join(__dirname, '../report/reports');
const MANIFEST_PATH = path.join(__dirname, 'manifest.json');

// ===== SCAN REPORTS =====
function scanReports() {
  const reports = [];
  
  if (!fs.existsSync(REPORTS_DIR)) {
    console.warn('[Generate Manifest] Cartella reports non trovata:', REPORTS_DIR);
    return reports;
  }
  
  const reportDirs = fs.readdirSync(REPORTS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  for (const reportId of reportDirs) {
    const reportPath = path.join(REPORTS_DIR, reportId);
    const headerPath = path.join(reportPath, 'header.json');
    
    if (!fs.existsSync(headerPath)) {
      console.warn(`[Generate Manifest] header.json non trovato per ${reportId}`);
      continue;
    }
    
    try {
      const headerContent = fs.readFileSync(headerPath, 'utf-8');
      const header = JSON.parse(headerContent);
      
      // Estrai metadati da header.json
      const extractMetric = (key) => {
        if (!header?.rows) return null;
        for (const row of header.rows || []) {
          for (const part of row.parts || []) {
            if (part.kind === 'metric' && part.key === key) {
              return part.value;
            }
          }
        }
        return null;
      };
      
      const ticker = extractMetric('Ticker');
      const company = extractMetric('CompanyName');
      const created_at = header.meta?.created_at || header.meta?.timestamp || new Date().toISOString();
      
      // Calcola public_after (created_at + 24h)
      const createdDate = new Date(created_at);
      const publicAfter = new Date(createdDate.getTime() + 24 * 60 * 60 * 1000); // +24h
      
      // Determina tipo report (Swing Master o Macro Briefing)
      const type = header.meta?.type || (reportId.includes('swing') ? 'swing-master' : 'macro-briefing');
      
      const report = {
        id: reportId,
        ticker: ticker || '—',
        company: company || '—',
        type: type,
        created_at: created_at,
        public_after: publicAfter.toISOString(),
        version: header.meta?.version || extractMetric('Version') || 'Tradelia AI v2.1',
        status: header.meta?.status || 'active',
        path: `/report/reports/${reportId}/`
      };
      
      reports.push(report);
      console.log(`[Generate Manifest] Report aggiunto: ${reportId} - ${ticker || 'N/A'}`);
      
    } catch (err) {
      console.error(`[Generate Manifest] Errore parsing ${reportId}:`, err.message);
    }
  }
  
  // Ordina per data (più recenti prima)
  reports.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB - dateA;
  });
  
  return reports;
}

// ===== GENERATE MANIFEST =====
function generateManifest() {
  console.log('[Generate Manifest] Scansione report...');
  const reports = scanReports();
  
  const manifest = {
    reports: reports,
    generated_at: new Date().toISOString(),
    total_reports: reports.length
  };
  
  // Scrivi manifest.json
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  
  console.log(`[Generate Manifest] Manifest generato: ${reports.length} report`);
  console.log(`[Generate Manifest] Salvato in: ${MANIFEST_PATH}`);
  
  return manifest;
}

// ===== MAIN =====
if (import.meta.url === `file://${process.argv[1]}`) {
  generateManifest();
}

export { generateManifest, scanReports };

