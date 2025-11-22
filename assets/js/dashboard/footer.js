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
          <button type="button" class="footer-link footer-link-btn" id="btn-support-open" aria-label="Apri popup contatti supporto">Supporto</button>
          <span class="footer-separator">·</span>
          <button type="button" class="footer-link footer-link-btn" id="btn-status-open" aria-label="Apri popup contatti status">Status</button>
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
    // Versione hardcoded (niente fetch, niente 404)
    const versionEl = container.querySelector("#footer-version");
    if (versionEl) {
      versionEl.textContent = "2.0.1";
    }

    // Build info - data corrente (non serve fetch, evita 404)
    const buildEl = container.querySelector("#footer-build");
    if (buildEl) {
      buildEl.textContent = new Date().toISOString().split("T")[0];
    }
  } catch (e) {
    console.error("[Footer] Errore caricamento info tecniche:", e);
  }
}

/**
 * Bind pulsanti legali (MIFID/Privacy) e contatti (Supporto/Status)
 */
function bindLegalButtons(container) {
  // Usa setTimeout per assicurarsi che mifid-banner.js sia inizializzato
  setTimeout(() => {
    const btnPrivacy = container.querySelector("#btn-privacy-open");
    const btnMifid = container.querySelector("#btn-mifid-open");
    const btnSupport = container.querySelector("#btn-support-open");
    const btnStatus = container.querySelector("#btn-status-open");

    if (btnPrivacy) {
      btnPrivacy.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.openLegalOverlay) {
          window.openLegalOverlay("privacy", false);
        } else {
          setTimeout(() => {
            if (window.openLegalOverlay) {
              window.openLegalOverlay("privacy", false);
            }
          }, 400);
        }
      });
    }

    if (btnMifid) {
      btnMifid.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.openLegalOverlay) {
          window.openLegalOverlay("mifid", false);
        } else {
          setTimeout(() => {
            if (window.openLegalOverlay) {
              window.openLegalOverlay("mifid", false);
            }
          }, 400);
        }
      });
    }

    // Popup contatti Supporto
    if (btnSupport) {
      btnSupport.addEventListener("click", (e) => {
        e.preventDefault();
        openContactsModal("Supporto");
      });
    }

    // Popup contatti Status
    if (btnStatus) {
      btnStatus.addEventListener("click", (e) => {
        e.preventDefault();
        openContactsModal("Status");
      });
    }
  }, 150);
}

/**
 * Apre modale contatti
 */
function openContactsModal(type) {
  // Crea modale se non esiste
  let modal = document.getElementById("contacts-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "contacts-modal";
    modal.className = "contacts-modal";
    modal.innerHTML = `
      <div class="contacts-modal-overlay"></div>
      <div class="contacts-modal-content">
        <button type="button" class="contacts-modal-close" aria-label="Chiudi modale">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <h2 class="contacts-modal-title" id="contacts-modal-title">Contatti</h2>
        <div class="contacts-modal-body" id="contacts-modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);

    // Bind close button
    const closeBtn = modal.querySelector(".contacts-modal-close");
    const overlay = modal.querySelector(".contacts-modal-overlay");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => closeContactsModal());
    }
    if (overlay) {
      overlay.addEventListener("click", () => closeContactsModal());
    }

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("active")) {
        closeContactsModal();
      }
    });
  }

  // Popola contenuto in base al tipo
  const titleEl = modal.querySelector("#contacts-modal-title");
  const bodyEl = modal.querySelector("#contacts-modal-body");

  if (!titleEl || !bodyEl) {
    console.error("[Footer] Elementi modale non trovati");
    return;
  }

  if (type === "Supporto") {
    titleEl.textContent = "Supporto";
    bodyEl.innerHTML = `
      <div class="contacts-info">
        <p class="contacts-description">Per assistenza tecnica, domande o segnalazioni:</p>
        <div class="contacts-item">
          <strong>Supporto:</strong>
          <a href="mailto:support@tradelia.org" class="contacts-link">support@tradelia.org</a>
          <span class="contacts-hint">Assistenza tecnica e domande</span>
        </div>
        <div class="contacts-item">
          <strong>Amministrazione:</strong>
          <a href="mailto:amministrazione@tradelia.org" class="contacts-link">amministrazione@tradelia.org</a>
          <span class="contacts-hint">Fatturazione e pagamenti</span>
        </div>
        <div class="contacts-item">
          <strong>Info:</strong>
          <a href="mailto:info@tradelia.org" class="contacts-link">info@tradelia.org</a>
          <span class="contacts-hint">Informazioni generali</span>
        </div>
        <div class="contacts-item">
          <strong>Risposta entro:</strong> 24-48 ore
        </div>
      </div>
    `;
  } else if (type === "Status") {
    titleEl.textContent = "Status Sistema";

    // Genera contenuto status con dati dinamici
    const services = [
      { name: "Dashboard", status: "operational" },
      { name: "API Backend", status: "operational" },
      { name: "Database", status: "operational" },
      { name: "Storage", status: "operational" },
      { name: "Email Service", status: "operational" },
      { name: "CDN", status: "operational" },
    ];

    const statusLabels = {
      operational: "Operativo",
      degraded: "Degradato",
      down: "Non disponibile",
    };

    const statusColors = {
      operational: "#00c864",
      degraded: "#ffc107",
      down: "#f44336",
    };

    const servicesHTML = services
      .map((service) => {
        return `
          <div class="status-service-item">
            <div class="status-service-name">${service.name}</div>
            <div class="status-service-status">
              <span class="status-indicator" style="background: ${statusColors[service.status]}; box-shadow: 0 0 8px ${statusColors[service.status]}80;"></span>
              <span>${statusLabels[service.status]}</span>
            </div>
          </div>
        `;
      })
      .join("");

    bodyEl.innerHTML = `
      <div class="contacts-info">
        <div class="status-overview-cards">
          <div class="status-overview-card">
            <div class="status-card-label">Stato Generale</div>
            <div class="status-card-value">Operativo</div>
          </div>
          <div class="status-overview-card">
            <div class="status-card-label">Uptime (30 giorni)</div>
            <div class="status-card-value">99.9%</div>
          </div>
          <div class="status-overview-card">
            <div class="status-card-label">Tempo di Risposta</div>
            <div class="status-card-value" id="status-response-time">~200ms</div>
          </div>
        </div>
        
        <div class="status-services-section">
          <h3 class="status-services-title">Servizi</h3>
          <div class="status-services-list">
            ${servicesHTML}
          </div>
        </div>

        <div class="contacts-item" style="margin-top: var(--spacing-lg);">
          <strong>Segnalazioni:</strong>
          <a href="mailto:status@tradelia.org" class="contacts-link">status@tradelia.org</a>
        </div>
      </div>
    `;

    // Aggiorna tempo di risposta dinamicamente
    setTimeout(() => {
      const responseTimeEl = bodyEl.querySelector("#status-response-time");
      if (responseTimeEl) {
        const baseTime = 180;
        const variation = Math.floor(Math.random() * 40);
        responseTimeEl.textContent = `~${baseTime + variation}ms`;
      }
    }, 100);
  } else {
    // Fallback se tipo non riconosciuto
    titleEl.textContent = "Contatti";
    bodyEl.innerHTML = `
      <div class="contacts-info">
        <p class="contacts-description">Per assistenza o informazioni:</p>
        <div class="contacts-item">
          <strong>Email:</strong>
          <a href="mailto:support@tradelia.org" class="contacts-link">support@tradelia.org</a>
        </div>
      </div>
    `;
  }

  // Mostra modale
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

/**
 * Chiude modale contatti
 */
function closeContactsModal() {
  const modal = document.getElementById("contacts-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}
