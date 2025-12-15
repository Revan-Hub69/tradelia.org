/**
 * CSRF Protection
 *
 * Conforme a OWASP CSRF Prevention Cheat Sheet
 *
 * Riferimenti:
 * - OWASP CSRF Prevention Cheat Sheet
 * - SameSite Cookie Attribute
 */

import { cookies } from "next/headers";
import { randomBytes, createHmac } from "crypto";

const CSRF_TOKEN_COOKIE = "csrf-token";
const CSRF_TOKEN_HEADER = "x-csrf-token";
const CSRF_SECRET = process.env.CSRF_SECRET || "change-me-in-production";

/**
 * Genera token CSRF
 */
export async function generateCsrfToken(): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const secret = CSRF_SECRET;
  const hmac = createHmac("sha256", secret).update(token).digest("hex");
  const signedToken = `${token}.${hmac}`;

  // Salva in cookie (httpOnly, sameSite)
  const cookieStore = await cookies();
  cookieStore.set(CSRF_TOKEN_COOKIE, signedToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 24 ore
    path: "/",
  });

  return token;
}

/**
 * Verifica token CSRF
 */
export async function verifyCsrfToken(token: string | null): Promise<boolean> {
  if (!token) {
    return false;
  }

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value;

  if (!cookieToken) {
    return false;
  }

  // Verifica formato
  const [cookieTokenValue, cookieHmac] = cookieToken.split(".");
  if (!cookieTokenValue || !cookieHmac) {
    return false;
  }

  // Verifica HMAC
  const expectedHmac = createHmac("sha256", CSRF_SECRET).update(cookieTokenValue).digest("hex");

  if (cookieHmac !== expectedHmac) {
    return false;
  }

  // Verifica che il token nella richiesta corrisponda al cookie
  return cookieTokenValue === token;
}

/**
 * Middleware per verificare CSRF token
 */
export async function requireCsrfToken(
  request: Request
): Promise<{ valid: boolean; error?: string }> {
  // Solo per metodi che modificano dati
  const method = request.method;
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return { valid: true };
  }

  const token = request.headers.get(CSRF_TOKEN_HEADER);

  if (!token) {
    return {
      valid: false,
      error: "CSRF token mancante",
    };
  }

  const isValid = await verifyCsrfToken(token);

  if (!isValid) {
    return {
      valid: false,
      error: "CSRF token non valido",
    };
  }

  return { valid: true };
}
