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

const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { URL } = require('url');

const PORT = 3001;
const REPORTS_DIR = path.join(__dirname, '..', 'reports');

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

    // Endpoint upload
    if (pathname === '/report/admin/upload-chart' && req.method === 'POST') {
      await handleUpload(req, res);
      return;
    }

    // Serve file statici
    if (pathname === '/report/admin/upload-chart.html') {
      const filePath = path.join(__dirname, 'upload-chart.html');
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

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    path: `report/reports/${reportId}/chart-snapshot.png`,
    reportId: reportId
  }));

  console.log(`✅ Screenshot salvato: ${targetPath}`);
}

// Parse multipart form data
function parseMultipart(buffer, boundary) {
  const parts = {};
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const sections = buffer.split(boundaryBuffer);

  for (const section of sections) {
    if (section.length < 10) continue;

    const headerEnd = section.indexOf('\r\n\r\n');
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
      parts[name] = {
        filename: filenameMatch[1],
        contentType: contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream',
        data: body.slice(0, -2) // Rimuovi \r\n finale
      };
    } else {
      // Field
      parts[name] = body.slice(0, -2).toString(); // Rimuovi \r\n finale
    }
  }

  return parts;
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
  console.log(`📊 Dashboard: http://localhost:${PORT}/report/admin/upload-chart.html`);
  console.log(`📁 Reports directory: ${REPORTS_DIR}`);
});

