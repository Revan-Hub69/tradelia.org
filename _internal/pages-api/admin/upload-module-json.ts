import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";
import {
  ensureReportDirectory,
  generateReportsManifest,
  isValidJsonFileName,
  parseMultipartRequest,
  requireAdminAuth,
  sanitizeReportId,
} from "./_utils";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdminAuth(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const parts = await parseMultipartRequest(req);

    const reportIdRaw = parts.reportId;
    const filePart = parts.file;
    const providedFileName = typeof parts.fileName === "string" ? parts.fileName.trim() : undefined;

    if (typeof reportIdRaw !== "string" || reportIdRaw.trim() === "") {
      res.status(400).json({ error: "Report ID mancante" });
      return;
    }

    if (!filePart || typeof filePart === "string") {
      res.status(400).json({ error: "File JSON mancante" });
      return;
    }

    const reportId = sanitizeReportId(reportIdRaw);
    const reportDir = await ensureReportDirectory(reportId);

    let fileName = providedFileName || filePart.filename || "";
    if (fileName.toUpperCase() === "HEADER") {
      fileName = "header.json";
    }

    fileName = fileName.trim();
    if (!isValidJsonFileName(fileName)) {
      res.status(400).json({ error: "Nome file non valido (deve essere .json)" });
      return;
    }

    // Valida JSON
    try {
      JSON.parse(filePart.data.toString());
    } catch (error: any) {
      res.status(400).json({ error: "File JSON non valido", details: error?.message });
      return;
    }

    const targetPath = path.join(reportDir, fileName);
    await fs.writeFile(targetPath, filePart.data);

    const manifest = await generateReportsManifest();

    res.status(200).json({
      success: true,
      path: path.relative(process.cwd(), targetPath).replace(/\\/g, "/"),
      reportId,
      fileName,
      manifest,
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Errore upload JSON" });
  }
}
