/**
 * Dashboard Watchlist / Preferiti
 * Sistema per salvare report/ticker preferiti per accesso rapido
 * Best Practice: Separazione concerns - watchlist separata da navigazione
 */

// Watchlist state
const WATCHLIST_STATE = {
  items: [],
};

/**
 * Initialize watchlist
 */
export function initWatchlist() {
  loadWatchlist();
  // Aggiorna badge all'inizializzazione
  updateWatchlistBadge();
}

/**
 * Load watchlist from localStorage
 */
function loadWatchlist() {
  try {
    const saved = localStorage.getItem("dashboard-watchlist");
    if (saved) {
      WATCHLIST_STATE.items = JSON.parse(saved);
    }
  } catch (e) {
    console.error("[Watchlist] Errore caricamento:", e);
    WATCHLIST_STATE.items = [];
  }
}

/**
 * Save watchlist to localStorage
 */
function saveWatchlist() {
  try {
    localStorage.setItem("dashboard-watchlist", JSON.stringify(WATCHLIST_STATE.items));
  } catch (e) {
    console.error("[Watchlist] Errore salvataggio:", e);
    if (window.showToast) {
      window.showToast("Errore nel salvataggio dei preferiti", "error");
    }
  }
}

/**
 * Check if item is in watchlist
 */
export function isInWatchlist(itemId) {
  return WATCHLIST_STATE.items.some((item) => item.id === itemId);
}

/**
 * Add item to watchlist
 */
export function addToWatchlist(item) {
  if (isInWatchlist(item.id)) {
    if (window.showToast) {
      window.showToast("Già presente nei preferiti", "info");
    }
    return false;
  }

  WATCHLIST_STATE.items.push({
    id: item.id,
    ticker: item.ticker || item.id,
    company: item.company || "",
    date: item.date || new Date().toISOString(),
    url: item.url || `#reports`,
    addedAt: new Date().toISOString(),
  });

  saveWatchlist();

  // Update UI
  updateWatchlistIndicators(item.id, true);

  if (window.showToast) {
    window.showToast("Aggiunto ai preferiti", "success");
  }

  return true;
}

/**
 * Remove item from watchlist
 */
export function removeFromWatchlist(itemId) {
  const index = WATCHLIST_STATE.items.findIndex((item) => item.id === itemId);
  if (index === -1) {
    return false;
  }

  WATCHLIST_STATE.items.splice(index, 1);
  saveWatchlist();

  // Update UI
  updateWatchlistIndicators(itemId, false);

  if (window.showToast) {
    window.showToast("Rimosso dai preferiti", "success");
  }

  return true;
}

/**
 * Toggle item in watchlist
 */
export function toggleWatchlist(item) {
  if (isInWatchlist(item.id)) {
    return removeFromWatchlist(item.id);
  } else {
    return addToWatchlist(item);
  }
}

/**
 * Get watchlist items
 */
export function getWatchlistItems() {
  return [...WATCHLIST_STATE.items];
}

/**
 * Update watchlist indicators in UI
 */
function updateWatchlistIndicators(itemId, isFavorite) {
  // Update all report cards with this ID
  document.querySelectorAll(`[data-report-id="${itemId}"]`).forEach((card) => {
    const favoriteBtn = card.querySelector(".watchlist-button");
    if (favoriteBtn) {
      favoriteBtn.dataset.favorite = isFavorite ? "true" : "false";
      favoriteBtn.setAttribute(
        "aria-label",
        isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"
      );
      updateFavoriteButtonIcon(favoriteBtn, isFavorite);
    }
  });

  // Update watchlist panel if open
  const watchlistPanel = document.getElementById("watchlist-container");
  if (watchlistPanel) {
    loadWatchlistContent();
  }

  // BEST PRACTICE: Aggiorna badge contatore preferiti/watchlist
  updateWatchlistBadge();
}

/**
 * Update favorite button icon
 */
function updateFavoriteButtonIcon(button, isFavorite) {
  const svg = button.querySelector("svg");
  if (!svg) {
    return;
  }

  if (isFavorite) {
    svg.innerHTML = `
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" stroke="none"/>
    `;
    button.style.color = "var(--dash-accent)";
  } else {
    svg.innerHTML = `
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `;
    button.style.color = "";
  }
}

/**
 * Create watchlist button for report card
 */
export function createWatchlistButton(item) {
  const button = document.createElement("button");
  button.className = "watchlist-button";
  button.type = "button";
  button.setAttribute(
    "aria-label",
    isInWatchlist(item.id) ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"
  );
  button.dataset.favorite = isInWatchlist(item.id) ? "true" : "false";
  button.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="${isInWatchlist(item.id) ? "currentColor" : "none"}" stroke="currentColor"/>
    </svg>
  `;

  if (isInWatchlist(item.id)) {
    button.style.color = "var(--dash-accent)";
  }

  button.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleWatchlist(item);
  });

  return button;
}

/**
 * Load watchlist content for panel
 */
export async function loadWatchlistContent() {
  const container = document.getElementById("watchlist-container");
  if (!container) {
    return;
  }

  const items = getWatchlistItems();

  if (items.length === 0) {
    container.innerHTML = `
      <div class="watchlist-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="64" height="64">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor"/>
        </svg>
        <div class="watchlist-empty-title">Nessun preferito</div>
        <div class="watchlist-empty-text">Aggiungi report ai preferiti per accesso rapido</div>
      </div>
    `;
    return;
  }

  // Load report details for watchlist items
  const watchlistItems = [];
  for (const item of items) {
    try {
      const headerResponse = await fetch(
        `/archivio/reports/${item.id}/header.json?t=${Date.now()}`
      );
      if (headerResponse.ok) {
        const header = await headerResponse.json();
        watchlistItems.push({
          ...item,
          ticker: header.ticker || header.asset || item.ticker,
          company: header.company || header.asset_name || item.company,
          date: header.date || header.timestamp || item.date,
        });
      } else {
        watchlistItems.push(item);
      }
    } catch (e) {
      watchlistItems.push(item);
    }
  }

  container.innerHTML = watchlistItems
    .map((item) => {
      const date = item.date ? new Date(item.date).toLocaleDateString("it-IT") : "";

      return `
        <div class="watchlist-item" data-report-id="${item.id}">
          <a href="${item.url || `#reports`}" class="watchlist-item-link">
            <div class="watchlist-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div class="watchlist-item-content">
              <div class="watchlist-item-title">${escapeHtml(item.ticker)}</div>
              <div class="watchlist-item-subtitle">${escapeHtml(item.company || "")}${date ? ` · ${date}` : ""}</div>
            </div>
            <div class="watchlist-item-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </a>
          <button type="button" class="watchlist-item-remove" aria-label="Rimuovi dai preferiti" data-report-id="${item.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      `;
    })
    .join("");

  // Add remove button listeners
  container.querySelectorAll(".watchlist-item-remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const itemId = btn.dataset.reportId;
      removeFromWatchlist(itemId);
    });
  });
}

/**
 * Update watchlist badge count in UI
 */
function updateWatchlistBadge() {
  const count = WATCHLIST_STATE.items.length;

  // Aggiorna badge nel menu/navbar se presente
  const badgeElements = document.querySelectorAll(
    "[data-watchlist-badge], .watchlist-badge, .badge-count"
  );
  badgeElements.forEach((badge) => {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-flex" : "none";
      badge.setAttribute("aria-label", `${count} preferiti`);
    } else {
      badge.style.display = "none";
      badge.textContent = "";
    }
  });

  // Aggiorna anche eventuali indicatori nel titolo sezione preferiti
  const favoritesTitle = document.querySelector(
    "#favorites-section .category-title, .favorites-category .category-title"
  );
  if (favoritesTitle) {
    const existingBadge = favoritesTitle.querySelector(".category-badge");
    if (count > 0) {
      if (!existingBadge) {
        const badge = document.createElement("span");
        badge.className = "category-badge";
        badge.textContent = count;
        badge.setAttribute("aria-label", `${count} preferiti`);
        favoritesTitle.appendChild(badge);
      } else {
        existingBadge.textContent = count;
      }
    } else if (existingBadge) {
      existingBadge.remove();
    }
  }

  // Trigger custom event per altri componenti che potrebbero ascoltare
  window.dispatchEvent(
    new CustomEvent("watchlist-count-changed", {
      detail: { count },
    })
  );
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
