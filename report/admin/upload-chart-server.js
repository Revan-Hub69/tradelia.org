#!/usr/bin/env node
/**
 * Server per upload chart screenshot
 * Avvia un server HTTP semplice per gestire l'upload degli screenshot
 * 
 * Uso:
 *   node report/admin/upload-chart-server.js
 * 
 * Poi apri: http://localhost:3001/report/admin/upload-chart.html
 */

import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { URL } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateManifest } from '../../archivio/generate-manifest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execAsync = promisify(exec);

const PORT = 3001;
const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const PROJECT_ROOT = path.join(__dirname, '..', '..'); // Root del progetto per Git
const AUTO_PUSH_TO_GITHUB = true; // Abilita/disabilita push automatico
const AUTO_REGENERATE_MANIFEST = true; // Abilita/disabilita rigenerazione automatica manifest

// Mappatura moduli
const MODULE_FILES = {
  'F1B': 'f1b.json',
  'F2': 'f2.json',
  'F3': 'f3.json',
  'F3O': 'f3o.json',
  'F4': 'f4.json',
  'F5': 'f5.json',
  'F5B': 'f5b.json',
  'F5-LT+': 'f5-lt+.json'
};

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

// Server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Endpoint API: lista report
    if (pathname === '/report/admin/api/reports' && req.method === 'GET') {
      await handleListReports(req, res);
      return;
    }

    // Endpoint API: lista file report
    if (pathname === '/report/admin/api/report-files' && req.method === 'GET') {
      await handleListReportFiles(req, res);
      return;
    }

    // Endpoint API: rigenera manifest
    if (pathname === '/report/admin/api/regenerate-manifest' && req.method === 'POST') {
      await handleRegenerateManifest(req, res);
      return;
    }

    // Endpoint API: crea nuovo report
    if (pathname === '/report/admin/api/create-report' && req.method === 'POST') {
      await handleCreateReport(req, res);
      return;
    }

    // Endpoint API: upload JSON modulo
    if (pathname === '/report/admin/api/upload-module-json' && req.method === 'POST') {
      await handleUploadModuleJson(req, res);
      return;
    }

    // Endpoint API: upload screenshot modulo
    if (pathname === '/report/admin/api/upload-module-screenshot' && req.method === 'POST') {
      await handleUploadModuleScreenshot(req, res);
      return;
    }

    // Endpoint upload (legacy - chart snapshot)
    if (pathname === '/report/admin/upload-chart' && req.method === 'POST') {
      await handleUpload(req, res);
      return;
    }

    // Serve file statici report (JSON e immagini) - solo se non è una richiesta API
    if (pathname.startsWith('/report/reports/') && !pathname.startsWith('/report/admin/')) {
      // Serve chart snapshot
      if (pathname.endsWith('/chart-snapshot.png')) {
        const reportPath = pathname.replace('/report/reports/', '').replace('/chart-snapshot.png', '');
        const filePath = path.join(REPORTS_DIR, reportPath, 'chart-snapshot.png');
        await serveFile(res, filePath, 'image/png');
        return;
      }
      
      // Serve module JSON files
      if (pathname.endsWith('.json')) {
        const parts = pathname.replace('/report/reports/', '').split('/');
        if (parts.length === 2) {
          const [reportId, jsonFile] = parts;
          const filePath = path.join(REPORTS_DIR, reportId, jsonFile);
          await serveFile(res, filePath, 'application/json');
          return;
        }
      }
      
      // Serve module screenshot images
      if (pathname.includes('-screenshot.png')) {
        const parts = pathname.replace('/report/reports/', '').split('/');
        if (parts.length === 2) {
          const [reportId, screenshotFile] = parts;
          const filePath = path.join(REPORTS_DIR, reportId, screenshotFile);
          await serveFile(res, filePath, 'image/png');
          return;
        }
      }
    }

    // Serve file statici
    if (pathname === '/report/admin/upload-chart.html') {
      const filePath = path.join(__dirname, 'upload-chart.html');
      await serveFile(res, filePath, 'text/html');
      return;
    }

    if (pathname === '/report/admin/dashboard.html') {
      const filePath = path.join(__dirname, 'dashboard.html');
      await serveFile(res, filePath, 'text/html');
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

// Gestione upload
async function handleUpload(req, res) {
  const chunks = [];
  let totalSize = 0;
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  // Leggi i dati
  for await (const chunk of req) {
    chunks.push(chunk);
    totalSize += chunk.length;
    if (totalSize > MAX_SIZE) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'File troppo grande (max 10MB)' }));
      return;
    }
  }

  const buffer = Buffer.concat(chunks);
  const boundary = req.headers['content-type']?.split('boundary=')[1];

  if (!boundary) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Content-Type non valido' }));
    return;
  }

  // Parse multipart
  const parts = parseMultipart(buffer, boundary);
  const reportId = parts.reportId?.toString().trim();
  const file = parts.file;

  if (!reportId) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Report ID mancante' }));
    return;
  }

  if (!file) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'File mancante' }));
    return;
  }

  // Valida reportId (solo caratteri sicuri)
  if (!/^[a-zA-Z0-9_-]+$/.test(reportId)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Report ID non valido' }));
    return;
  }

  // Crea directory report
  const reportDir = path.join(REPORTS_DIR, reportId);
  try {
    await fs.mkdir(reportDir, { recursive: true });
  } catch (error) {
    console.error('Error creating directory:', error);
  }

  // Salva file
  const targetPath = path.join(reportDir, 'chart-snapshot.png');
  await fs.writeFile(targetPath, file.data);

  console.log(`✅ Screenshot salvato: ${targetPath}`);

  // Rigenera manifest automaticamente se abilitato
  let manifestResult = null;
  if (AUTO_REGENERATE_MANIFEST) {
    try {
      generateManifest();
      manifestResult = { success: true, message: 'Manifest rigenerato' };
      console.log(`✅ Manifest rigenerato`);
    } catch (error) {
      console.error('❌ Errore rigenerazione manifest:', error.message);
      manifestResult = { success: false, error: error.message };
    }
  }

  // Push automatico su GitHub se abilitato
  let gitResult = null;
  if (AUTO_PUSH_TO_GITHUB) {
    try {
      gitResult = await pushToGitHub(reportId, targetPath);
      console.log(`✅ Push GitHub: ${gitResult.success ? 'OK' : 'Errore'}`);
    } catch (error) {
      console.error('❌ Errore push GitHub:', error.message);
      gitResult = { success: false, error: error.message };
    }
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    path: `report/reports/${reportId}/chart-snapshot.png`,
    reportId: reportId,
    git: gitResult,
    manifest: manifestResult
  }));
}

// Parse multipart form data
function parseMultipart(buffer, boundary) {
  const parts = {};
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const sections = [];
  
  // Dividi il buffer usando indexOf invece di split (che non esiste per Buffer)
  let start = 0;
  while (true) {
    const index = buffer.indexOf(boundaryBuffer, start);
    if (index === -1) break;
    
    if (start < index) {
      sections.push(buffer.slice(start, index));
    }
    start = index + boundaryBuffer.length;
  }
  
  // Aggiungi l'ultima sezione se c'è
  if (start < buffer.length) {
    sections.push(buffer.slice(start));
  }

  for (const section of sections) {
    if (section.length < 10) continue;

    const headerEnd = section.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd === -1) continue;

    const headers = section.slice(0, headerEnd).toString();
    const body = section.slice(headerEnd + 4);

    // Parse headers
    const nameMatch = headers.match(/name="([^"]+)"/);
    if (!nameMatch) continue;

    const name = nameMatch[1];

    // File
    const filenameMatch = headers.match(/filename="([^"]+)"/);
    if (filenameMatch) {
      const contentTypeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/);
      // Rimuovi \r\n finale se presente
      let data = body;
      if (data.length >= 2 && data[data.length - 2] === 0x0D && data[data.length - 1] === 0x0A) {
        data = data.slice(0, -2);
      }
      
      parts[name] = {
        filename: filenameMatch[1],
        contentType: contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream',
        data: data
      };
    } else {
      // Field
      let fieldData = body;
      // Rimuovi \r\n finale se presente
      if (fieldData.length >= 2 && fieldData[fieldData.length - 2] === 0x0D && fieldData[fieldData.length - 1] === 0x0A) {
        fieldData = fieldData.slice(0, -2);
      }
      parts[name] = fieldData.toString();
    }
  }

  return parts;
}

// Rigenera manifest
async function handleRegenerateManifest(req, res) {
  try {
    generateManifest();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true, 
      message: 'Manifest rigenerato con successo',
      timestamp: new Date().toISOString()
    }));
    console.log('[API] Manifest rigenerato manualmente');
  } catch (error) {
    console.error('[API] Errore rigenerazione manifest:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: false, 
      error: error.message 
    }));
  }
}

// Lista file in un report
async function handleListReportFiles(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const reportId = url.searchParams.get('reportId');
    
    if (!reportId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Report ID mancante' }));
      return;
    }
    
    const reportDir = path.join(REPORTS_DIR, reportId);
    
    try {
      const entries = await fs.readdir(reportDir, { withFileTypes: true });
      const files = entries
        .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
        .map(entry => entry.name);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ files: files }));
    } catch (error) {
      // Directory non esiste o errore lettura
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ files: [] }));
    }
  } catch (error) {
    console.error('Error listing report files:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

// Lista report con info screenshot
async function handleListReports(req, res) {
  try {
    const reports = [];
    
    if (!await fs.access(REPORTS_DIR).then(() => true).catch(() => false)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ reports: [] }));
      return;
    }

    const entries = await fs.readdir(REPORTS_DIR, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      
      const reportId = entry.name;
      const reportDir = path.join(REPORTS_DIR, reportId);
      const screenshotPath = path.join(reportDir, 'chart-snapshot.png');
      const headerPath = path.join(reportDir, 'header.json');
      const manifestPath = path.join(reportDir, 'manifest.json');
      
      let ticker = null;
      let hasScreenshot = false;
      
      // Verifica screenshot
      try {
        await fs.access(screenshotPath);
        hasScreenshot = true;
      } catch {
        hasScreenshot = false;
      }
      
      // Leggi ticker da header.json (priorità 1)
      try {
        const headerContent = await fs.readFile(headerPath, 'utf-8');
        const header = JSON.parse(headerContent);
        
        // Cerca ticker nei rows
        if (header.rows && Array.isArray(header.rows)) {
          for (const row of header.rows) {
            if (row.parts && Array.isArray(row.parts)) {
              for (const part of row.parts) {
                if (part.key === 'Ticker' && part.value) {
                  ticker = part.value;
                  break;
                }
              }
            }
            if (ticker) break;
          }
        }
      } catch {
        // Ignora errori di lettura header
      }
      
      // Fallback: leggi ticker da manifest.json se non trovato in header
      if (!ticker) {
        try {
          const manifestContent = await fs.readFile(manifestPath, 'utf-8');
          const manifest = JSON.parse(manifestContent);
          if (manifest.metadata && manifest.metadata.ticker) {
            ticker = manifest.metadata.ticker;
          } else if (manifest.ticker) {
            ticker = manifest.ticker;
          }
        } catch {
          // Ignora errori di lettura manifest
        }
      }
      
      reports.push({
        id: reportId,
        ticker: ticker,
        hasScreenshot: hasScreenshot
      });
    }
    
    console.log(`[API Reports] Trovati ${reports.length} report:`, reports.map(r => r.id).join(', '));
    
    // Ordina per ID
    reports.sort((a, b) => a.id.localeCompare(b.id));
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ reports: reports }));
  } catch (error) {
    console.error('Error listing reports:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

// Push automatico su GitHub
async function pushToGitHub(reportId, filePath) {
  try {
    // Verifica se siamo in un repository Git
    try {
      await execAsync('git rev-parse --git-dir', { cwd: PROJECT_ROOT });
    } catch {
      return { success: false, error: 'Non è un repository Git' };
    }

    // Aggiungi solo il file screenshot (usa path relativo)
    const relativePath = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');
    
    // Escape path per Windows
    const escapedPath = relativePath.replace(/"/g, '\\"');
    
    try {
      await execAsync(`git add "${escapedPath}"`, { 
        cwd: PROJECT_ROOT,
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });
    } catch (error) {
      return { success: false, error: `Errore git add: ${error.message}` };
    }

    // Commit
    const commitMessage = `chore: aggiorna screenshot chart per report ${reportId}`;
    const escapedMessage = commitMessage.replace(/"/g, '\\"');
    
    try {
      await execAsync(`git commit -m "${escapedMessage}"`, { 
        cwd: PROJECT_ROOT,
        maxBuffer: 10 * 1024 * 1024
      });
    } catch (error) {
      // Se non ci sono modifiche, il commit fallisce - è ok
      if (error.message.includes('nothing to commit') || error.message.includes('no changes')) {
        return { success: true, message: 'Nessuna modifica da committare' };
      }
      return { success: false, error: `Errore commit: ${error.message}` };
    }

    // Ottieni branch corrente
    let currentBranch = 'main';
    try {
      const { stdout: branch } = await execAsync('git branch --show-current', { 
        cwd: PROJECT_ROOT,
        maxBuffer: 1024 * 1024
      });
      currentBranch = branch.trim() || 'main';
    } catch {
      // Usa default 'main' se non riesce a ottenere il branch
    }

    // Push
    try {
      await execAsync(`git push origin ${currentBranch}`, { 
        cwd: PROJECT_ROOT,
        maxBuffer: 10 * 1024 * 1024
      });
    } catch (error) {
      return { 
        success: false, 
        error: `Errore push: ${error.message}`,
        branch: currentBranch
      };
    }

    return {
      success: true,
      branch: currentBranch,
      commit: commitMessage,
      path: relativePath
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Errore push GitHub'
    };
  }
}

// Crea nuovo report
async function handleCreateReport(req, res) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  
  try {
    const body = JSON.parse(Buffer.concat(chunks).toString());
    const { reportId, reportType } = body;
    
    if (!reportId || !reportType) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Report ID e Tipo Report sono obbligatori' }));
      return;
    }
    
    // Valida reportId
    if (!/^[a-zA-Z0-9_-]+$/.test(reportId)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Report ID non valido' }));
      return;
    }
    
    const reportDir = path.join(REPORTS_DIR, reportId);
    
    // Verifica se esiste già
    try {
      await fs.access(reportDir);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Report già esistente' }));
      return;
    } catch {
      // OK, non esiste
    }
    
    // Crea directory (i file JSON verranno caricati direttamente dall'output)
    await fs.mkdir(reportDir, { recursive: true });
    
    console.log(`✅ Directory report creata: ${reportId}`);
    console.log(`   I file JSON (header.json, f1b.json, ecc.) verranno caricati direttamente dall'output`);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      reportId: reportId,
      path: `report/reports/${reportId}/`
    }));
  } catch (error) {
    console.error('Error creating report:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

// Upload JSON modulo
async function handleUploadModuleJson(req, res) {
  const chunks = [];
  let totalSize = 0;
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  for await (const chunk of req) {
    chunks.push(chunk);
    totalSize += chunk.length;
    if (totalSize > MAX_SIZE) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'File troppo grande (max 10MB)' }));
      return;
    }
  }

  const buffer = Buffer.concat(chunks);
  const boundary = req.headers['content-type']?.split('boundary=')[1];

  if (!boundary) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Content-Type non valido' }));
    return;
  }

  const parts = parseMultipart(buffer, boundary);
  const reportId = parts.reportId?.toString().trim();
  const file = parts.file;
  const fileName = parts.fileName?.toString().trim() || file.filename;

  if (!reportId || !file) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Parametri mancanti' }));
    return;
  }

  // Valida reportId
  if (!/^[a-zA-Z0-9_-]+$/.test(reportId)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Report ID non valido' }));
    return;
  }

  // Valida fileName (solo caratteri sicuri)
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '');
  if (!safeFileName || !safeFileName.endsWith('.json')) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Nome file non valido (deve essere .json)' }));
    return;
  }

  const reportDir = path.join(REPORTS_DIR, reportId);
  const targetPath = path.join(reportDir, safeFileName);

  // Crea directory se non esiste
  try {
    await fs.mkdir(reportDir, { recursive: true });
  } catch (error) {
    console.error('Error creating directory:', error);
  }

  // Valida JSON
  try {
    JSON.parse(file.data.toString());
  } catch (error) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'File JSON non valido' }));
    return;
  }

  // Salva file
  await fs.writeFile(targetPath, file.data, 'utf-8');

  console.log(`✅ JSON salvato: ${targetPath}`);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    path: `report/reports/${reportId}/${safeFileName}`,
    reportId: reportId,
    fileName: safeFileName
  }));
}

// Upload screenshot modulo
async function handleUploadModuleScreenshot(req, res) {
  const chunks = [];
  let totalSize = 0;
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  for await (const chunk of req) {
    chunks.push(chunk);
    totalSize += chunk.length;
    if (totalSize > MAX_SIZE) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'File troppo grande (max 10MB)' }));
      return;
    }
  }

  const buffer = Buffer.concat(chunks);
  const boundary = req.headers['content-type']?.split('boundary=')[1];

  if (!boundary) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Content-Type non valido' }));
    return;
  }

  const parts = parseMultipart(buffer, boundary);
  const reportId = parts.reportId?.toString().trim();
  const moduleId = parts.moduleId?.toString().trim();
  const file = parts.file;

  if (!reportId || !moduleId || !file) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Parametri mancanti' }));
    return;
  }

  // Valida reportId e moduleId
  if (!/^[a-zA-Z0-9_-]+$/.test(reportId) || !/^[a-zA-Z0-9_-]+$/.test(moduleId)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'ID non validi' }));
    return;
  }

  const reportDir = path.join(REPORTS_DIR, reportId);
  const screenshotFile = `${moduleId.toLowerCase()}-screenshot.png`;
  const targetPath = path.join(reportDir, screenshotFile);

  // Crea directory se non esiste
  try {
    await fs.mkdir(reportDir, { recursive: true });
  } catch (error) {
    console.error('Error creating directory:', error);
  }

  // Salva file
  await fs.writeFile(targetPath, file.data);

  console.log(`✅ Screenshot modulo salvato: ${targetPath}`);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    path: `report/reports/${reportId}/${screenshotFile}`,
    reportId: reportId,
    moduleId: moduleId
  }));
}

// Serve file statico
async function serveFile(res, filePath, contentType) {
  try {
    const content = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File Not Found');
  }
}

// Avvia server
server.listen(PORT, () => {
  console.log(`🚀 Server upload chart avviato su http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/report/admin/dashboard.html`);
  console.log(`📊 Upload semplice: http://localhost:${PORT}/report/admin/upload-chart.html`);
  console.log(`📁 Reports directory: ${REPORTS_DIR}`);
  console.log(`🌐 Push GitHub: ${AUTO_PUSH_TO_GITHUB ? '✅ Abilitato' : '❌ Disabilitato'}`);
  console.log(`📋 Rigenerazione Manifest: ${AUTO_REGENERATE_MANIFEST ? '✅ Abilitato' : '❌ Disabilitato'}`);
  if (AUTO_PUSH_TO_GITHUB) {
    console.log(`   Branch: ${process.env.GIT_BRANCH || 'auto-detect'}`);
  }
});

