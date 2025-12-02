/**
 * Glossary Importer
 * Utility per importare termini da CSV, JSON o altre fonti
 */

import type { GlossaryTerm } from "./terms";
import { validateGlossaryTerm } from "./validator";

export interface ImportOptions {
  source: "csv" | "json" | "api";
  validate?: boolean;
  batchSize?: number;
  onProgress?: (current: number, total: number) => void;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: ImportError[];
  warnings: string[];
}

export interface ImportError {
  row?: number;
  key?: string;
  message: string;
  data?: any;
}

/**
 * Importa termini da CSV
 */
export async function importFromCSV(
  csvContent: string,
  options: ImportOptions = { source: "csv", validate: true }
): Promise<ImportResult> {
  const lines = csvContent.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    return {
      success: false,
      imported: 0,
      failed: 0,
      errors: [{ message: "CSV deve avere almeno una riga di header e una riga di dati" }],
      warnings: [],
    };
  }

  const headers = parseCSVLine(lines[0]);
  const requiredFields = ["key", "title", "what", "how", "source"];
  const missingFields = requiredFields.filter((field) => !headers.includes(field));

  if (missingFields.length > 0) {
    return {
      success: false,
      imported: 0,
      failed: 0,
      errors: [{ message: `Campi obbligatori mancanti: ${missingFields.join(", ")}` }],
      warnings: [],
    };
  }

  const terms: Record<string, GlossaryTerm> = {};
  const errors: ImportError[] = [];
  const warnings: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      continue;
    }

    try {
      const values = parseCSVLine(line);
      const term: Partial<GlossaryTerm> = {};

      // Mappa valori ai campi
      headers.forEach((header, index) => {
        const value = values[index]?.trim();
        if (!value) {
          return;
        }

        switch (header) {
          case "key":
          case "title":
          case "what":
          case "how":
          case "source":
          case "technical":
            (term as any)[header] = value;
            break;
          case "category":
          case "tags":
            // Gestisci array se necessario
            break;
          case "relatedTerms":
            term.relatedTerms = value
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t.length > 0);
            break;
        }
      });

      // Validazione
      if (options.validate) {
        const validation = validateGlossaryTerm(term, term.title);
        if (!validation.isValid) {
          errors.push({
            row: i + 1,
            key: term.title,
            message: `Validazione fallita: ${validation.errors.map((e) => e.message).join(", ")}`,
            data: term,
          });
          continue;
        }

        if (validation.warnings.length > 0) {
          warnings.push(`Riga ${i + 1} (${term.title}): ${validation.warnings.length} warning`);
        }
      }

      if (term.title && term.what && term.how && term.source) {
        terms[term.title] = term as GlossaryTerm;
      }
    } catch (error) {
      errors.push({
        row: i + 1,
        message: `Errore parsing riga: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }

    if (options.onProgress) {
      options.onProgress(i, lines.length - 1);
    }
  }

  return {
    success: errors.length === 0,
    imported: Object.keys(terms).length,
    failed: errors.length,
    errors,
    warnings,
  };
}

/**
 * Parse una riga CSV (gestisce virgolette e escape)
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escape quote
        current += '"';
        i++;
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

/**
 * Importa termini da JSON
 */
export async function importFromJSON(
  jsonData: Record<string, any>,
  options: ImportOptions = { source: "json", validate: true }
): Promise<ImportResult> {
  const terms: Record<string, GlossaryTerm> = {};
  const errors: ImportError[] = [];
  const warnings: string[] = [];

  for (const [key, value] of Object.entries(jsonData)) {
    if (key === "_v") {
      continue;
    } // Skip version

    try {
      const term: Partial<GlossaryTerm> = {
        title: value.title,
        what: value.what,
        how: value.how,
        source: value.source,
        technical: value.technical,
        relatedTerms: value.relatedTerms,
      };

      if (options.validate) {
        const validation = validateGlossaryTerm(term, key);
        if (!validation.isValid) {
          errors.push({
            key,
            message: `Validazione fallita: ${validation.errors.map((e) => e.message).join(", ")}`,
            data: term,
          });
          continue;
        }

        if (validation.warnings.length > 0) {
          warnings.push(`${key}: ${validation.warnings.length} warning`);
        }
      }

      if (term.title && term.what && term.how && term.source) {
        terms[key] = term as GlossaryTerm;
      }
    } catch (error) {
      errors.push({
        key,
        message: `Errore processing: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }

  return {
    success: errors.length === 0,
    imported: Object.keys(terms).length,
    failed: errors.length,
    errors,
    warnings,
  };
}

/**
 * Esporta termini in CSV
 */
export function exportToCSV(terms: Record<string, GlossaryTerm>): string {
  const headers = ["key", "title", "what", "technical", "how", "source", "relatedTerms"];
  const lines = [headers.join(",")];

  for (const [key, term] of Object.entries(terms)) {
    const row = [
      key,
      escapeCSV(term.title),
      escapeCSV(term.what),
      escapeCSV(term.technical || ""),
      escapeCSV(term.how),
      escapeCSV(term.source),
      term.relatedTerms?.join(";") || "",
    ];
    lines.push(row.join(","));
  }

  return lines.join("\n");
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
