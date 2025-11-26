/* eslint-env browser */
/**
 * Education Module Favorites System
 * Sistema preferiti per moduli educativi
 */

import { safeLog } from "./security-utils.js";

const STORAGE_KEY = "tradelia_education_favorites";

/**
 * Get favorites list
 */
export function getEducationFavorites() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    safeLog("error", "[EducationFavorites] Errore lettura preferiti:", error);
    return [];
  }
}

/**
 * Save favorites list
 */
function saveEducationFavorites(favorites) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    window.dispatchEvent(new CustomEvent("education-favorites-changed", { detail: favorites }));
  } catch (error) {
    safeLog("error", "[EducationFavorites] Errore salvataggio preferiti:", error);
  }
}

/**
 * Check if module is favorited
 */
export function isModuleFavorited(moduleId) {
  const favorites = getEducationFavorites();
  return favorites.includes(moduleId);
}

/**
 * Toggle favorite status
 */
export function toggleEducationFavorite(moduleId) {
  const favorites = getEducationFavorites();
  const index = favorites.indexOf(moduleId);

  if (index > -1) {
    // Remove
    favorites.splice(index, 1);
    if (window.showToast) {
      window.showToast("Rimosso dai preferiti", "info");
    }
  } else {
    // Add
    favorites.push(moduleId);
    if (window.showToast) {
      window.showToast("Aggiunto ai preferiti", "success");
    }
  }

  saveEducationFavorites(favorites);
  return index === -1; // Return true if now favorited
}

/**
 * Render favorite button
 */
export function renderFavoriteButton(moduleId, isFavorited = false) {
  return `
    <button 
      class="education-favorite-btn ${isFavorited ? "favorited" : ""}" 
      data-module-id="${moduleId}"
      aria-label="${isFavorited ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}"
      title="${isFavorited ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}"
      type="button"
    >
      <svg viewBox="0 0 24 24" fill="${isFavorited ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
  `;
}

/**
 * Render favorites section
 */
export function renderFavoritesSection(modules, allModules) {
  const favorites = getEducationFavorites();
  const favoritedModules = allModules.filter((m) => favorites.includes(m.id));

  if (favoritedModules.length === 0) {
    return `
      <div class="education-favorites-section">
        <h2 class="education-section-title">Preferiti</h2>
        <div class="education-favorites-empty">
          <div class="favorites-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="64" height="64">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              <line x1="8" y1="7" x2="16" y2="7"/>
              <line x1="8" y1="11" x2="16" y2="11"/>
              <line x1="8" y1="15" x2="12" y2="15"/>
            </svg>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="48" height="48" style="margin-top: -16px;">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <p class="favorites-empty-text">Nessun modulo nei preferiti. Clicca sulla stella su un modulo per aggiungerlo.</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="education-favorites-section">
      <h2 class="education-section-title">Preferiti</h2>
      <div class="modules-grid favorites-grid">
        ${favoritedModules.map((module, index) => renderFavoriteModuleCard(module, index)).join("")}
      </div>
    </div>
  `;
}

/**
 * Render favorite module card (reuse renderModuleCard logic)
 */
function renderFavoriteModuleCard(module, index) {
  // Reuse same logic as renderModuleCard but with favorite button
  const progressPct = module.userProgress?.progress_percentage || 0;
  const status = module.userProgress?.status || "not_started";
  const isFavorited = isModuleFavorited(module.id);

  const statusLabels = {
    not_started: "Non iniziato",
    in_progress: "In corso",
    completed: "Completato",
    locked: "Bloccato",
  };

  return `
    <div class="module-card education-module-card" 
         data-module-id="${module.id}" 
         data-module-slug="${module.slug}"
         data-status="${status}"
         role="article">
      <div class="module-card-header">
        <div class="module-number" aria-hidden="true">${index + 1}</div>
        <div class="module-status-badge">${statusLabels[status]}</div>
        ${renderFavoriteButton(module.id, isFavorited)}
      </div>
      <div class="module-card-content">
        <h3 class="module-title">${escapeHtml(module.title)}</h3>
        <p class="module-description">${escapeHtml(module.description || "")}</p>
        ${
          status === "in_progress" || status === "completed"
            ? `
          <div class="module-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progressPct}%"></div>
            </div>
            <span class="progress-text">${progressPct}% completato</span>
          </div>
        `
            : ""
        }
        <div class="module-meta">
          <span class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            ${module.estimated_hours || 0}h
          </span>
          <span class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            ${module.difficulty_level}
          </span>
        </div>
      </div>
      <div class="module-card-actions">
        <button class="btn btn-education" data-action="open-module" data-module-id="${module.id}">
          ${status === "completed" ? "Rivedi" : status === "in_progress" ? "Continua" : "Inizia"}
        </button>
      </div>
    </div>
  `;
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Setup favorite buttons
 */
export function setupFavoriteButtons() {
  document.querySelectorAll(".education-favorite-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const moduleId = btn.dataset.moduleId;
      if (!moduleId) {
        return;
      }

      const isFavorited = toggleEducationFavorite(moduleId);
      btn.classList.toggle("favorited", isFavorited);
      btn.setAttribute(
        "aria-label",
        isFavorited ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"
      );
      btn.setAttribute("title", isFavorited ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti");
      btn.querySelector("svg").setAttribute("fill", isFavorited ? "currentColor" : "none");

      // Trigger update
      window.dispatchEvent(new CustomEvent("education-favorites-updated"));
    });
  });
}
