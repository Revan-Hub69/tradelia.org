/**
 * Rate Limiting Utilities
 * Prevenzione DoS e abuso API
 * Best Practice: OWASP, NIST
 */

// Rate limiting in memoria (per produzione usare Redis)
const rateLimitMap = new Map();
const lockoutMap = new Map();

// Configurazione rate limit
const RATE_LIMIT_CONFIG = {
  // Education API: più permissivo (contenuti educativi)
  education: {
    maxAttempts: 100, // 100 richieste
    windowMs: 60 * 60 * 1000, // 1 ora
    lockoutDuration: 15 * 60 * 1000, // 15 minuti lockout
  },
  // Default: più restrittivo
  default: {
    maxAttempts: 50, // 50 richieste
    windowMs: 60 * 60 * 1000, // 1 ora
    lockoutDuration: 15 * 60 * 1000, // 15 minuti lockout
  },
};

/**
 * Check rate limit
 * @param {string} identifier - Identificatore (IP, user ID, etc.)
 * @param {string} type - Tipo rate limit ('education' o 'default')
 * @returns {{allowed: boolean, remaining: number, resetAt?: number, locked?: boolean}}
 */
export function checkRateLimit(identifier, type = "default") {
  const config = RATE_LIMIT_CONFIG[type] || RATE_LIMIT_CONFIG.default;
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // Check lockout first
  const lockout = checkLockout(identifier);
  if (lockout.locked) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: lockout.lockedUntil,
      locked: true,
    };
  }

  if (!record) {
    rateLimitMap.set(identifier, {
      attempts: 1,
      resetAt: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetAt: now + config.windowMs,
    };
  }

  if (now > record.resetAt) {
    // Reset window
    rateLimitMap.set(identifier, {
      attempts: 1,
      resetAt: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetAt: now + config.windowMs,
    };
  }

  if (record.attempts >= config.maxAttempts) {
    // Account lockout
    lockoutMap.set(identifier, { lockedUntil: now + config.lockoutDuration });
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
      locked: true,
    };
  }

  record.attempts++;
  return {
    allowed: true,
    remaining: config.maxAttempts - record.attempts,
    resetAt: record.resetAt,
  };
}

/**
 * Check account lockout
 * @param {string} identifier - Identificatore
 * @returns {{locked: boolean, lockedUntil?: number, minutesRemaining?: number}}
 */
export function checkLockout(identifier) {
  const lockout = lockoutMap.get(identifier);
  if (!lockout) {
    return { locked: false };
  }

  const now = Date.now();
  if (now > lockout.lockedUntil) {
    lockoutMap.delete(identifier);
    return { locked: false };
  }

  return {
    locked: true,
    lockedUntil: lockout.lockedUntil,
    minutesRemaining: Math.ceil((lockout.lockedUntil - now) / (60 * 1000)),
  };
}

/**
 * Get identifier from request (IP o user ID)
 * @param {object} req - Request object
 * @returns {string} Identifier
 */
export function getRateLimitIdentifier(req) {
  // Prefer user ID se autenticato
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }

  // Fallback a IP
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    "unknown";

  return `ip:${ip}`;
}

/**
 * Cleanup old rate limit records (chiamare periodicamente)
 */
export function cleanupRateLimit() {
  const now = Date.now();

  // Cleanup rate limit map
  for (const [identifier, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(identifier);
    }
  }

  // Cleanup lockout map
  for (const [identifier, lockout] of lockoutMap.entries()) {
    if (now > lockout.lockedUntil) {
      lockoutMap.delete(identifier);
    }
  }
}

// Cleanup ogni ora
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimit, 60 * 60 * 1000);
}
