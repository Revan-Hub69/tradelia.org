/**
 * Session management e timeout
 * Best practice per gestione sessioni sicure
 */

export const SESSION_CONFIG = {
  // Timeout sessione inattiva (30 minuti)
  INACTIVE_TIMEOUT: 30 * 60 * 1000,

  // Timeout sessione massimo (7 giorni)
  MAX_SESSION_AGE: 7 * 24 * 60 * 60 * 1000,

  // Refresh token prima della scadenza (5 minuti)
  REFRESH_BEFORE_EXPIRY: 5 * 60 * 1000,
};

/**
 * Verifica se sessione è scaduta
 */
export function isSessionExpired(lastActivity: number): boolean {
  const now = Date.now();
  const inactiveTime = now - lastActivity;

  return inactiveTime > SESSION_CONFIG.INACTIVE_TIMEOUT;
}

/**
 * Verifica se sessione è troppo vecchia
 */
export function isSessionTooOld(createdAt: number): boolean {
  const now = Date.now();
  const age = now - createdAt;

  return age > SESSION_CONFIG.MAX_SESSION_AGE;
}

/**
 * Calcola quando refreshare token
 */
export function shouldRefreshToken(expiresAt: number): boolean {
  const now = Date.now();
  const timeUntilExpiry = expiresAt - now;

  return timeUntilExpiry < SESSION_CONFIG.REFRESH_BEFORE_EXPIRY;
}
