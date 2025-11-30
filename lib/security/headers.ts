/**
 * Security headers per Next.js
 * Best practice per sicurezza web
 */

export const securityHeaders = {
  // Prevenire clickjacking
  "X-Frame-Options": "DENY",

  // Prevenire MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // XSS Protection (legacy, ma ancora utile)
  "X-XSS-Protection": "1; mode=block",

  // Referrer Policy
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Permissions Policy (ex Feature-Policy)
  "Permissions-Policy": ["camera=()", "microphone=()", "geolocation=()", "interest-cohort=()"].join(
    ", "
  ),

  // Content Security Policy
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com", // unsafe-eval per Next.js dev
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://api.pwnedpasswords.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; "),

  // Strict Transport Security (HSTS) - solo in produzione HTTPS
  ...(process.env.NODE_ENV === "production" && {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  }),
};

/**
 * Aggiungi security headers a una response
 */
export function addSecurityHeaders(response: Response): Response {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });
  return response;
}
