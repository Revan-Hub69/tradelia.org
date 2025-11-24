/**
 * Security Utilities
 * Funzioni centralizzate per sanitizzazione e sicurezza
 */

/**
 * Escape HTML per prevenire XSS
 * @param {string} text - Testo da sanitizzare
 * @returns {string} Testo sanitizzato
 */
export function escapeHtml(text) {
  if (text == null) {
    return "";
  }
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

/**
 * Sanitizza attributo HTML (per href, src, etc.)
 * @param {string} value - Valore da sanitizzare
 * @returns {string} Valore sanitizzato
 */
export function sanitizeAttribute(value) {
  if (!value) {
    return "";
  }
  // Rimuovi caratteri pericolosi
  return String(value)
    .replace(/[<>"']/g, "")
    .trim();
}

/**
 * Sanitizza URL per prevenire javascript: e data: URLs
 * @param {string} url - URL da sanitizzare
 * @returns {string} URL sanitizzato o "#" se non valido
 */
export function sanitizeUrl(url) {
  if (!url) {
    return "#";
  }
  const str = String(url).trim();
  // Blocca javascript: e data: URLs
  if (str.match(/^(javascript|data|vbscript):/i)) {
    return "#";
  }
  // Permetti solo http, https, mailto, tel, e percorsi relativi
  if (str.match(/^(https?:\/\/|mailto:|tel:|\/|#)/i)) {
    return escapeHtml(str);
  }
  return "#";
}

/**
 * Sanitizza oggetto per inserimento in template
 * @param {object} obj - Oggetto con proprietà da sanitizzare
 * @param {string[]} textFields - Campi che contengono testo
 * @param {string[]} urlFields - Campi che contengono URL
 * @returns {object} Oggetto sanitizzato
 */
export function sanitizeObject(obj, textFields = [], urlFields = []) {
  const sanitized = { ...obj };
  textFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = escapeHtml(sanitized[field]);
    }
  });
  urlFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = sanitizeUrl(sanitized[field]);
    }
  });
  return sanitized;
}

/**
 * Crea elemento DOM sicuro con textContent invece di innerHTML
 * @param {string} tag - Tag HTML
 * @param {object} attributes - Attributi
 * @param {string} text - Testo (sarà sanitizzato)
 * @returns {HTMLElement} Elemento DOM
 */
export function createSafeElement(tag, attributes = {}, text = "") {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === "textContent" || key === "innerText") {
      element.textContent = String(value);
    } else if (key.startsWith("data-") || key === "id" || key === "class") {
      element.setAttribute(key, sanitizeAttribute(value));
    } else {
      element.setAttribute(key, sanitizeAttribute(value));
    }
  });
  if (text) {
    element.textContent = text;
  }
  return element;
}

/**
 * Verifica se siamo in produzione
 * @returns {boolean}
 */
export function isProduction() {
  return (
    window.location.hostname === "tradelia.org" || window.location.hostname === "www.tradelia.org"
  );
}

/**
 * Log sicuro (solo in sviluppo)
 * @param {string} level - Livello (log, warn, error)
 * @param {...any} args - Argomenti
 */
export function safeLog(level = "log", ...args) {
  if (!isProduction()) {
    // eslint-disable-next-line no-console
    console[level](...args);
  }
}
