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
 * Valida numero intero positivo
 * @param {any} value - Valore da validare
 * @param {string} fieldName - Nome campo
 * @param {number} min - Valore minimo (default: 0)
 * @param {number} max - Valore massimo (default: Infinity)
 * @returns {number} Numero validato
 * @throws {Error} Se non valido
 */
export function validateInteger(value, fieldName = "Numero", min = 0, max = Infinity) {
  if (value === null || value === undefined) {
    throw new Error(`${fieldName} richiesto`);
  }

  const num = Number(value);

  if (!Number.isInteger(num) || isNaN(num)) {
    throw new Error(`${fieldName} deve essere un numero intero`);
  }

  if (num < min) {
    throw new Error(`${fieldName} deve essere >= ${min}`);
  }

  if (num > max) {
    throw new Error(`${fieldName} deve essere <= ${max}`);
  }

  return num;
}

/**
 * Valida stringa non vuota
 * @param {any} value - Valore da validare
 * @param {string} fieldName - Nome campo
 * @param {number} minLength - Lunghezza minima (default: 1)
 * @param {number} maxLength - Lunghezza massima (default: Infinity)
 * @returns {string} Stringa validata
 * @throws {Error} Se non valido
 */
export function validateString(value, fieldName = "Stringa", minLength = 1, maxLength = Infinity) {
  if (!value) {
    throw new Error(`${fieldName} richiesto`);
  }

  const str = String(value).trim();

  if (str.length < minLength) {
    throw new Error(`${fieldName} deve avere almeno ${minLength} caratteri`);
  }

  if (str.length > maxLength) {
    throw new Error(`${fieldName} deve avere massimo ${maxLength} caratteri`);
  }

  return str;
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

/**
 * Valida oggetto JSONB
 * @param {any} value - Valore da validare
 * @param {string} fieldName - Nome campo
 * @returns {object} Oggetto validato
 * @throws {Error} Se non valido
 */
export function validateJSONB(value, fieldName = "JSONB") {
  if (value === null || value === undefined) {
    return null; // JSONB può essere null
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${fieldName} deve essere un oggetto`);
  }

  // Sanitizza: rimuovi proprietà pericolose
  const sanitized = { ...value };
  delete sanitized.__proto__;
  delete sanitized.constructor;

  return sanitized;
}

/**
 * Valida email (formato base)
 * @param {string} email - Email da validare
 * @returns {string} Email validata
 * @throws {Error} Se non valido
 */
export function validateEmail(email) {
  if (!email) {
    throw new Error("Email richiesta");
  }

  const sanitized = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized) || sanitized.length > 254 || sanitized.length < 5) {
    throw new Error("Email non valida");
  }

  return sanitized;
}

/**
 * Sanitizza stringa per prevenire XSS
 * @param {string} str - Stringa da sanitizzare
 * @returns {string} Stringa sanitizzata
 */
export function sanitizeString(str) {
  if (!str || typeof str !== "string") {
    return "";
  }

  return str
    .replace(/[<>]/g, "") // Rimuovi < e >
    .replace(/javascript:/gi, "") // Rimuovi javascript:
    .replace(/on\w+=/gi, "") // Rimuovi event handlers
    .trim();
}

/**
 * Valida e sanitizza oggetto per inserimento DB
 * @param {object} obj - Oggetto da validare
 * @param {object} schema - Schema di validazione {field: {type, required, min, max}}
 * @returns {object} Oggetto validato e sanitizzato
 * @throws {Error} Se validazione fallisce
 */
export function validateObject(obj, schema) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    throw new Error("Oggetto richiesto");
  }

  const validated = {};

  for (const [field, rules] of Object.entries(schema)) {
    const { type, required = false, min, max, validator } = rules;
    const value = obj[field];

    if (required && (value === null || value === undefined || value === "")) {
      throw new Error(`${field} richiesto`);
    }

    if (value === null || value === undefined || value === "") {
      continue; // Campo opzionale vuoto
    }

    switch (type) {
      case "uuid":
        validated[field] = validateUUID(value, field);
        break;
      case "integer":
        validated[field] = validateInteger(value, field, min, max);
        break;
      case "string":
        validated[field] = validateString(value, field, min, max);
        break;
      case "array":
        validated[field] = validateArray(value, field, min);
        break;
      case "jsonb":
        validated[field] = validateJSONB(value, field);
        break;
      case "email":
        validated[field] = validateEmail(value);
        break;
      default:
        if (validator && typeof validator === "function") {
          validated[field] = validator(value);
        } else {
          validated[field] = value;
        }
    }
  }

  return validated;
}
