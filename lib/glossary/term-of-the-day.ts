/**
 * Termine del Giorno - Logica di rotazione
 *
 * Best Practice: Deterministic rotation based on date
 * - Stesso termine per tutti gli utenti nello stesso giorno
 * - Rotazione basata su hash della data
 * - Evita termini troppo avanzati per utenti base
 */

import type { GlossaryTerm } from "./terms";

/**
 * Ottiene il termine del giorno basato sulla data
 * @param terms - Tutti i termini del glossario
 * @param date - Data di riferimento (default: oggi)
 * @returns Termine del giorno o null se non disponibile
 */
export function getTermOfTheDay(
  terms: Record<string, GlossaryTerm>,
  date: Date = new Date()
): GlossaryTerm | null {
  const termsArray = Object.values(terms);

  if (termsArray.length === 0) {
    return null;
  }

  // Filtra termini appropriati per "termine del giorno"
  // Preferisci termini foundational/intermediate, non troppo avanzati
  const suitableTerms = termsArray.filter((term) => {
    // Escludi termini troppo avanzati o esperti
    if (term.learningLevel === "expert" || term.learningLevel === "advanced") {
      return false;
    }

    // Preferisci termini con esempi pratici
    const hasPracticalContent =
      term.tradeliaExplanation?.practicalExample ||
      term.tradeliaExplanation?.whatDoes ||
      term.whatDoes;

    return hasPracticalContent;
  });

  if (suitableTerms.length === 0) {
    // Fallback a tutti i termini se nessuno è adatto
    return getTermByDateHash(termsArray, date);
  }

  return getTermByDateHash(suitableTerms, date);
}

/**
 * Ottiene un termine basato su hash della data (deterministico)
 */
function getTermByDateHash(terms: GlossaryTerm[], date: Date): GlossaryTerm {
  // Crea una stringa univoca per il giorno (YYYY-MM-DD)
  const dateString = date.toISOString().split("T")[0];

  // Hash semplice basato sulla data
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Usa hash per selezionare termine
  const index = Math.abs(hash) % terms.length;
  return terms[index];
}

/**
 * Ottiene la data del prossimo termine (domani)
 */
export function getNextTermDate(date: Date = new Date()): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  return next;
}

/**
 * Formatta la data per display
 */
export function formatTermDate(date: Date): string {
  return date.toLocaleDateString("it-IT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
