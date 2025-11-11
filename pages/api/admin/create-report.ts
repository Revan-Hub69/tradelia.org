import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { promises as fs } from 'fs';
import { ensureReportDirectory, requireAdminAuth, sanitizeReportId, trimString } from './_utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdminAuth(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { reportId: rawReportId, reportType } = req.body || {};
  const reportId = trimString(rawReportId);
  const type = trimString(reportType) || 'swing';

  if (!reportId) {
    res.status(400).json({ error: 'Report ID obbligatorio' });
    return;
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(reportId)) {
    res.status(400).json({ error: 'Report ID non valido' });
    return;
  }

  try {
    const reportDir = await ensureReportDirectory(reportId);

    const headerPath = path.join(reportDir, 'header.json');
    const existsHeader = await fs
      .access(headerPath)
      .then(() => true)
      .catch(() => false);

    if (existsHeader) {
      res.status(400).json({ error: 'Report già esistente' });
      return;
    }

    const now = new Date().toISOString();
    const header = {
      meta: {
        module: 'HEADER',
        version: 'v1.0.0',
        auditPathId: `RPT-${sanitizeReportId(reportId)}-HEAD`,
        state: 'ACTIVE',
        generatedAt: now,
        lastUpdated: now,
        reportID: reportId,
        reportType: type
      },
      rows: [
        {
          id: 'company-line',
          parts: [
            {
              kind: 'text',
              text: 'Report Framework Accademico AI, Tradelia Swing Master 5.0'
            }
          ]
        }
      ],
      footer: {
        links: []
      },
      metricsPanel: []
    };

    await fs.writeFile(headerPath, JSON.stringify(header, null, 2), 'utf-8');

    res.status(200).json({ success: true, reportId, path: path.relative(process.cwd(), reportDir) });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Errore creazione report' });
  }
}

