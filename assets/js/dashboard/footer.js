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
            <span class="footer-brand-word">TRADELIA</span>
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
          <button type="button" class="footer-link footer-link-btn" id="btn-privacy-open" aria-label="Apri informativa privacy">Privacy</button>
          <span class="footer-separator">·</span>
          <button type="button" class="footer-link footer-link-btn" id="btn-mifid-open" aria-label="Apri informativa MiFID">MiFID</button>
          <span class="footer-separator">·</span>
          <span class="footer-tech">
            v<span id="footer-version">—</span>
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
  
  // Bind pulsanti MIFID/Privacy
  bindLegalButtons(container);
}

/**
 * Carica informazioni tecniche
 */
async function loadTechnicalInfo(container) {
  try {
    // Carica versione da version.json
    const versionEl = container.querySelector("#footer-version");
    if (versionEl) {
      try {
        const response = await fetch("/version.json");
        if (response.ok) {
          const data = await response.json();
          versionEl.textContent = data.version || "—";
        } else {
          // Fallback a package.json se version.json non disponibile
          const pkgResponse = await fetch("/package.json");
          if (pkgResponse.ok) {
            const pkgData = await pkgResponse.json();
            versionEl.textContent = pkgData.version || "—";
          } else {
            versionEl.textContent = "—";
          }
        }
      } catch (fetchError) {
        console.warn("[Footer] Errore caricamento versione:", fetchError);
        versionEl.textContent = "—";
      }
    }

    // Build info - data da version.json timestamp o data corrente
    const buildEl = container.querySelector("#footer-build");
    if (buildEl) {
      try {
        const response = await fetch("/version.json");
        if (response.ok) {
          const data = await response.json();
          if (data.timestamp) {
            const buildDate = new Date(data.timestamp);
            buildEl.textContent = buildDate.toISOString().split("T")[0];
          } else {
            buildEl.textContent = new Date().toISOString().split("T")[0];
          }
        } else {
          buildEl.textContent = new Date().toISOString().split("T")[0];
        }
      } catch (fetchError) {
        console.warn("[Footer] Errore caricamento build date:", fetchError);
        buildEl.textContent = new Date().toISOString().split("T")[0];
      }
    }
  } catch (e) {
    console.error("[Footer] Errore caricamento info tecniche:", e);
  }
}

/**
 * Bind pulsanti legali (MIFID/Privacy)
 */
function bindLegalButtons(container) {
  // Usa setTimeout per assicurarsi che mifid-banner.js sia inizializzato
  setTimeout(() => {
    const btnPrivacy = container.querySelector('#btn-privacy-open');
    const btnMifid = container.querySelector('#btn-mifid-open');

    if (btnPrivacy) {
      btnPrivacy.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.openLegalOverlay) {
          window.openLegalOverlay('privacy', false);
        } else {
          // Se l'overlay non è ancora pronto, riprova
          setTimeout(() => {
            if (window.openLegalOverlay) {
              window.openLegalOverlay('privacy', false);
            }
          }, 400);
        }
      });
    }

    if (btnMifid) {
      btnMifid.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.openLegalOverlay) {
          window.openLegalOverlay('mifid', false);
        } else {
          // Se l'overlay non è ancora pronto, riprova
          setTimeout(() => {
            if (window.openLegalOverlay) {
              window.openLegalOverlay('mifid', false);
            }
          }, 400);
        }
      });
    }
  }, 150);
}
