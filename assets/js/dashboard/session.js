/* eslint-env browser */
/**
 * Session Management
 * Gestisce validità token, periodic check, auto-logout
 */

const TOKEN_KEY = "tradelia-access-token-v1";
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minuti

let checkInterval = null;
let warningShown = false;

/**
 * Verifica validità token e gestisce scadenza
 */
export async function checkTokenValidity() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return { valid: false, reason: "missing_token" };
  }

  try {
    const response = await fetch("/api/user.js?action=validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!data.ok) {
      // Token non valido o scaduto
      localStorage.removeItem(TOKEN_KEY);
      return { valid: false, reason: data.reason || "invalid_token" };
    }

    // Token valido
    const now = new Date();
    const expiryDate = new Date(data.validUntil);
    const daysLeft = data.daysLeft || 0;

    // Mostra warning se scade tra poco (solo una volta)
    if (daysLeft <= 7 && daysLeft > 0 && !warningShown) {
      showExpiryWarning(daysLeft);
      warningShown = true;
    }

    // Auto-logout se scaduto
    if (expiryDate <= now) {
      localStorage.removeItem(TOKEN_KEY);
      return { valid: false, reason: "expired_token" };
    }

    return { valid: true, data };
  } catch (error) {
    console.error("[Session] Errore verifica token:", error);
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
          Il tuo codice di accesso scade tra ${daysLeft} ${daysLeft === 1 ? "giorno" : "giorni"}. 
          <a href="/accesso.html?reason=expiring_soon" class="token-expiry-warning-link">Richiedi un nuovo codice</a>
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
 */
export function startSessionCheck() {
  // Verifica immediatamente
  checkTokenValidity().then((result) => {
    if (!result.valid && result.reason !== "error") {
      // Token non valido, redirect a accesso
      const reason = result.reason || "expired_token";
      window.location.href = `/accesso.html?reason=${reason}&redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }
  });

  // Avvia periodic check
  if (checkInterval) {
    clearInterval(checkInterval);
  }

  checkInterval = setInterval(async () => {
    const result = await checkTokenValidity();
    if (!result.valid && result.reason !== "error") {
      // Token scaduto o revocato, redirect
      const reason = result.reason || "expired_token";
      clearInterval(checkInterval);
      window.location.href = `/accesso.html?reason=${reason}&redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
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
