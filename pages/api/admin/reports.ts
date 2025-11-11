import type { NextApiRequest, NextApiResponse } from 'next';
import { listReports, requireAdminAuth } from './_utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdminAuth(req, res)) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const reports = await listReports();
    res.status(200).json({ reports });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Errore caricamento report' });
  }
}

