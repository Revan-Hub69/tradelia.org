/**
 * Dashboard Module Manager
 * Gestione visibilità, ordine e gerarchia visiva dei moduli
 * BEST PRACTICE: Drag-and-drop deprioritizzato in favore di sistema preferenze (Academic Research)
 * Best Practice: Separazione concerns - gestione moduli separata da navigazione
 */

// Default module priorities (higher = more important)
const MODULE_PRIORITIES = {
  overview: 100,
  reports: 90,
  settings: 50,
  admin: 40,
};

// Default module order
const DEFAULT_MODULE_ORDER = ["overview", "reports", "settings", "admin"];

/**
 * Initialize module manager
 */
export function initModuleManager() {
  loadModulePreferences();
  // BEST PRACTICE: Drag-and-drop deprioritizzato - non più attivo di default
  // setupDragAndDrop(); // Disabilitato in favore di sistema preferenze
  applyVisualHierarchy();
}

/**
 * Load saved module preferences from localStorage
 */
function loadModulePreferences() {
  const savedOrder = localStorage.getItem("dashboard-module-order");
  const savedVisibility = localStorage.getItem("dashboard-module-visibility");
  const savedHierarchy = localStorage.getItem("dashboard-module-hierarchy");

  if (savedOrder) {
    try {
      const order = JSON.parse(savedOrder);
      applyModuleOrder(order);
    } catch (e) {
      console.error("[ModuleManager] Errore caricamento ordine moduli:", e);
    }
  }

  if (savedVisibility) {
    try {
      const visibility = JSON.parse(savedVisibility);
      applyModuleVisibility(visibility);
    } catch (e) {
      console.error("[ModuleManager] Errore caricamento visibilità moduli:", e);
    }
  }

  if (savedHierarchy) {
    try {
      const hierarchy = JSON.parse(savedHierarchy);
      applyCustomHierarchy(hierarchy);
    } catch (e) {
      console.error("[ModuleManager] Errore caricamento gerarchia:", e);
    }
  }
}

/**
 * Apply module order to DOM
 */
function applyModuleOrder(order) {
  const modulesGrid = document.querySelector(".modules-grid");
  if (!modulesGrid) {
    return;
  }

  const cards = Array.from(modulesGrid.querySelectorAll(".module-card"));
  const orderedCards = [];

  // Reorder cards based on saved order
  order.forEach((moduleId) => {
    const card = cards.find((c) => c.dataset.module === moduleId);
    if (card) {
      orderedCards.push(card);
    }
  });

  // Add any remaining cards (new modules not in saved order)
  cards.forEach((card) => {
    if (!orderedCards.includes(card)) {
      orderedCards.push(card);
    }
  });

  // Re-append cards in new order
  orderedCards.forEach((card) => modulesGrid.appendChild(card));
}

/**
 * Apply module visibility
 */
function applyModuleVisibility(visibility) {
  Object.entries(visibility).forEach(([moduleId, isVisible]) => {
    const card = document.querySelector(`.module-card[data-module="${moduleId}"]`);
    if (card) {
      card.style.display = isVisible ? "" : "none";
      card.dataset.hidden = isVisible ? "false" : "true";
    }
  });
}

/**
 * Apply custom visual hierarchy
 */
function applyCustomHierarchy(hierarchy) {
  Object.entries(hierarchy).forEach(([moduleId, config]) => {
    const card = document.querySelector(`.module-card[data-module="${moduleId}"]`);
    if (card && config) {
      if (config.priority !== undefined) {
        card.dataset.priority = config.priority;
      }
      if (config.size !== undefined) {
        card.dataset.size = config.size;
      }
    }
  });
}

/**
 * Setup drag and drop functionality (DEPRECATED - Non più prioritario)
 * BEST PRACTICE: Drag-and-drop deprioritizzato in favore di sistema preferenze
 * Disponibile solo per utenti avanzati su desktop
 *
 * @deprecated Use module favorites system instead
 */
// Disabilitato di default - troppo complesso rispetto a sistema preferenze
// Può essere riattivato in modalità "edit" per utenti avanzati
// function setupDragAndDrop() {
//   return;
// }

// Codice originale mantenuto per riferimento futuro ma non eseguito
/*
  const modulesGrid = document.querySelector('.modules-grid');
  if (!modulesGrid) return;

  const cards = modulesGrid.querySelectorAll('.module-card');
  cards.forEach((card) => {
    // Make card draggable only in edit mode
    card.draggable = false; // Disabilitato di default
    card.dataset.draggable = 'false';
    // ... resto del codice drag-and-drop
  });
  */
// Funzione disabilitata - sistema preferenze prioritario

/**
 * Save module order to localStorage
 */
// Disabilitato - sistema preferenze prioritario
// function saveModuleOrder() {
//   const modulesGrid = document.querySelector('.modules-grid');
//   if (!modulesGrid) return;
//
//   const cards = Array.from(modulesGrid.querySelectorAll('.module-card'));
//   const order = cards.map((card) => card.dataset.module).filter(Boolean);
//   localStorage.setItem('dashboard-module-order', JSON.stringify(order));
// }

/**
 * Apply visual hierarchy based on priorities
 */
function applyVisualHierarchy() {
  const cards = document.querySelectorAll(".module-card");
  cards.forEach((card) => {
    const moduleId = card.dataset.module;
    const priority = MODULE_PRIORITIES[moduleId] || 50;

    // Set data attributes for CSS styling
    card.dataset.priority = priority.toString();

    // Apply size based on priority
    if (priority >= 90) {
      card.dataset.size = "large";
    } else if (priority >= 70) {
      card.dataset.size = "medium";
    } else {
      card.dataset.size = "small";
    }
  });
}

/**
 * Toggle module visibility
 * @param {string} moduleId - Module ID
 * @param {boolean} isVisible - Whether module should be visible
 */
export function toggleModuleVisibility(moduleId, isVisible) {
  const card = document.querySelector(`.module-card[data-module="${moduleId}"]`);
  if (card) {
    card.style.display = isVisible ? "" : "none";
    card.dataset.hidden = isVisible ? "false" : "true";

    // Save visibility preference
    const saved = localStorage.getItem("dashboard-module-visibility");
    const visibility = saved ? JSON.parse(saved) : {};
    visibility[moduleId] = isVisible;
    localStorage.setItem("dashboard-module-visibility", JSON.stringify(visibility));

    // Show feedback
    if (window.showToast) {
      window.showToast(`Modulo ${isVisible ? "mostrato" : "nascosto"}`, "success");
    }
  }
}

/**
 * Reset module order to default
 */
export function resetModuleOrder() {
  localStorage.removeItem("dashboard-module-order");
  localStorage.removeItem("dashboard-module-visibility");
  localStorage.removeItem("dashboard-module-hierarchy");

  // Reload page to apply defaults
  window.location.reload();
}

/**
 * Get current module order
 * @returns {string[]} Array of module IDs in current order
 */
export function getModuleOrder() {
  const modulesGrid = document.querySelector(".modules-grid");
  if (!modulesGrid) {
    return DEFAULT_MODULE_ORDER;
  }

  const cards = Array.from(modulesGrid.querySelectorAll(".module-card"));
  return cards.map((card) => card.dataset.module).filter(Boolean);
}

/**
 * Get module visibility status
 * @returns {Object} Object mapping module IDs to visibility boolean
 */
export function getModuleVisibility() {
  const saved = localStorage.getItem("dashboard-module-visibility");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return {};
    }
  }
  return {};
}
