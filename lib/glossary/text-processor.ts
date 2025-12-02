/**
 * Glossary Text Processor
 * Utility per processare testo e trovare automaticamente termini del glossario
 */

import type { GlossaryTerm } from "./terms";
import { loadGlossaryTerms } from "./terms";

interface TermMatch {
  term: GlossaryTerm;
  key: string;
  startIndex: number;
  endIndex: number;
  originalText: string;
}

/**
 * Normalizza il testo per il matching (rimuove accenti, lowercase, ecc.)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Rimuove accenti
    .trim();
}

/**
 * Crea pattern di ricerca per un termine (gestisce plurale, case-insensitive, ecc.)
 */
function createSearchPatterns(termTitle: string): string[] {
  const normalized = normalizeText(termTitle);
  const patterns: string[] = [normalized];

  // Aggiungi varianti comuni (plurali italiani)
  if (normalized.endsWith("o")) {
    patterns.push(normalized + "s"); // plurale italiano (es. "modo" → "modi" ma anche "modos")
  } else if (normalized.endsWith("a")) {
    patterns.push(normalized + "e"); // plurale italiano (es. "volatilità" → "volatilità" invariabile)
  } else if (normalized.endsWith("e")) {
    patterns.push(normalized + "i"); // plurale italiano
  }

  // Aggiungi versione con/senza spazi (per termini composti)
  if (normalized.includes(" ")) {
    patterns.push(normalized.replace(/\s+/g, ""));
  } else if (normalized.length > 5) {
    // Per termini lunghi senza spazi, prova ad aggiungere spazi (es. "StrategyMode" → "Strategy Mode")
    // Solo se il termine è abbastanza lungo per evitare falsi positivi
    const camelCaseMatch = normalized.match(/^([a-z]+)([A-Z][a-z]+)+$/);
    if (camelCaseMatch) {
      const withSpaces = normalized.replace(/([a-z])([A-Z])/g, "$1 $2");
      patterns.push(normalizeText(withSpaces));
    }
  }

  return [...new Set(patterns)]; // Rimuove duplicati
}

/**
 * Trova tutti i match di termini nel testo
 */
export async function findGlossaryTermsInText(text: string): Promise<TermMatch[]> {
  const terms = await loadGlossaryTerms();
  const matches: TermMatch[] = [];

  // Ordina i termini per lunghezza (dal più lungo al più corto) per evitare match parziali
  const sortedTerms = Object.entries(terms).sort(([, a], [, b]) => b.title.length - a.title.length);

  for (const [key, term] of sortedTerms) {
    const patterns = createSearchPatterns(term.title);

    for (const pattern of patterns) {
      // Crea regex case-insensitive per cercare nel testo originale
      // Usa word boundaries solo se il pattern non contiene spazi
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const hasSpaces = pattern.includes(" ");
      const regexPattern = hasSpaces ? escapedPattern : `\\b${escapedPattern}\\b`;
      const regex = new RegExp(regexPattern, "gi");

      let match;
      // Reset lastIndex per evitare problemi con regex global
      regex.lastIndex = 0;

      while ((match = regex.exec(text)) !== null) {
        const startIndex = match.index;
        const endIndex = startIndex + match[0].length;
        const originalText = match[0];

        // Verifica che non sia già stato matchato (evita sovrapposizioni)
        const isOverlapping = matches.some(
          (m) =>
            (startIndex >= m.startIndex && startIndex < m.endIndex) ||
            (endIndex > m.startIndex && endIndex <= m.endIndex) ||
            (startIndex <= m.startIndex && endIndex >= m.endIndex)
        );

        if (!isOverlapping) {
          matches.push({
            term,
            key,
            startIndex,
            endIndex,
            originalText,
          });
        }
      }
    }
  }

  // Ordina per posizione nel testo
  return matches.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Processa il testo e restituisce array di elementi (testo normale o termine)
 */
export interface TextSegment {
  type: "text" | "term";
  content: string;
  term?: GlossaryTerm;
  termKey?: string;
}

export async function processTextWithGlossary(text: string): Promise<TextSegment[]> {
  const matches = await findGlossaryTermsInText(text);
  const segments: TextSegment[] = [];

  if (matches.length === 0) {
    return [{ type: "text", content: text }];
  }

  let lastIndex = 0;

  for (const match of matches) {
    // Aggiungi testo prima del match
    if (match.startIndex > lastIndex) {
      segments.push({
        type: "text",
        content: text.substring(lastIndex, match.startIndex),
      });
    }

    // Aggiungi il termine
    segments.push({
      type: "term",
      content: match.originalText,
      term: match.term,
      termKey: match.key,
    });

    lastIndex = match.endIndex;
  }

  // Aggiungi testo rimanente
  if (lastIndex < text.length) {
    segments.push({
      type: "text",
      content: text.substring(lastIndex),
    });
  }

  return segments;
}
