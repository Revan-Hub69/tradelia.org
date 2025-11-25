/**
 * Validation Utilities
 * Validazione input per sicurezza e data integrity
 * Best Practice: OWASP, NIST
 */

/**
 * UUID regex pattern (RFC 4122)
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Valida formato UUID
 * @param {string} uuid - UUID da validare
 * @returns {boolean} True se valido
 */
export function isValidUUID(uuid) {
  if (!uuid || typeof uuid !== "string") {
    return false;
  }
  return UUID_REGEX.test(uuid.trim());
}

/**
 * Valida e sanitizza UUID
 * @param {string} uuid - UUID da validare
 * @param {string} fieldName - Nome campo per error message
 * @returns {string} UUID sanitizzato
 * @throws {Error} Se UUID non valido
 */
export function validateUUID(uuid, fieldName = "UUID") {
  if (!uuid) {
    throw new Error(`${fieldName} richiesto`);
  }

  const sanitized = String(uuid).trim();

  if (!isValidUUID(sanitized)) {
    throw new Error(`${fieldName} non valido: formato UUID richiesto`);
  }

  return sanitized;
}

/**
 * Valida array non vuoto
 * @param {any} value - Valore da validare
 * @param {string} fieldName - Nome campo
 * @param {number} minLength - Lunghezza minima (default: 1)
 * @returns {Array} Array validato
 * @throws {Error} Se non valido
 */
export function validateArray(value, fieldName = "Array", minLength = 1) {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} deve essere un array`);
  }

  if (value.length < minLength) {
    throw new Error(`${fieldName} deve contenere almeno ${minLength} elemento/i`);
  }

  return value;
}
