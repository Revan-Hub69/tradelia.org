/* eslint-env browser */
/**
 * Network State Handling
 * BEST PRACTICE: PWA Offline-First, Network Awareness
 * Rileva stato connessione e mostra feedback all'utente
 */

/**
 * Inizializza network state monitoring
 */
export function initNetworkState() {
  // Verifica stato iniziale
  updateNetworkState();

  // Listeners per cambiamenti stato
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Network Information API (se disponibile)
  if ("connection" in navigator) {
    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection) {
      connection.addEventListener("change", handleConnectionChange);
    }
  }
}

/**
 * Gestisce evento online
 */
function handleOnline() {
  updateNetworkState();
  hideNetworkBanner();
  const message = window.t ? window.t("network.online") : "Connessione ripristinata";
  if (window.showToast) {
    window.showToast(message, "success");
  }
}

/**
 * Gestisce evento offline
 */
function handleOffline() {
  updateNetworkState();
  showOfflineBanner();
  const message = window.t
    ? window.t("network.offline")
    : "Connessione assente. Alcune funzionalità potrebbero non essere disponibili.";
  if (window.showToast) {
    window.showToast(message, "error");
  }
}

/**
 * Gestisce cambiamento connessione (velocità, tipo)
 */
function handleConnectionChange() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (!connection) {
    return;
  }

  const isSlow = connection.effectiveType === "slow-2g" || connection.effectiveType === "2g";

  if (isSlow && navigator.onLine) {
    showSlowConnectionWarning();
  } else {
    hideNetworkBanner();
  }
}

/**
 * Aggiorna stato network
 */
function updateNetworkState() {
  const isOnline = navigator.onLine;
  document.documentElement.setAttribute("data-network", isOnline ? "online" : "offline");
}

/**
 * Mostra banner offline
 */
function showOfflineBanner() {
  let banner = document.getElementById("network-state-banner");
  if (!banner) {
    banner = createNetworkBanner();
    document.body.insertBefore(banner, document.body.firstChild);
  }
  banner.dataset.state = "offline";
  banner.hidden = false;
}

/**
 * Mostra warning connessione lenta
 */
function showSlowConnectionWarning() {
  let banner = document.getElementById("network-state-banner");
  if (!banner) {
    banner = createNetworkBanner();
    document.body.insertBefore(banner, document.body.firstChild);
  }
  banner.dataset.state = "slow";
  banner.hidden = false;
}

/**
 * Nasconde banner network
 */
function hideNetworkBanner() {
  const banner = document.getElementById("network-state-banner");
  if (banner) {
    banner.hidden = true;
  }
}

/**
 * Crea banner network state
 */
function createNetworkBanner() {
  const banner = document.createElement("div");
  banner.id = "network-state-banner";
  banner.className = "network-state-banner";
  banner.setAttribute("role", "status");
  banner.setAttribute("aria-live", "polite");
  banner.hidden = true;

  const offlineMsg = window.t ? window.t("network.offline") : "Connessione assente";
  const slowMsg = window.t ? window.t("network.slow") : "Connessione lenta";

  banner.innerHTML = `
    <div class="network-state-content">
      <span class="network-state-icon" aria-hidden="true"></span>
      <span class="network-state-message" data-offline="${offlineMsg}" data-slow="${slowMsg}"></span>
    </div>
  `;

  return banner;
}
