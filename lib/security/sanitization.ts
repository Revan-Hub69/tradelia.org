/**
 * Output Sanitization
 *
 * Prevenzione XSS tramite sanitizzazione output
 * Conforme a OWASP Top 10 (2021) - A03:2021 – Injection
 *
 * Riferimenti:
 * - OWASP XSS Prevention Cheat Sheet
 * - DOMPurify Documentation
 */

import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizza stringa HTML per prevenire XSS
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "span"],
    ALLOWED_ATTR: ["href", "title", "class"],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitizza testo semplice (rimuove HTML)
 */
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
}

/**
 * Sanitizza URL per prevenire javascript: e data: URLs
 */
export function sanitizeUrl(url: string): string {
  const sanitized = DOMPurify.sanitize(url, { ALLOW_DATA_ATTR: false });

  // Blocca javascript: e data: URLs
  if (sanitized.startsWith("javascript:") || sanitized.startsWith("data:")) {
    return "#";
  }

  return sanitized;
}

/**
 * Sanitizza oggetto con valori stringa
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitizeText(sanitized[key]);
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Sanitizza array di stringhe
 */
export function sanitizeArray(arr: string[]): string[] {
  return arr.map(sanitizeText);
}
