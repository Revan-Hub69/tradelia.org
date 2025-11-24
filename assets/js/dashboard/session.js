/* eslint-env browser */
/**
 * Session Management
 * Gestisce validità token, periodic check, auto-logout
 */

import { safeLog } from "./security-utils.js";
import { getToken, getRefreshToken, removeToken, saveToken, syncTokenToIndexedDB } from "./token-storage.js";

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minuti
const SESSION_REFRESH_THRESHOLD_MINUTES = 10;

let checkInterval = null;
let warningShown = false;
let refreshInFlight = null;

/**
 * Verifica validità token e gestisce scadenza
 */
export async function checkTokenValidity(options = { retryOnRefresh: true }) {
  const token = await getToken();
  if (!token) {
    return { valid: false, reason: "missing_token" };
  }

  try {
    const response = await fetch("/api/auth?action=validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!data.ok) {
      if (data.reason === "session_expired" && options.retryOnRefresh) {
        const refreshResult = await refreshSession(true);
        if (refreshResult.ok) {
          return checkTokenValidity({ retryOnRefresh: false });
        }
      }
      // Token non valido o scaduto - BEST PRACTICE: Use secure token storage
      await removeToken();
      return { valid: false, reason: data.reason || "invalid_token" };
    }

    // Token valido
    const now = new Date();
    const expiryDate = new Date(data.validUntil);
    const daysLeft = data.daysLeft || 0;

    // Mostra warning se piano scade tra poco (solo una volta)
    if (daysLeft <= 7 && daysLeft > 0 && !warningShown) {
      showExpiryWarning(daysLeft);
      warningShown = true;
    }

    // Refresh automatico se sessione vicina alla scadenza
    if (
      typeof data.sessionMinutesLeft === "number" &&
      data.sessionMinutesLeft <= SESSION_REFRESH_THRESHOLD_MINUTES
    ) {
      refreshSession().catch((error) => safeLog("warn", "[Session] Refresh background fallito", error));
    }

    // Auto-logout se scaduto - BEST PRACTICE: Use secure token storage
    if (expiryDate <= now) {
      await removeToken();
      return { valid: false, reason: "expired_token" };
    }

    return { valid: true, data };
  } catch (error) {
    safeLog("error", "[Session] Errore verifica token:", error);
    // In caso di errore, non facciamo logout (potrebbe essere problema temporaneo)
    return { valid: true, error: true };
  }
}

/**
 * Mostra warning se token scade tra poco
 */
function showExpiryWarning(daysLeft) {
  // Crea banner warning se non esiste
  let warningBanner = document.getElementById("token-expiry-warning");
  if (!warningBanner) {
    warningBanner = document.createElement("div");
    warningBanner.id = "token-expiry-warning";
    warningBanner.className = "token-expiry-warning";
    warningBanner.innerHTML = `
      <div class="token-expiry-warning-content">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span class="token-expiry-warning-text">
          Il tuo piano scade tra ${daysLeft} ${daysLeft === 1 ? "giorno" : "giorni"}.
          <a href="/accesso.html?reason=expiring_soon" class="token-expiry-warning-link">Gestisci l’abbonamento</a>
        </span>
        <button type="button" class="token-expiry-warning-close" aria-label="Chiudi">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
    document.body.insertBefore(warningBanner, document.body.firstChild);

    // Close button
    const closeBtn = warningBanner.querySelector(".token-expiry-warning-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        warningBanner.remove();
      });
    }
  }
}

/**
 * Avvia periodic check token
 * BEST PRACTICE: Non reindirizza se non c'è token (utente guest)
 * Reindirizza solo se token esiste ma è scaduto/revocato
 */
export function startSessionCheck() {
  // BEST PRACTICE: Accesso libero - non reindirizza automaticamente
  // Verifica token solo per mostrare warning se scade tra poco, ma non blocca l'accesso
  checkTokenValidity().then((result) => {
    // Log per debug (non reindirizza)
    if (!result.valid && result.reason !== "error" && result.reason !== "missing_token") {
      safeLog("log", "[Session] Token non valido:", result.reason);
      // Mostra warning se necessario, ma non reindirizza
    }
  });

  // Avvia periodic check (solo per warning, non per redirect)
  if (checkInterval) {
    clearInterval(checkInterval);
  }

  checkInterval = setInterval(async () => {
    const result = await checkTokenValidity();
    // Log per debug (non reindirizza)
    if (!result.valid && result.reason !== "error" && result.reason !== "missing_token") {
      safeLog("log", "[Session] Token non valido:", result.reason);
      // Mostra warning se necessario, ma non reindirizza
    }
  }, CHECK_INTERVAL);
}

/**
 * Ferma periodic check
 */
export function stopSessionCheck() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
  warningShown = false;
}

/**
 * Refresh session token via /api/auth?action=refresh-session
 */
export async function refreshSession(force = false) {
  if (refreshInFlight && !force) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        return { ok: false, reason: "missing_refresh" };
      }

      const response = await fetch("/api/auth?action=refresh-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        if (data?.reason !== "missing_refresh") {
          await removeToken();
        }
        return { ok: false, reason: data?.reason || "refresh_failed", error: data?.error };
      }

      await saveToken(data.token, data.refreshToken);
      await syncTokenToIndexedDB();
      return { ok: true, data };
    } catch (error) {
      safeLog("error", "[Session] Refresh session fallito", error);
      return { ok: false, reason: "refresh_error", error };
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}
