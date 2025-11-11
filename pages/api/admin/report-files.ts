import type { NextApiRequest, NextApiResponse } from 'next';
import { listReportFiles, requireAdminAuth, trimString } from './_utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdminAuth(req, res)) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const reportId = trimString(req.query.reportId);
  if (!reportId) {
    res.status(400).json({ error: 'Report ID mancante' });
    return;
  }

  try {
    const files = await listReportFiles(reportId);
    res.status(200).json({ files });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Errore caricamento file report' });
  }
}

