/**
 * Rate limiting semplice in-memory
 * Per produzione, considera Upstash Redis o simili
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

/**
 * Rate limiting semplice
 * @param identifier - Identificatore unico (IP, userId, etc.)
 * @param maxRequests - Numero massimo di richieste
 * @param windowMs - Finestra temporale in millisecondi
 * @returns true se permesso, false se rate limited
 */
export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minuto default
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = identifier;

  // Pulisci entry scadute
  if (store[key] && store[key].resetAt < now) {
    delete store[key];
  }

  // Se non esiste entry, crea nuova
  if (!store[key]) {
    store[key] = {
      count: 1,
      resetAt: now + windowMs,
    };
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: store[key].resetAt,
    };
  }

  // Incrementa contatore
  store[key].count += 1;

  // Verifica se supera il limite
  if (store[key].count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: store[key].resetAt,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - store[key].count,
    resetAt: store[key].resetAt,
  };
}

/**
 * Ottieni IP address dalla request
 */
export function getClientIP(request: Request): string {
  // Prova vari header (proxy, load balancer, etc.)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback
  return "unknown";
}
