/**
 * Dashboard Global Search
 * Ricerca globale con autocomplete, filtri e keyboard shortcuts
 * Best Practice: Separazione concerns - ricerca separata da navigazione
 */

import { safeLog } from "./security-utils.js";

// Global search state
const SEARCH_STATE = {
  isOpen: false,
  query: "",
  results: [],
  selectedIndex: -1,
  searchHistory: [],
};

// Keyboard shortcuts (kept for future reference)
// const SEARCH_SHORTCUT = {
//   open: 'ctrl+k',
//   macOpen: 'meta+k',
//   close: 'escape',
//   navigateDown: 'arrowdown',
//   navigateUp: 'arrowup',
//   select: 'enter',
// };

/**
 * Initialize global search
 */
export function initGlobalSearch() {
  createSearchModal();
  setupKeyboardShortcuts();
  setupSearchInput();
  loadSearchHistory();
}

/**
 * Create search modal structure
 */
function createSearchModal() {
  // Check if already exists
  if (document.getElementById("global-search-modal")) {
    return;
  }

  const modal = document.createElement("div");
  modal.id = "global-search-modal";
  modal.className = "global-search-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-label", "Ricerca globale");
  modal.setAttribute("aria-modal", "true");
  // BEST PRACTICE: aria-hidden inizialmente true (modal chiuso)
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="global-search-overlay" aria-hidden="true"></div>
    <div class="global-search-content">
      <div class="global-search-header">
        <div class="global-search-input-wrapper">
          <svg class="global-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            id="global-search-input"
            class="global-search-input"
            placeholder="Cerca report, framework, risorse..."
            autocomplete="off"
            spellcheck="false"
            aria-label="Ricerca globale"
            aria-autocomplete="list"
            aria-controls="global-search-results"
            aria-expanded="false"
          />
          <button
            type="button"
            id="global-search-clear"
            class="global-search-clear"
            aria-label="Pulisci ricerca"
            style="display: none;"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <button
          type="button"
          id="global-search-close"
          class="global-search-close"
          aria-label="Chiudi ricerca"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div id="global-search-results" class="global-search-results" role="listbox" aria-label="Risultati ricerca">
        <div class="global-search-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="48" height="48">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <div class="global-search-empty-text">Inizia a digitare per cercare...</div>
          <div class="global-search-hint">
            <kbd>Ctrl</kbd> + <kbd>K</kbd> per aprire rapidamente
          </div>
        </div>
      </div>
      <div class="global-search-footer">
        <div class="global-search-hints">
          <div class="global-search-hint-item">
            <kbd>↑</kbd><kbd>↓</kbd> per navigare
          </div>
          <div class="global-search-hint-item">
            <kbd>Enter</kbd> per aprire
          </div>
          <div class="global-search-hint-item">
            <kbd>Esc</kbd> per chiudere
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listeners
  setupSearchModalListeners();
}

/**
 * Setup search modal event listeners
 */
function setupSearchModalListeners() {
  const modal = document.getElementById("global-search-modal");
  const overlay = modal.querySelector(".global-search-overlay");
  const closeBtn = document.getElementById("global-search-close");
  const clearBtn = document.getElementById("global-search-clear");
  const input = document.getElementById("global-search-input");

  // Close on overlay click - BEST PRACTICE: Solo se modal è attivo
  overlay.addEventListener("click", (e) => {
    // BEST PRACTICE: Verifica che modal sia attivo prima di chiudere
    if (modal.classList.contains("active")) {
      e.stopPropagation(); // BEST PRACTICE: Evita propagazione
      closeSearch();
    }
  });

  // Close on close button
  closeBtn.addEventListener("click", () => closeSearch());

  // Clear input
  clearBtn.addEventListener("click", () => {
    input.value = "";
    input.focus();
    clearBtn.style.display = "none";
    SEARCH_STATE.query = "";
    SEARCH_STATE.results = [];
    SEARCH_STATE.selectedIndex = -1;
    showEmptyState();
  });

  // Input events
  input.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    clearBtn.style.display = query ? "block" : "none";

    if (query.length >= 2) {
      performSearch(query);
    } else {
      SEARCH_STATE.query = "";
      SEARCH_STATE.results = [];
      SEARCH_STATE.selectedIndex = -1;
      showEmptyState();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSearch();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      navigateResults(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      navigateResults(-1);
    } else if (e.key === "Enter" && SEARCH_STATE.selectedIndex >= 0) {
      e.preventDefault();
      selectResult(SEARCH_STATE.selectedIndex);
    }
  });

  // Focus trap
  modal.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Check if input is focused (don't trigger if typing in input)
    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA" ||
      e.target.isContentEditable
    ) {
      // Allow Ctrl+K / Cmd+K even when input is focused
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isOpenShortcut =
        (!isMac && e.ctrlKey && e.key === "k") || (isMac && e.metaKey && e.key === "k");

      if (isOpenShortcut) {
        e.preventDefault();
        openSearch();
      }
      return;
    }

    // Global shortcuts
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const isOpenShortcut =
      (!isMac && e.ctrlKey && e.key === "k") || (isMac && e.metaKey && e.key === "k");

    if (isOpenShortcut) {
      e.preventDefault();
      openSearch();
    }
  });
}

/**
 * Setup search input in header (optional)
 */
function setupSearchInput() {
  // Add search trigger button to header if needed
  const header = document.querySelector(".dashboard-header-content");
  if (header && !document.getElementById("global-search-trigger")) {
    const trigger = document.createElement("button");
    trigger.id = "global-search-trigger";
    trigger.className = "global-search-trigger";
    trigger.setAttribute("aria-label", "Apri ricerca (Ctrl+K)");
    trigger.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20" class="global-search-trigger-icon">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <span class="global-search-trigger-text">Cerca</span>
      <kbd class="global-search-trigger-kbd">Ctrl+K</kbd>
    `;
    trigger.addEventListener("click", () => openSearch());
    header.appendChild(trigger);
  }
}

/**
 * Open search modal
 */
function openSearch() {
  const modal = document.getElementById("global-search-modal");
  if (!modal) {
    return;
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
  SEARCH_STATE.isOpen = true;

  // BEST PRACTICE: Abilita overlay quando modal è aperto
  const overlay = modal.querySelector(".global-search-overlay");
  if (overlay) {
    overlay.style.pointerEvents = "auto";
    overlay.style.display = "block";
  }

  // BEST PRACTICE: Rimuovi aria-hidden PRIMA di dare focus per evitare errori accessibilità
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-hidden", "false");

  const input = document.getElementById("global-search-input");
  if (input) {
    // BEST PRACTICE: Focus dopo aver rimosso aria-hidden
    setTimeout(() => {
      input.focus();
      if (SEARCH_STATE.query) {
        input.value = SEARCH_STATE.query;
      }
    }, 0);
  }
}

/**
 * Close search modal
 */
function closeSearch() {
  const modal = document.getElementById("global-search-modal");
  if (!modal) {
    return;
  }

  // BEST PRACTICE: Rimuovi focus da elementi dentro modal PRIMA di nasconderlo
  const focusedElement = document.activeElement;
  if (modal.contains(focusedElement)) {
    focusedElement.blur();
  }

  modal.classList.remove("active");
  document.body.style.overflow = "";
  SEARCH_STATE.isOpen = false;

  const input = document.getElementById("global-search-input");
  if (input) {
    input.value = "";
    SEARCH_STATE.query = "";
    SEARCH_STATE.results = [];
    SEARCH_STATE.selectedIndex = -1;
  }

  // BEST PRACTICE: Imposta aria-hidden DOPO aver rimosso focus
  modal.setAttribute("aria-hidden", "true");

  // BEST PRACTICE: Assicura che overlay sia completamente disabilitato quando chiuso
  const overlay = modal.querySelector(".global-search-overlay");
  if (overlay) {
    overlay.style.pointerEvents = "none";
    overlay.style.display = "none";
  }
}

/**
 * Perform search
 */
async function performSearch(query) {
  SEARCH_STATE.query = query;
  SEARCH_STATE.selectedIndex = -1;

  const results = [];

  // Search in reports
  const reportsResults = await searchReports(query);
  results.push(...reportsResults.map((r) => ({ ...r, type: "report" })));

  // Search in modules (framework, resources, etc.)
  const modulesResults = searchModules(query);
  results.push(...modulesResults.map((r) => ({ ...r, type: "module" })));

  // Search in help/content
  const contentResults = searchContent(query);
  results.push(...contentResults.map((r) => ({ ...r, type: "content" })));

  SEARCH_STATE.results = results;
  renderResults(results);

  // Save to history
  saveToHistory(query);
}

/**
 * Search in reports
 */
async function searchReports(query) {
  const results = [];

  try {
    // BEST PRACTICE: Gestione errore 404 per manifest.json
    let manifestResponse;
    try {
      manifestResponse = await fetch(`/archivio/manifest.json?t=${Date.now()}`);
      if (!manifestResponse.ok) {
        safeLog("warn", "[GlobalSearch] manifest.json non trovato");
        return [];
      }
    } catch (error) {
      safeLog("warn", "[GlobalSearch] Errore caricamento manifest.json:", error);
      return [];
    }
    if (!manifestResponse.ok) {
      return results;
    }

    const manifest = await manifestResponse.json();
    const reportDirs = Array.isArray(manifest.reports)
      ? manifest.reports.map((r) => (typeof r === "string" ? r : r.id)).filter(Boolean)
      : manifest.dirs || [];

    const lowerQuery = query.toLowerCase();

    for (const dir of reportDirs.slice(0, 50)) {
      try {
        const headerResponse = await fetch(`/archivio/reports/${dir}/header.json?t=${Date.now()}`);
        if (headerResponse.ok) {
          const header = await headerResponse.json();
          const ticker = (header.ticker || header.asset || "").toLowerCase();
          const company = (header.company || header.asset_name || "").toLowerCase();
          const sector = (header.sector || "").toLowerCase();

          if (
            ticker.includes(lowerQuery) ||
            company.includes(lowerQuery) ||
            sector.includes(lowerQuery) ||
            dir.toLowerCase().includes(lowerQuery)
          ) {
            results.push({
              id: dir,
              title: header.ticker || header.asset || dir,
              subtitle: header.company || header.asset_name || "",
              date: header.date || header.timestamp || "",
              url: `/archivio/reports/${dir}/`,
              icon: "report",
            });
          }
        }
      } catch {
        // Skip failed requests
      }
    }
  } catch (e) {
    safeLog("error", "[GlobalSearch] Errore ricerca report:", e);
  }

  return results.slice(0, 10);
}

/**
 * Search in modules
 */
function searchModules(query) {
  const results = [];
  const lowerQuery = query.toLowerCase();

  const modules = [
    {
      id: "overview",
      title: "Panoramica",
      description: "Statistiche e attività recente",
      url: "#overview",
    },
    {
      id: "reports",
      title: "Report Ufficiali",
      description: "Consulta i report pubblici",
      url: "#reports",
    },
    {
      id: "frameworks",
      title: "Framework Documentation",
      description: "SRD, MTB, PAC",
      url: "#frameworks",
    },
    { id: "education", title: "Formazione", description: "Percorsi formativi", url: "#education" },
    { id: "resources", title: "Risorse", description: "Risorse utili", url: "#resources" },
    {
      id: "settings",
      title: "Impostazioni",
      description: "Preferenze e configurazioni",
      url: "#settings",
    },
  ];

  modules.forEach((module) => {
    if (
      module.title.toLowerCase().includes(lowerQuery) ||
      module.description.toLowerCase().includes(lowerQuery) ||
      module.id.toLowerCase().includes(lowerQuery)
    ) {
      results.push({
        id: module.id,
        title: module.title,
        subtitle: module.description,
        url: module.url,
        icon: "module",
      });
    }
  });

  return results.slice(0, 10);
}

/**
 * Search in content/help
 */
function searchContent(_query) {
  // Placeholder for future content search
  return [];
}

/**
 * Render search results
 */
function renderResults(results) {
  const container = document.getElementById("global-search-results");
  if (!container) {
    return;
  }

  if (results.length === 0) {
    // SECURITY: Usa textContent per evitare XSS
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "global-search-empty";
    emptyDiv.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="48" height="48">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
        <line x1="11" y1="8" x2="11" y2="12" />
        <line x1="11" y1="16" x2="11.01" y2="16" />
      </svg>
    `;
    const textDiv = document.createElement("div");
    textDiv.className = "global-search-empty-text";
    textDiv.textContent = `Nessun risultato per "${SEARCH_STATE.query}"`;
    const hintDiv = document.createElement("div");
    hintDiv.className = "global-search-empty-hint";
    hintDiv.textContent = "Prova con termini diversi";
    emptyDiv.appendChild(textDiv);
    emptyDiv.appendChild(hintDiv);
    container.appendChild(emptyDiv);
    return;
  }

  // SECURITY: Sanitizza risultati prima di inserirli
  container.innerHTML = results
    .map((result, index) => {
      const iconSVG = getIconSVG(result.icon || result.type);
      const date = result.date ? new Date(result.date).toLocaleDateString("it-IT") : "";

      // SECURITY: Escape HTML nei dati dinamici usando funzione esistente
      const safeUrl = escapeHtml(result.url || "#");

      return `
        <div
          class="global-search-result ${index === SEARCH_STATE.selectedIndex ? "selected" : ""}"
          data-index="${index}"
          data-url="${safeUrl}"
          role="option"
          aria-selected="${index === SEARCH_STATE.selectedIndex}"
        >
          <div class="global-search-result-icon">
            ${iconSVG}
          </div>
          <div class="global-search-result-content">
            <div class="global-search-result-title">${escapeHtml(result.title)}</div>
            <div class="global-search-result-subtitle">
              ${escapeHtml(result.subtitle || "")}
              ${date ? ` · ${date}` : ""}
            </div>
          </div>
          <div class="global-search-result-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      `;
    })
    .join("");

  // Add click listeners
  container.querySelectorAll(".global-search-result").forEach((el) => {
    el.addEventListener("click", () => {
      const index = parseInt(el.dataset.index, 10);
      selectResult(index);
    });
  });
}

/**
 * Get icon SVG for result type
 */
function getIconSVG(type) {
  const icons = {
    report: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    `,
    module: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    `,
    content: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    `,
  };

  return icons[type] || icons.content;
}

/**
 * Navigate results with arrow keys
 */
function navigateResults(direction) {
  if (SEARCH_STATE.results.length === 0) {
    return;
  }

  SEARCH_STATE.selectedIndex += direction;

  if (SEARCH_STATE.selectedIndex < 0) {
    SEARCH_STATE.selectedIndex = SEARCH_STATE.results.length - 1;
  } else if (SEARCH_STATE.selectedIndex >= SEARCH_STATE.results.length) {
    SEARCH_STATE.selectedIndex = 0;
  }

  renderResults(SEARCH_STATE.results);

  // Scroll selected into view
  const selected = document.querySelector(
    `.global-search-result[data-index="${SEARCH_STATE.selectedIndex}"]`
  );
  if (selected) {
    selected.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

/**
 * Select result and navigate
 */
function selectResult(index) {
  if (index < 0 || index >= SEARCH_STATE.results.length) {
    return;
  }

  const result = SEARCH_STATE.results[index];

  // Close search
  closeSearch();

  // Navigate to result
  if (result.url) {
    if (result.url.startsWith("#")) {
      window.location.hash = result.url.slice(1);
    } else {
      window.location.href = result.url;
    }
  }
}

/**
 * Show empty state
 */
function showEmptyState() {
  const container = document.getElementById("global-search-results");
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="global-search-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="48" height="48">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <div class="global-search-empty-text">Inizia a digitare per cercare...</div>
      <div class="global-search-hint">
        <kbd>Ctrl</kbd> + <kbd>K</kbd> per aprire rapidamente
      </div>
    </div>
  `;
}

/**
 * Load search history
 */
function loadSearchHistory() {
  try {
    const history = localStorage.getItem("dashboard-search-history");
    if (history) {
      SEARCH_STATE.searchHistory = JSON.parse(history);
    }
  } catch (e) {
    safeLog("error", "[GlobalSearch] Errore caricamento history:", e);
  }
}

/**
 * Save query to history
 */
function saveToHistory(query) {
  if (!query || query.length < 2) {
    return;
  }

  // Remove if exists
  SEARCH_STATE.searchHistory = SEARCH_STATE.searchHistory.filter((q) => q !== query);

  // Add to front
  SEARCH_STATE.searchHistory.unshift(query);

  // Keep last 10
  SEARCH_STATE.searchHistory = SEARCH_STATE.searchHistory.slice(0, 10);

  // Save
  try {
    localStorage.setItem("dashboard-search-history", JSON.stringify(SEARCH_STATE.searchHistory));
  } catch (e) {
    safeLog("error", "[GlobalSearch] Errore salvataggio history:", e);
  }
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Export for use in other modules
export { openSearch, closeSearch };
