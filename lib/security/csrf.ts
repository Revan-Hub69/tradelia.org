/**
 * CSRF Protection
 * Genera e verifica token CSRF per proteggere form
 */

import { cookies } from "next/headers";
import crypto from "crypto";

const CSRF_TOKEN_NAME = "csrf-token";
const CSRF_TOKEN_MAX_AGE = 60 * 60; // 1 ora

/**
 * Genera token CSRF
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Ottieni o genera token CSRF
 */
export async function getCSRFToken(): Promise<string> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(CSRF_TOKEN_NAME);

  if (existingToken?.value) {
    return existingToken.value;
  }

  // Genera nuovo token
  const newToken = generateCSRFToken();

  // Imposta cookie (sarà fatto nel middleware o route handler)
  return newToken;
}

/**
 * Verifica token CSRF
 */
export async function verifyCSRFToken(token: string | null | undefined): Promise<boolean> {
  if (!token || typeof token !== "string") {
    return false;
  }

  const cookieStore = await cookies();
  const storedToken = cookieStore.get(CSRF_TOKEN_NAME);

  if (!storedToken?.value) {
    return false;
  }

  // Confronta token (timing-safe)
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(storedToken.value));
}

/**
 * Imposta cookie CSRF
 */
export function setCSRFCookie(token: string): {
  name: string;
  value: string;
  options: { httpOnly: boolean; secure: boolean; sameSite: "strict"; maxAge: number; path: string };
} {
  return {
    name: CSRF_TOKEN_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      maxAge: CSRF_TOKEN_MAX_AGE,
      path: "/",
    },
  };
}
