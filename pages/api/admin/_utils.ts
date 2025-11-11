import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import fsSync from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { pathToFileURL } from 'url';

const execAsync = promisify(exec);

export const PROJECT_ROOT = process.cwd();
export const REPORTS_DIR = path.join(PROJECT_ROOT, 'report', 'reports');
const AUTO_PUSH_TO_GITHUB = process.env.ADMIN_AUTO_PUSH === 'true';
const AUTO_REGENERATE_MANIFEST = process.env.ADMIN_AUTO_MANIFEST !== 'false';
const ADMIN_TOKEN = process.env.ADMIN_DASHBOARD_TOKEN || '';

export function getAuthToken(req: NextApiRequest): string | undefined {
  const headerAuth = req.headers['authorization'];
  if (typeof headerAuth === 'string' && headerAuth.startsWith('Bearer ')) {
    return headerAuth.slice('Bearer '.length).trim();
  }
  const tokenHeader = req.headers['x-admin-token'];
  if (typeof tokenHeader === 'string') {
    return tokenHeader.trim();
  }
  if (Array.isArray(tokenHeader) && tokenHeader.length > 0) {
    return tokenHeader[0]?.trim();
  }
  return undefined;
}

export function requireAdminAuth(req: NextApiRequest, res: NextApiResponse): boolean {
  if (!ADMIN_TOKEN) {
    // Se non è configurato un token, permetti l'accesso (es: ambiente locale)
    return true;
  }
  const token = getAuthToken(req);
  if (!token || token !== ADMIN_TOKEN) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

export async function ensureReportDirectory(reportId: string): Promise<string> {
  const reportDir = path.join(REPORTS_DIR, sanitizeReportId(reportId));
  await fs.mkdir(reportDir, { recursive: true });
  return reportDir;
}

export function sanitizeReportId(reportId: string): string {
  return reportId.replace(/[^a-zA-Z0-9_-]/g, '');
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readJSON<T = any>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export type ParsedMultipart = Record<string, string | { filename?: string; contentType?: string; data: Buffer }>;

export async function parseMultipartRequest(req: NextApiRequest): Promise<ParsedMultipart> {
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('multipart/form-data')) {
    throw new Error('Content-Type non valido');
  }
  const boundaryMatch = contentType.match(/boundary=([^;]+)/i);
  if (!boundaryMatch) {
    throw new Error('Boundary non trovato');
  }
  const boundary = boundaryMatch[1];

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const buffer = Buffer.concat(chunks);
  return parseMultipart(buffer, boundary);
}

function parseMultipart(buffer: Buffer, boundary: string): ParsedMultipart {
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const result: ParsedMultipart = {};

  let start = buffer.indexOf(boundaryBuffer) + boundaryBuffer.length;
  while (start >= boundaryBuffer.length && start < buffer.length) {
    // Skip CRLF
    if (buffer[start] === 0x0d && buffer[start + 1] === 0x0a) {
      start += 2;
    }

    const end = buffer.indexOf(boundaryBuffer, start);
    if (end === -1) break;

    const section = buffer.slice(start, end);
    const headerEnd = section.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd === -1) {
      start = end + boundaryBuffer.length;
      continue;
    }

    const header = section.slice(0, headerEnd).toString();
    let body = section.slice(headerEnd + 4);

    // Remove trailing CRLF
    if (body.length >= 2 && body[body.length - 2] === 0x0d && body[body.length - 1] === 0x0a) {
      body = body.slice(0, -2);
    }

    const nameMatch = header.match(/name="([^"]+)"/);
    if (!nameMatch) {
      start = end + boundaryBuffer.length;
      continue;
    }
    const fieldName = nameMatch[1];

    const filenameMatch = header.match(/filename="([^"]*)"/);
    if (filenameMatch) {
      const contentTypeMatch = header.match(/Content-Type:\s*([^\r\n]+)/i);
      result[fieldName] = {
        filename: filenameMatch[1],
        contentType: contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream',
        data: body
      };
    } else {
      result[fieldName] = body.toString();
    }

    start = end + boundaryBuffer.length;
  }

  return result;
}

export async function generateReportsManifest(): Promise<{ success: boolean; manifest?: any; error?: string }> {
  if (!AUTO_REGENERATE_MANIFEST) {
    return { success: false, error: 'Rigenerazione automatica disabilitata' };
  }
  try {
    const modulePath = path.join(PROJECT_ROOT, 'report', 'reports', 'generate-reports-manifest.js');
    const url = pathToFileURL(modulePath).href;
    const manifestModule = await import(url);
    const manifest = await manifestModule.generateManifest();
    return { success: true, manifest };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Errore generazione manifest' };
  }
}

export async function pushToGit(reportId: string, filePath: string): Promise<{ success: boolean; [key: string]: any }> {
  if (!AUTO_PUSH_TO_GITHUB) {
    return { success: false, error: 'Push automatico disabilitato' };
  }

  try {
    await execAsync('git rev-parse --git-dir', { cwd: PROJECT_ROOT });
  } catch {
    return { success: false, error: 'Non è un repository Git' };
  }

  const relativePath = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');
  const escapedPath = relativePath.replace(/"/g, '\\"');

  try {
    await execAsync(`git add "${escapedPath}"`, { cwd: PROJECT_ROOT, maxBuffer: 10 * 1024 * 1024 });
  } catch (error: any) {
    return { success: false, error: `Errore git add: ${error?.message}` };
  }

  const commitMessage = `chore: aggiorna screenshot chart per report ${reportId}`;
  const escapedMessage = commitMessage.replace(/"/g, '\\"');

  try {
    await execAsync(`git commit -m "${escapedMessage}"`, { cwd: PROJECT_ROOT, maxBuffer: 10 * 1024 * 1024 });
  } catch (error: any) {
    if (error?.message?.includes('nothing to commit') || error?.message?.includes('no changes')) {
      return { success: true, message: 'Nessuna modifica da committare' };
    }
    return { success: false, error: `Errore commit: ${error?.message}` };
  }

  let currentBranch = 'main';
  try {
    const { stdout } = await execAsync('git branch --show-current', { cwd: PROJECT_ROOT, maxBuffer: 1024 * 1024 });
    currentBranch = stdout.trim() || 'main';
  } catch {
    // usa default
  }

  try {
    await execAsync(`git push origin ${currentBranch}`, { cwd: PROJECT_ROOT, maxBuffer: 10 * 1024 * 1024 });
    return { success: true, branch: currentBranch, commit: commitMessage, path: relativePath };
  } catch (error: any) {
    return { success: false, error: `Errore push: ${error?.message}`, branch: currentBranch };
  }
}

export async function listReports(): Promise<Array<{ id: string; ticker: string | null; hasScreenshot: boolean }>> {
  const reports: Array<{ id: string; ticker: string | null; hasScreenshot: boolean }> = [];

  if (!fsSync.existsSync(REPORTS_DIR)) {
    return reports;
  }

  const directories = fsSync.readdirSync(REPORTS_DIR, { withFileTypes: true }).filter(d => d.isDirectory());

  for (const dirent of directories) {
    const reportId = dirent.name;
    const reportDir = path.join(REPORTS_DIR, reportId);
    const screenshotPath = path.join(reportDir, 'chart-snapshot.png');
    const headerPath = path.join(reportDir, 'header.json');
    const manifestPath = path.join(reportDir, 'manifest.json');

    let ticker: string | null = null;
    let hasScreenshot = fsSync.existsSync(screenshotPath);

    const headerData = await readJSON<any>(headerPath);
    if (headerData?.rows) {
      for (const row of headerData.rows) {
        if (row?.parts) {
          for (const part of row.parts) {
            if (part?.key === 'Ticker' && typeof part?.value === 'string') {
              ticker = part.value;
              break;
            }
          }
        }
        if (ticker) break;
      }
    }

    if (!ticker) {
      const manifestData = await readJSON<any>(manifestPath);
      if (manifestData?.metadata?.ticker) {
        ticker = manifestData.metadata.ticker;
      } else if (manifestData?.ticker) {
        ticker = manifestData.ticker;
      }
    }

    reports.push({ id: reportId, ticker, hasScreenshot });
  }

  reports.sort((a, b) => a.id.localeCompare(b.id));
  return reports;
}

export async function listReportFiles(reportId: string): Promise<string[]> {
  const safeReportId = sanitizeReportId(reportId);
  const reportDir = path.join(REPORTS_DIR, safeReportId);

  try {
    const entries = await fs.readdir(reportDir, { withFileTypes: true });
    return entries
      .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.json'))
      .map(entry => entry.name);
  } catch {
    return [];
  }
}

export async function saveBufferToFile(targetPath: string, data: Buffer): Promise<void> {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, data);
}

export function isValidJsonFileName(fileName: string): boolean {
  return /^[a-zA-Z0-9._-]+\.json$/.test(fileName);
}

export function trimString(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    if (value.length === 0) return undefined;
    return trimString(value[0]);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }
  return undefined;
}
