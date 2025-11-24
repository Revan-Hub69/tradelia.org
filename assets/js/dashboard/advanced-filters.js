/**
 * Dashboard Advanced Filters
 * Filtri avanzati multi-criterio per report
 * Best Practice: Separazione concerns - filtri separati da rendering
 */

const FILTER_STATE = {
  filters: {
    ticker: "",
    company: "",
    exchange: "",
    sector: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "date",
    sortOrder: "desc",
  },
  savedFilters: [],
};

/**
 * Initialize advanced filters
 */
export function initAdvancedFilters() {
  loadSavedFilters();
  createFilterUI();
  setupFilterListeners();
}

/**
 * Create filter UI
 */
function createFilterUI() {
  const reportsToolbar = document.querySelector(".reports-toolbar");
  if (!reportsToolbar || document.getElementById("advanced-filters-toggle")) {
    return;
  }

  const filtersToggle = document.createElement("button");
  filtersToggle.id = "advanced-filters-toggle";
  filtersToggle.className = "btn btn-secondary";
  filtersToggle.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
    Filtri Avanzati
  `;
  filtersToggle.addEventListener("click", () => toggleFiltersPanel());

  reportsToolbar.appendChild(filtersToggle);

  // Create filters panel
  const filtersPanel = document.createElement("div");
  filtersPanel.id = "advanced-filters-panel";
  filtersPanel.className = "advanced-filters-panel";
  filtersPanel.style.display = "none";
  filtersPanel.innerHTML = `
    <div class="advanced-filters-content">
      <div class="advanced-filters-header">
        <h3 class="advanced-filters-title">Filtri Avanzati</h3>
        <button class="advanced-filters-close" aria-label="Chiudi filtri">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div class="advanced-filters-body">
        <div class="advanced-filters-grid">
          <div class="advanced-filter-group">
            <label class="advanced-filter-label">Ticker</label>
            <input type="text" id="filter-ticker" class="advanced-filter-input" placeholder="Cerca per ticker..." />
          </div>
          <div class="advanced-filter-group">
            <label class="advanced-filter-label">Azienda</label>
            <input type="text" id="filter-company" class="advanced-filter-input" placeholder="Cerca per azienda..." />
          </div>
          <div class="advanced-filter-group">
            <label class="advanced-filter-label">Exchange</label>
            <select id="filter-exchange" class="advanced-filter-select">
              <option value="">Tutti</option>
              <option value="NYSE">NYSE</option>
              <option value="NASDAQ">NASDAQ</option>
              <option value="LSE">LSE</option>
              <option value="EURONEXT">EURONEXT</option>
            </select>
          </div>
          <div class="advanced-filter-group">
            <label class="advanced-filter-label">Settore</label>
            <input type="text" id="filter-sector" class="advanced-filter-input" placeholder="Cerca per settore..." />
          </div>
          <div class="advanced-filter-group">
            <label class="advanced-filter-label">Da Data</label>
            <input type="date" id="filter-date-from" class="advanced-filter-input" />
          </div>
          <div class="advanced-filter-group">
            <label class="advanced-filter-label">A Data</label>
            <input type="date" id="filter-date-to" class="advanced-filter-input" />
          </div>
        </div>
        <div class="advanced-filters-sort">
          <label class="advanced-filter-label">Ordina per</label>
          <select id="filter-sort-by" class="advanced-filter-select">
            <option value="date">Data</option>
            <option value="ticker">Ticker</option>
            <option value="company">Azienda</option>
          </select>
          <select id="filter-sort-order" class="advanced-filter-select">
            <option value="desc">Decrescente</option>
            <option value="asc">Crescente</option>
          </select>
        </div>
        <div class="advanced-filters-saved">
          <label class="advanced-filter-label">Filtri Salvati</label>
          <div id="saved-filters-list" class="saved-filters-list"></div>
        </div>
      </div>
      <div class="advanced-filters-footer">
        <button class="btn btn-secondary" id="reset-filters">Reset</button>
        <button class="btn btn-secondary" id="save-filter">Salva Filtro</button>
        <button class="btn btn-primary" id="apply-filters">Applica Filtri</button>
      </div>
    </div>
  `;

  document.body.appendChild(filtersPanel);

  // Close button
  filtersPanel
    .querySelector(".advanced-filters-close")
    .addEventListener("click", () => toggleFiltersPanel());
}

/**
 * Setup filter listeners
 */
function setupFilterListeners() {
  const applyBtn = document.getElementById("apply-filters");
  const resetBtn = document.getElementById("reset-filters");
  const saveBtn = document.getElementById("save-filter");

  if (applyBtn) {
    applyBtn.addEventListener("click", () => applyFilters());
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => resetFilters());
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", () => saveCurrentFilter());
  }

  // Real-time filter updates
  [
    "ticker",
    "company",
    "exchange",
    "sector",
    "date-from",
    "date-to",
    "sort-by",
    "sort-order",
  ].forEach((id) => {
    const input = document.getElementById(`filter-${id}`);
    if (input) {
      input.addEventListener("change", () => {
        updateFilterState();
      });
    }
  });
}

/**
 * Toggle filters panel
 */
function toggleFiltersPanel() {
  const panel = document.getElementById("advanced-filters-panel");
  if (!panel) {
    return;
  }

  const isVisible = panel.style.display !== "none";
  panel.style.display = isVisible ? "none" : "block";

  if (!isVisible) {
    loadFilterState();
    renderSavedFilters();
  }
}

/**
 * Update filter state
 */
function updateFilterState() {
  FILTER_STATE.filters = {
    ticker: document.getElementById("filter-ticker")?.value || "",
    company: document.getElementById("filter-company")?.value || "",
    exchange: document.getElementById("filter-exchange")?.value || "",
    sector: document.getElementById("filter-sector")?.value || "",
    dateFrom: document.getElementById("filter-date-from")?.value || "",
    dateTo: document.getElementById("filter-date-to")?.value || "",
    sortBy: document.getElementById("filter-sort-by")?.value || "date",
    sortOrder: document.getElementById("filter-sort-order")?.value || "desc",
  };
}

/**
 * Load filter state from inputs
 */
function loadFilterState() {
  FILTER_STATE.filters.ticker &&
    (document.getElementById("filter-ticker").value = FILTER_STATE.filters.ticker);
  FILTER_STATE.filters.company &&
    (document.getElementById("filter-company").value = FILTER_STATE.filters.company);
  FILTER_STATE.filters.exchange &&
    (document.getElementById("filter-exchange").value = FILTER_STATE.filters.exchange);
  FILTER_STATE.filters.sector &&
    (document.getElementById("filter-sector").value = FILTER_STATE.filters.sector);
  FILTER_STATE.filters.dateFrom &&
    (document.getElementById("filter-date-from").value = FILTER_STATE.filters.dateFrom);
  FILTER_STATE.filters.dateTo &&
    (document.getElementById("filter-date-to").value = FILTER_STATE.filters.dateTo);
  document.getElementById("filter-sort-by").value = FILTER_STATE.filters.sortBy;
  document.getElementById("filter-sort-order").value = FILTER_STATE.filters.sortOrder;
}

/**
 * Apply filters
 */
export function applyFilters(reports) {
  if (!reports) {
    // Trigger filter event for reports module
    const event = new CustomEvent("advanced-filter-apply", {
      detail: { filters: FILTER_STATE.filters },
    });
    document.dispatchEvent(event);
    return;
  }

  updateFilterState();
  const filters = FILTER_STATE.filters;

  const filtered = reports.filter((report) => {
    if (filters.ticker && !report.ticker?.toLowerCase().includes(filters.ticker.toLowerCase())) {
      return false;
    }
    if (filters.company && !report.company?.toLowerCase().includes(filters.company.toLowerCase())) {
      return false;
    }
    if (filters.exchange && report.exchange !== filters.exchange) {
      return false;
    }
    if (filters.sector && !report.sector?.toLowerCase().includes(filters.sector.toLowerCase())) {
      return false;
    }
    if (filters.dateFrom && report.date && new Date(report.date) < new Date(filters.dateFrom)) {
      return false;
    }
    if (filters.dateTo && report.date && new Date(report.date) > new Date(filters.dateTo)) {
      return false;
    }
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    let aVal, bVal;
    if (filters.sortBy === "date") {
      aVal = a.date ? new Date(a.date).getTime() : 0;
      bVal = b.date ? new Date(b.date).getTime() : 0;
    } else if (filters.sortBy === "ticker") {
      aVal = (a.ticker || "").toLowerCase();
      bVal = (b.ticker || "").toLowerCase();
    } else {
      aVal = (a.company || "").toLowerCase();
      bVal = (b.company || "").toLowerCase();
    }

    if (filters.sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  return filtered;
}

/**
 * Reset filters
 */
function resetFilters() {
  FILTER_STATE.filters = {
    ticker: "",
    company: "",
    exchange: "",
    sector: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "date",
    sortOrder: "desc",
  };

  loadFilterState();
  applyFilters();
}

/**
 * Save current filter
 */
function saveCurrentFilter() {
  updateFilterState();
  const name = prompt("Nome per questo filtro salvato:");
  if (!name) {
    return;
  }

  const saved = {
    id: Date.now().toString(),
    name,
    filters: { ...FILTER_STATE.filters },
    createdAt: new Date().toISOString(),
  };

  FILTER_STATE.savedFilters.push(saved);
  saveSavedFilters();

  renderSavedFilters();

  if (window.showToast) {
    window.showToast("Filtro salvato con successo", "success");
  }
}

/**
 * Load saved filters
 */
function loadSavedFilters() {
  try {
    const saved = localStorage.getItem("dashboard-saved-filters");
    if (saved) {
      FILTER_STATE.savedFilters = JSON.parse(saved);
    }
  } catch (e) {
    console.error("[AdvancedFilters] Errore caricamento filtri salvati:", e);
  }
}

/**
 * Save saved filters
 */
function saveSavedFilters() {
  try {
    localStorage.setItem("dashboard-saved-filters", JSON.stringify(FILTER_STATE.savedFilters));
  } catch (e) {
    console.error("[AdvancedFilters] Errore salvataggio filtri:", e);
  }
}

/**
 * Render saved filters
 */
function renderSavedFilters() {
  const container = document.getElementById("saved-filters-list");
  if (!container) {
    return;
  }

  if (FILTER_STATE.savedFilters.length === 0) {
    container.innerHTML = '<div class="saved-filters-empty">Nessun filtro salvato</div>';
    return;
  }

  container.innerHTML = FILTER_STATE.savedFilters
    .map(
      (saved) => `
    <div class="saved-filter-item">
      <span class="saved-filter-name">${escapeHtml(saved.name)}</span>
      <div class="saved-filter-actions">
        <button class="saved-filter-apply" data-id="${saved.id}" aria-label="Applica filtro">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
        <button class="saved-filter-delete" data-id="${saved.id}" aria-label="Elimina filtro">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  `
    )
    .join("");

  // Add listeners
  container.querySelectorAll(".saved-filter-apply").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const saved = FILTER_STATE.savedFilters.find((f) => f.id === id);
      if (saved) {
        FILTER_STATE.filters = { ...saved.filters };
        loadFilterState();
        applyFilters();
      }
    });
  });

  container.querySelectorAll(".saved-filter-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      FILTER_STATE.savedFilters = FILTER_STATE.savedFilters.filter((f) => f.id !== id);
      saveSavedFilters();
      renderSavedFilters();
    });
  });
}

/**
 * Get current filters
 */
export function getCurrentFilters() {
  return { ...FILTER_STATE.filters };
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
