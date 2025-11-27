/* eslint-env browser */
/**
 * Personalized Learning Paths
 * Paper: Koedinger et al. (2013), Pardo & Siemens (2014)
 * "Personalized Learning: A Review of Literature"
 *
 * Percorsi formativi personalizzati basati su:
 * - Performance passate
 * - Obiettivi utente
 * - Aree di debolezza
 * - Preferenze di apprendimento
 */

import { safeLog, escapeHtml } from "./security-utils.js";

const API_BASE = "/api/education";

/**
 * Get personalized learning path recommendations
 * Paper: Koedinger et al. (2013) - Adaptive learning paths
 */
export async function getPersonalizedPath(userId, options = {}) {
  try {
    const token = await getAuthToken();
    const { goal, focusArea, difficulty } = options;

    const params = new URLSearchParams();
    if (goal) {
      params.append("goal", goal);
    }
    if (focusArea) {
      params.append("focusArea", focusArea);
    }
    if (difficulty) {
      params.append("difficulty", difficulty);
    }

    const response = await fetch(`${API_BASE}?action=personalized-path&${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Errore caricamento percorso personalizzato");
    }

    const { path } = await response.json();
    return path;
  } catch (error) {
    safeLog("error", "[Personalized Paths] Errore getPersonalizedPath:", error);
    throw error;
  }
}

/**
 * Initialize personalized path selector
 */
export async function initPersonalizedPathSelector() {
  const container = document.getElementById("education-container");
  if (!container) {
    safeLog("warn", "[Personalized Paths] Container non trovato");
    return;
  }

  // Navigate to personalized path view
  window.history.pushState({ view: "personalized-paths" }, "", "#education/personalized-paths");

  await loadPersonalizedPathSelector(container);
}

/**
 * Load personalized path selector
 */
async function loadPersonalizedPathSelector(container) {
  try {
    // Show path configuration modal
    const pathConfig = await showPathConfigurationModal();

    if (!pathConfig) {
      // User cancelled
      window.history.pushState({ view: "dashboard" }, "", "#education");
      import("./education.js").then(({ initEducation }) => initEducation());
      return;
    }

    // Fetch personalized path
    container.innerHTML = `
      <div class="personalized-path-loading">
        <div class="spinner"></div>
        <p>Generazione percorso personalizzato...</p>
      </div>
    `;

    const path = await getPersonalizedPath(null, pathConfig);

    // Render personalized path
    renderPersonalizedPath(container, path, pathConfig);
  } catch (error) {
    safeLog("error", "[Personalized Paths] Errore loadPersonalizedPathSelector:", error);
    container.innerHTML = `
      <div class="error-state">
        <h3>Errore generazione percorso</h3>
        <p>Riprova più tardi.</p>
        <button class="btn btn-primary" data-action="back-to-education">Torna alla Formazione</button>
      </div>
    `;

    // Bind breadcrumb events
    container.querySelector("[data-action='back-to-education']")?.addEventListener("click", (e) => {
      e.preventDefault();
      window.history.pushState({ view: "dashboard" }, "", "#education");
      import("./education.js").then(({ initEducation }) => initEducation());
    });
    
    container.querySelector("[data-action='back-to-dashboard']")?.addEventListener("click", (e) => {
      e.preventDefault();
      window.history.pushState({ view: "dashboard-overview" }, "", "#overview");
      const event = new CustomEvent("dashboard-navigate", { detail: { module: "overview" } });
      window.dispatchEvent(event);
    });
  }
}

/**
 * Show path configuration modal
 */
function showPathConfigurationModal() {
  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className = "personalized-path-modal";
    modal.innerHTML = `
      <div class="pp-modal-overlay" data-dismiss></div>
      <div class="pp-modal-content">
        <div class="pp-modal-header">
          <h3>Percorso Personalizzato</h3>
          <button class="pp-modal-close" data-dismiss aria-label="Chiudi">×</button>
        </div>
        <div class="pp-modal-body">
          <p class="pp-description">
            Crea un percorso formativo personalizzato basato sui tuoi obiettivi e performance.
            Paper: Koedinger et al. (2013) - Adaptive learning paths.
          </p>

          <div class="pp-form-group">
            <label>
              <span>Qual è il tuo obiettivo principale?</span>
              <select id="pp-goal" class="pp-select">
                <option value="">Seleziona obiettivo</option>
                <option value="foundations">Fondamenti Finanziari</option>
                <option value="trading">Trading Avanzato</option>
                <option value="analysis">Analisi Tecnica</option>
                <option value="risk">Gestione del Rischio</option>
                <option value="portfolio">Gestione Portafoglio</option>
              </select>
            </label>
          </div>

          <div class="pp-form-group">
            <label>
              <span>Area su cui vuoi concentrarti? (opzionale)</span>
              <select id="pp-focus-area" class="pp-select">
                <option value="">Nessuna preferenza</option>
                <option value="weak">Aree di Debolezza</option>
                <option value="strong">Rafforza Aree Forti</option>
                <option value="new">Nuovi Argomenti</option>
              </select>
            </label>
          </div>

          <div class="pp-form-group">
            <label>
              <span>Livello di difficoltà preferito?</span>
              <select id="pp-difficulty" class="pp-select">
                <option value="">Adattivo (consigliato)</option>
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzato</option>
              </select>
            </label>
          </div>
        </div>
        <div class="pp-modal-footer">
          <button class="btn btn-secondary" data-dismiss>Annulla</button>
          <button class="btn btn-primary" data-submit>Genera Percorso</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const submitBtn = modal.querySelector("[data-submit]");
    const goalSelect = modal.querySelector("#pp-goal");

    submitBtn.disabled = !goalSelect.value;

    goalSelect.addEventListener("change", () => {
      submitBtn.disabled = !goalSelect.value;
    });

    submitBtn.addEventListener("click", () => {
      const goal = goalSelect.value;
      const focusArea = modal.querySelector("#pp-focus-area").value;
      const difficulty = modal.querySelector("#pp-difficulty").value;

      if (goal) {
        closeModal(modal);
        resolve({ goal, focusArea, difficulty });
      }
    });

    modal.querySelectorAll("[data-dismiss]").forEach((btn) => {
      btn.addEventListener("click", () => {
        closeModal(modal);
        resolve(null);
      });
    });
  });
}

/**
 * Render personalized path
 */
function renderPersonalizedPath(container, path, config) {
  const { modules, estimatedTime, difficulty, description } = path;

  // Breadcrumb sticky sempre presente
  const breadcrumb = `
    <nav class="education-breadcrumb" aria-label="Breadcrumb navigation">
      <ol class="breadcrumb-list" itemscope itemtype="https://schema.org/BreadcrumbList">
        <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a href="#overview" data-action="back-to-dashboard" itemprop="item">
            <span itemprop="name">Dashboard</span>
          </a>
          <meta itemprop="position" content="1" />
        </li>
        <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a href="#education" data-action="back-to-education" itemprop="item">
            <span itemprop="name">Formazione</span>
          </a>
          <meta itemprop="position" content="2" />
        </li>
        <li class="breadcrumb-item breadcrumb-current" 
            aria-current="page"
            itemprop="itemListElement" 
            itemscope 
            itemtype="https://schema.org/ListItem">
          <span itemprop="name">Percorso Personalizzato</span>
          <meta itemprop="position" content="3" />
        </li>
      </ol>
    </nav>
  `;

  container.innerHTML = `
    ${breadcrumb}
    <div class="personalized-path-view">
      <div class="pp-header">
        <div class="pp-header-content">
          <h1 class="pp-title">Il Tuo Percorso Personalizzato</h1>
          <p class="pp-description">${escapeHtml(description || "Percorso ottimizzato per i tuoi obiettivi")}</p>
          <div class="pp-meta">
            <span>${modules.length} moduli</span>
            <span>•</span>
            <span>${estimatedTime || "Variabile"} ore stimate</span>
            ${difficulty ? `<span>•</span><span>Livello: ${difficulty}</span>` : ""}
          </div>
        </div>
      </div>

      <div class="pp-modules">
        ${modules.map((module, index) => renderPathModule(module, index + 1)).join("")}
      </div>

      <div class="pp-actions">
        <button class="btn btn-primary" data-action="start-path">
          Inizia Percorso
        </button>
        <button class="btn btn-secondary" data-action="regenerate-path">
          Rigenera Percorso
        </button>
      </div>
    </div>
  `;

  // Bind events
  container.querySelector("[data-action='back-to-education']")?.addEventListener("click", () => {
    window.history.pushState({ view: "dashboard" }, "", "#education");
    import("./education.js").then(({ initEducation }) => initEducation());
  });

  container.querySelector("[data-action='start-path']")?.addEventListener("click", async () => {
    if (modules.length > 0) {
      const firstModule = modules[0];
      const { openModule } = await import("./education.js");
      await openModule(firstModule.id);
    }
  });

  container.querySelectorAll("[data-action='open-module']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const moduleId = btn.dataset.moduleId;
      const { openModule } = await import("./education.js");
      await openModule(moduleId);
    });
  });

  container
    .querySelector("[data-action='regenerate-path']")
    ?.addEventListener("click", async () => {
      await loadPersonalizedPathSelector(container);
    });
}

/**
 * Render path module
 */
function renderPathModule(module, order) {
  const progress = module.userProgress || { progress_percentage: 0, status: "not_started" };
  const progressPct = progress.progress_percentage || 0;

  return `
    <div class="pp-module-card ${progress.status}">
      <div class="pp-module-order">${order}</div>
      <div class="pp-module-content">
        <div class="pp-module-header">
          <h3 class="pp-module-title">${escapeHtml(module.title)}</h3>
          ${
            module.reason
              ? `
            <span class="pp-module-reason" title="Perché questo modulo">
              ${escapeHtml(module.reason)}
            </span>
          `
              : ""
          }
        </div>
        <p class="pp-module-description">${escapeHtml(module.description || "")}</p>
        <div class="pp-module-progress">
          <div class="pp-progress-bar">
            <div class="pp-progress-fill" style="width: ${progressPct}%"></div>
          </div>
          <span class="pp-progress-text">${progressPct}% completato</span>
        </div>
        <div class="pp-module-meta">
          <span>${module.lessons_count || 0} lezioni</span>
          <span>•</span>
          <span>${module.estimated_hours || 0} ore</span>
        </div>
      </div>
      <div class="pp-module-actions">
        <button class="btn btn-primary btn-sm" data-action="open-module" data-module-id="${module.id}">
          ${progress.status === "completed" ? "Rivedi" : progress.status === "in_progress" ? "Continua" : "Inizia"}
        </button>
      </div>
    </div>
  `;
}

/**
 * Helper functions
 */
function closeModal(modal) {
  modal.style.opacity = "0";
  setTimeout(() => {
    modal.remove();
  }, 200);
}

/**
 * Helper: Get auth token
 */
async function getAuthToken() {
  try {
    const { getToken } = await import("./token-storage.js");
    return await getToken();
  } catch (e) {
    return null;
  }
}
