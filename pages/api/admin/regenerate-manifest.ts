import type { NextApiRequest, NextApiResponse } from 'next';
import { generateReportsManifest, requireAdminAuth } from './_utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdminAuth(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const result = await generateReportsManifest();
  if (result.success) {
    res.status(200).json({ success: true, manifest: result.manifest, timestamp: new Date().toISOString() });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
}

