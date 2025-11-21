/* eslint-env browser */
/**
 * Dashboard Footer Component
 * Footer tecnico con social, contatti, legale e info tecniche
 */

export async function initFooter() {
  const footerContainer = document.getElementById("dashboard-footer");
  if (!footerContainer) {
    console.warn("[Footer] Container non trovato");
    return;
  }

  renderFooter(footerContainer);
  bindFooterEvents(footerContainer);
}

/**
 * Renderizza il footer minimale per dashboard tecnica
 */
function renderFooter(container) {
  const year = new Date().getFullYear();

  container.innerHTML = `
    <div class="footer-content">
      <div class="footer-left">
        <p class="footer-copyright">
          &copy; ${year} 
          <span class="footer-brand">
            <span class="footer-brand-word">Tradelia</span>
            <span class="footer-brand-dot"></span>
            <span class="footer-brand-suffix">AI</span>
          </span>
          · Tutti i diritti riservati
        </p>
        <p class="footer-disclaimer">
          Le informazioni fornite sono a scopo educativo e non costituiscono consulenza finanziaria.
        </p>
      </div>
      
      <div class="footer-right">
        <div class="footer-links-inline">
          <a href="mailto:support@tradelia.org" class="footer-link">Supporto</a>
          <span class="footer-separator">·</span>
          <a href="/status" class="footer-link">Status</a>
          <span class="footer-separator">·</span>
          <a href="/privacy.html" class="footer-link">Privacy</a>
          <span class="footer-separator">·</span>
          <span class="footer-tech">
            v<span id="footer-version">1.0.0</span>
            <span class="footer-separator">·</span>
            <span id="footer-build">—</span>
          </span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Bind event listeners
 */
function bindFooterEvents(container) {
  // Carica versione e build
  loadTechnicalInfo(container);
}

/**
 * Carica informazioni tecniche
 */
async function loadTechnicalInfo(container) {
  try {
    // Versione da package.json o manifest
    const versionEl = container.querySelector("#footer-version");
    if (versionEl) {
      // TODO: Caricare da API o manifest
      versionEl.textContent = "1.0.0";
    }

    // Build info
    const buildEl = container.querySelector("#footer-build");
    if (buildEl) {
      // TODO: Caricare da API o env
      buildEl.textContent = new Date().toISOString().split("T")[0];
    }
  } catch (e) {
    console.error("[Footer] Errore caricamento info tecniche:", e);
  }
}
