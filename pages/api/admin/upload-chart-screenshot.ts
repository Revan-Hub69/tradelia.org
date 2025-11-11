import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { promises as fs } from 'fs';
import {
  ensureReportDirectory,
  generateReportsManifest,
  parseMultipartRequest,
  pushToGit,
  requireAdminAuth,
  sanitizeReportId
} from './_utils';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdminAuth(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const parts = await parseMultipartRequest(req);
    const reportIdRaw = parts.reportId;
    const filePart = parts.file;

    if (typeof reportIdRaw !== 'string' || reportIdRaw.trim() === '') {
      res.status(400).json({ error: 'Report ID mancante' });
      return;
    }
    if (!filePart || typeof filePart === 'string') {
      res.status(400).json({ error: 'File immagine mancante' });
      return;
    }

    const reportId = sanitizeReportId(reportIdRaw);
    const reportDir = await ensureReportDirectory(reportId);
    const targetPath = path.join(reportDir, 'chart-snapshot.png');

    await fs.writeFile(targetPath, filePart.data);

    const manifest = await generateReportsManifest();
    const git = await pushToGit(reportId, targetPath);

    res.status(200).json({
      success: true,
      path: path.relative(process.cwd(), targetPath).replace(/\\/g, '/'),
      reportId,
      manifest,
      git
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Errore upload chart screenshot' });
  }
}

