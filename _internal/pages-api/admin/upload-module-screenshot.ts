import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";
import {
  ensureReportDirectory,
  parseMultipartRequest,
  requireAdminAuth,
  sanitizeReportId,
} from "./_utils";

export const config = {
  api: {
    bodyParser: false,
  },
};

// NOTA: Funzione disabilitata per rispettare limite Vercel Hobby (12 funzioni)
// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdminAuth(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const parts = await parseMultipartRequest(req);

    const reportIdRaw = parts.reportId;
    const moduleIdRaw = parts.moduleId;
    const filePart = parts.file;

    if (typeof reportIdRaw !== "string" || reportIdRaw.trim() === "") {
      res.status(400).json({ error: "Report ID mancante" });
      return;
    }
    if (typeof moduleIdRaw !== "string" || moduleIdRaw.trim() === "") {
      res.status(400).json({ error: "Module ID mancante" });
      return;
    }
    if (!filePart || typeof filePart === "string") {
      res.status(400).json({ error: "File immagine mancante" });
      return;
    }

    const reportId = sanitizeReportId(reportIdRaw);
    const moduleId = sanitizeReportId(moduleIdRaw);
    const reportDir = await ensureReportDirectory(reportId);
    const screenshotFile = `${moduleId.toLowerCase()}-screenshot.png`;
    const targetPath = path.join(reportDir, screenshotFile);

    await fs.writeFile(targetPath, filePart.data);

    res.status(200).json({
      success: true,
      path: path.relative(process.cwd(), targetPath).replace(/\\/g, "/"),
      reportId,
      moduleId,
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Errore upload screenshot" });
  }
}
