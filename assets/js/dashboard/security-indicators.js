/* eslint-env browser */
/**
 * Security Indicators
 * BEST PRACTICE: Financial Services UX - Trust Indicators
 * Comunicare chiaramente misure di sicurezza e trasparenza
 */

/**
 * Initialize security indicators
 */
export function initSecurityIndicators() {
  createSecurityBadge();
  addPrivacyLinks();
  enhanceLogoutVisibility();
}

/**
 * Create security badge
 */
function createSecurityBadge() {
  // Check if already exists
  if (document.getElementById("security-badge")) {
    return;
  }

  const badge = document.createElement("div");
  badge.id = "security-badge";
  badge.className = "security-badge";
  badge.setAttribute("role", "status");
  badge.setAttribute("aria-label", "Connessione sicura");

  badge.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
    <span class="security-badge-text">Connessione sicura</span>
  `;

  // Add to header or footer
  const header = document.querySelector(".dashboard-header-minimal");
  if (header) {
    header.appendChild(badge);
  } else {
    document.body.insertBefore(badge, document.body.firstChild);
  }
}

/**
 * Add privacy and terms links to footer
 * REMOVED: Questa funzione creava link duplicati nel footer.
 * I link legali sono già gestiti da footer.js che li include nel footer tecnico.
 */
function addPrivacyLinks() {
  // DISABLED: I link legali sono già gestiti da footer.js
  // Non aggiungere link duplicati al footer
  return;
}

/**
 * Enhance logout button visibility
 */
function enhanceLogoutVisibility() {
  const logoutBtn = document.querySelector('[data-action="logout"], .logout-btn, #logout');
  if (logoutBtn) {
    logoutBtn.setAttribute("aria-label", "Disconnetti e esci");
    logoutBtn.setAttribute("title", "Disconnetti e esci");

    // Add visual indicator
    if (!logoutBtn.querySelector("svg")) {
      logoutBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        ${logoutBtn.textContent || "Esci"}
      `;
    }
  }
}
