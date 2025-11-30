/**
 * Validazione server-side robusta
 * Best practice per sicurezza input
 */

/**
 * Valida email con regex robusto
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email richiesta" };
  }

  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Email non può essere vuota" };
  }

  if (trimmed.length > 254) {
    return { valid: false, error: "Email troppo lunga" };
  }

  // RFC 5322 compliant regex (semplificato ma robusto)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: "Formato email non valido" };
  }

  // Verifica dominio non riservato/localhost
  const domain = trimmed.split("@")[1]?.toLowerCase();
  if (
    domain &&
    (domain === "localhost" || domain.startsWith("127.") || domain.startsWith("192.168."))
  ) {
    return { valid: false, error: "Email con dominio non valido" };
  }

  return { valid: true };
}

/**
 * Valida password con criteri robusti
 */
export function validatePassword(password: string): {
  valid: boolean;
  error?: string;
  strength?: "weak" | "fair" | "good" | "strong";
} {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Password richiesta" };
  }

  if (password.length < 8) {
    return { valid: false, error: "Password deve essere almeno 8 caratteri", strength: "weak" };
  }

  if (password.length > 128) {
    return { valid: false, error: "Password troppo lunga" };
  }

  let score = 0;
  const errors: string[] = [];

  // Controlli base
  if (password.length >= 8) {
    score += 1;
  } else {
    errors.push("Almeno 8 caratteri");
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    errors.push("Una lettera minuscola");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    errors.push("Una lettera maiuscola");
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    errors.push("Un numero");
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    errors.push("Un carattere speciale");
  }

  if (password.length >= 12) {
    score += 1;
  }

  // Determina strength
  let strength: "weak" | "fair" | "good" | "strong" = "weak";
  if (score >= 5) {
    strength = "strong";
  } else if (score >= 4) {
    strength = "good";
  } else if (score >= 3) {
    strength = "fair";
  }

  // Password deve essere almeno "fair" per essere valida
  if (strength === "weak") {
    return { valid: false, error: "Password troppo debole", strength: "weak" };
  }

  // Verifica pattern comuni (password comuni)
  const commonPatterns = [/12345678/, /password/i, /qwerty/i, /abc123/i, /admin/i];

  if (commonPatterns.some((pattern) => pattern.test(password))) {
    return { valid: false, error: "Password troppo comune", strength: "weak" };
  }

  return { valid: true, strength };
}

/**
 * Valida nome utente
 */
export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== "string") {
    return { valid: false, error: "Nome richiesto" };
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Nome non può essere vuoto" };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: "Nome deve essere almeno 2 caratteri" };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: "Nome troppo lungo" };
  }

  // Verifica caratteri validi (lettere, spazi, apostrofi, trattini)
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmed)) {
    return { valid: false, error: "Nome contiene caratteri non validi" };
  }

  return { valid: true };
}

/**
 * Sanitizza stringa (rimuove caratteri pericolosi)
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== "string") {
    return "";
  }

  return input.trim().slice(0, maxLength).replace(/[<>]/g, ""); // Rimuove < e > per prevenire XSS
}

/**
 * Valida OTP
 */
export function validateOTP(otp: string): { valid: boolean; error?: string } {
  if (!otp || typeof otp !== "string") {
    return { valid: false, error: "Codice OTP richiesto" };
  }

  const trimmed = otp.trim();

  if (trimmed.length !== 6) {
    return { valid: false, error: "Codice OTP deve essere di 6 cifre" };
  }

  if (!/^\d{6}$/.test(trimmed)) {
    return { valid: false, error: "Codice OTP deve contenere solo numeri" };
  }

  return { valid: true };
}
