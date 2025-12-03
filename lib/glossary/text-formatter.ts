/**
 * Text Formatter - Best Practice per Leggibilità
 *
 * Basato su ricerca accademica:
 * - Line length ottimale: 45-75 caratteri (idealmente 50-65)
 * - Paragraph spacing: 1.5-2em tra paragrafi
 * - Font size: minimo 14px (16px ideale)
 * - Line height: 1.5-1.75
 * - Chunking: max 3-4 frasi per paragrafo
 */

/**
 * Formatta un testo lungo in paragrafi ben strutturati
 * @param text - Testo da formattare
 * @param maxLineLength - Lunghezza massima riga (default: 65 caratteri)
 * @returns Array di paragrafi formattati
 */
export function formatTextIntoParagraphs(text: string, maxLineLength: number = 65): string[] {
  if (!text) {
    return [];
  }

  // Rimuovi spazi multipli e newline inconsistenti
  const cleaned = text.replace(/\s+/g, " ").trim();

  // Se il testo è già ben formattato con paragrafi (doppio newline), preservali
  if (cleaned.includes("\n\n")) {
    return cleaned
      .split("\n\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }

  // Dividi per punti, punti e virgola, due punti (ma preserva numeri decimali)
  const sentences = cleaned
    .split(/(?<=[.!?:])\s+(?=[A-ZÀÁÈÉÌÍÎÏÒÓÙÚ])/g)
    .filter((s) => s.trim().length > 0);

  const paragraphs: string[] = [];
  let currentParagraph = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();

    // Se aggiungere questa frase supera la lunghezza ottimale, inizia nuovo paragrafo
    const wouldExceed = (currentParagraph + " " + trimmed).length > maxLineLength * 2;
    const hasEnoughSentences = currentParagraph.split(/[.!?]/).length >= 3;

    if (wouldExceed || (hasEnoughSentences && currentParagraph.length > maxLineLength)) {
      if (currentParagraph) {
        paragraphs.push(currentParagraph.trim());
      }
      currentParagraph = trimmed;
    } else {
      currentParagraph = currentParagraph ? currentParagraph + " " + trimmed : trimmed;
    }
  }

  if (currentParagraph) {
    paragraphs.push(currentParagraph.trim());
  }

  return paragraphs.length > 0 ? paragraphs : [cleaned];
}
