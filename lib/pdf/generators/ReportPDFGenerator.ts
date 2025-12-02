/**
 * Report PDF Generator
 * Genera PDF da dati report seguendo template accademico
 * Riferimento: Few (2006), Tufte (2001), WCAG 2.1
 */

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReportPDF, ReportSection } from "../templates/ReportTemplate";
import { parseReportContent } from "../utils/ReportContentParser";
import { imageUrlToBase64, generateChartPlaceholder } from "../utils/ImageConverter";
import { loadTradeliaLogo } from "../utils/LogoLoader";
import { createClient } from "@/lib/supabase/server";

interface ReportData {
  id: string;
  title: string;
  description: string | null;
  report_type: string;
  content?: any; // JSON content del report
  sections?: any[];
  charts?: any[];
  metadata?: {
    author?: string;
    date?: string;
    version?: string;
  };
}

interface PDFOptions {
  quality: "standard" | "high";
  includeCharts: boolean;
  format: "pdf" | "excel" | "csv";
}

/**
 * Genera PDF da dati report
 * Riferimento: Few (2006) - Information Dashboard Design
 */
export async function generateReportPDF(
  reportData: ReportData,
  options: PDFOptions
): Promise<Buffer> {
  // Parse content usando parser strutturato (Few 2006 - Information Structure)
  const parsedSections = parseReportContent(reportData.content);

  // Converti parsed sections in ReportSection per template
  const sections: (ReportSection | null)[] = await Promise.all(
    parsedSections.map(async (parsed) => {
      // Se è un chart e includeCharts è true, converti immagine
      if (parsed.type === "chart" && options.includeCharts && parsed.data?.imageUrl) {
        let imageUrl = parsed.data.imageUrl;

        // Se è URL, converti a base64
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
          imageUrl = await imageUrlToBase64(imageUrl);
        }

        // Se conversione fallita, usa placeholder
        if (!imageUrl) {
          imageUrl = generateChartPlaceholder(parsed.title);
        }

        return {
          id: parsed.id,
          title: parsed.title,
          subtitle: parsed.subtitle,
          content: "",
          type: "chart",
          data: {
            ...parsed.data,
            imageUrl,
            caption: parsed.data?.caption || parsed.title,
          },
        };
      }

      // Se includeCharts è false, salta i chart
      if (parsed.type === "chart" && !options.includeCharts) {
        return null;
      }

      return {
        id: parsed.id,
        title: parsed.title,
        subtitle: parsed.subtitle,
        content: parsed.content,
        type: parsed.type,
        data: parsed.data,
      };
    })
  );

  // Filtra null (chart esclusi)
  const filteredSections = sections.filter((s): s is ReportSection => s !== null);

  // Se non ci sono sezioni, crea sezione default
  if (filteredSections.length === 0) {
    filteredSections.push({
      id: "content",
      title: "Contenuto Report",
      content: reportData.description || "Nessun contenuto disponibile.",
      type: "text",
    });
  }

  // Carica logo: personalizzato (Desk/Business) o Tradelia standard
  let logoBase64 = await loadTradeliaLogo();

  try {
    // Verifica se utente ha logo personalizzato (solo Desk/Business)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("business_logo_url")
        .eq("id", user.id)
        .single();

      if (profile?.business_logo_url) {
        logoBase64 = profile.business_logo_url; // Usa logo personalizzato
      }
    }
  } catch (error) {
    // Se errore, usa logo Tradelia standard
    console.error("Error loading custom logo:", error);
  }

  // Generate PDF con template accademico
  const pdfDocument = React.createElement(ReportPDF, {
    title: reportData.title,
    description: reportData.description || undefined,
    reportType: reportData.report_type,
    sections: filteredSections,
    metadata: {
      author: reportData.metadata?.author || "Tradelia AI",
      date: reportData.metadata?.date || new Date().toLocaleDateString("it-IT"),
      version: reportData.metadata?.version || "1.0",
    },
    logoUrl: logoBase64, // Logo come base64
  });

  // Render to buffer
  const pdfBuffer = await renderToBuffer(pdfDocument);

  return pdfBuffer;
}

/**
 * Genera Excel da dati report
 */
export async function generateReportExcel(
  _reportData: ReportData,
  _options: PDFOptions
): Promise<Buffer> {
  // TODO: Implementare con exceljs
  // Per ora placeholder
  return Buffer.from("Excel placeholder");
}

/**
 * Genera CSV da dati report
 */
export async function generateReportCSV(
  reportData: ReportData,
  _options: PDFOptions
): Promise<string> {
  // Genera CSV semplice
  let csv = "";

  // Header
  csv += `Report: ${reportData.title}\n`;
  csv += `Tipo: ${reportData.report_type}\n`;
  csv += `Data: ${new Date().toLocaleDateString("it-IT")}\n\n`;

  // Content data
  if (reportData.content) {
    const contentData =
      typeof reportData.content === "string" ? JSON.parse(reportData.content) : reportData.content;

    // Tables
    if (contentData.tables && Array.isArray(contentData.tables)) {
      contentData.tables.forEach((table: any) => {
        csv += `${table.title || "Tabella"}\n`;
        if (table.data && table.data.length > 0) {
          // Headers
          csv += Object.keys(table.data[0]).join(",") + "\n";
          // Rows
          table.data.forEach((row: any) => {
            csv += Object.values(row).join(",") + "\n";
          });
        }
        csv += "\n";
      });
    }
  }

  return csv;
}
