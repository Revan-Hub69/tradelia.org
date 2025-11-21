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
 * Renderizza il footer
 */
function renderFooter(container) {
  container.innerHTML = `
    <div class="footer-content">
      <div class="footer-section footer-brand">
        <h3 class="footer-title">Tradelia AI</h3>
        <p class="footer-description">
          Piattaforma di analisi finanziaria educativa e non operativa.
        </p>
      </div>

      <div class="footer-section footer-links">
        <h4 class="footer-section-title">Link Rapidi</h4>
        <ul class="footer-list">
          <li><a href="/" class="footer-link">Home</a></li>
          <li><a href="/brokers.html" class="footer-link">Broker</a></li>
          <li><a href="#support" class="footer-link">Supporto</a></li>
          <li><a href="#faq" class="footer-link">FAQ</a></li>
        </ul>
      </div>

      <div class="footer-section footer-social">
        <h4 class="footer-section-title">Seguici</h4>
        <div class="footer-social-links">
          <a href="https://linkedin.com/company/tradelia" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect x="2" y="9" width="4" height="12"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </a>
          <a href="https://twitter.com/tradelia" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="Twitter/X">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
            </svg>
          </a>
          <a href="mailto:info@tradelia.org" class="footer-social-link" aria-label="Email">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </a>
        </div>
        <a href="#newsletter" class="footer-newsletter-link">Newsletter</a>
      </div>

      <div class="footer-section footer-contacts">
        <h4 class="footer-section-title">Contatti</h4>
        <ul class="footer-list">
          <li><a href="mailto:support@tradelia.org" class="footer-link">support@tradelia.org</a></li>
          <li><a href="#contact-form" class="footer-link">Form contatto</a></li>
          <li><a href="/status" class="footer-link">Status page</a></li>
        </ul>
      </div>

      <div class="footer-section footer-legal">
        <h4 class="footer-section-title">Legale</h4>
        <ul class="footer-list">
          <li><a href="/privacy.html" class="footer-link">Privacy</a></li>
          <li><a href="/termini.html" class="footer-link">Termini</a></li>
          <li><a href="/cookie.html" class="footer-link">Cookie</a></li>
          <li><a href="/mifid.html" class="footer-link">MIFID</a></li>
        </ul>
      </div>

      <div class="footer-section footer-technical">
        <h4 class="footer-section-title">Tecnico</h4>
        <ul class="footer-list">
          <li><span class="footer-tech-item">Versione: <strong id="footer-version">1.0.0</strong></span></li>
          <li><span class="footer-tech-item">Build: <strong id="footer-build">—</strong></span></li>
          <li><a href="/changelog.html" class="footer-link">Changelog</a></li>
          <li><a href="/api/docs" class="footer-link">API Docs</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p class="footer-copyright">
        &copy; ${new Date().getFullYear()} Tradelia AI. Tutti i diritti riservati.
      </p>
      <p class="footer-disclaimer">
        Le informazioni fornite sono a scopo educativo e non costituiscono consulenza finanziaria.
      </p>
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
