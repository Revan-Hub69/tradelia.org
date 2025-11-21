/* eslint-env browser */
/**
 * Dashboard Modules View Controller
 * Gestisce visualizzazione moduli: mostra solo principali (5-7) o tutti (12)
 * Linea Guida: Information Overload - max 5-7 moduli visibili (default)
 */

const STORAGE_KEY = "tradelia-dashboard-show-all-modules";
const DEFAULT_SHOW_ALL = false; // Default: solo moduli principali

/**
 * Inizializza gestione visualizzazione moduli
 */
export function initModulesView() {
  const toggleBtn = document.getElementById("toggle-all-modules");
  if (!toggleBtn) {
    return;
  }

  // Carica preferenza utente
  const showAll = getShowAllPreference();

  // Applica visualizzazione iniziale
  updateModulesVisibility(showAll);
  updateToggleButton(showAll);

  // Event listener per toggle
  toggleBtn.addEventListener("click", () => {
    const currentShowAll = getShowAllPreference();
    const newShowAll = !currentShowAll;
    setShowAllPreference(newShowAll);
    updateModulesVisibility(newShowAll);
    updateToggleButton(newShowAll);
  });
}

/**
 * Aggiorna visibilità moduli
 */
function updateModulesVisibility(showAll) {
  const primaryModules = document.querySelectorAll('.module-card[data-priority="primary"]');
  const secondaryModules = document.querySelectorAll('.module-card[data-priority="secondary"]');
  const secondaryCategories = document.querySelectorAll(".module-category:has(.module-secondary)");

  if (showAll) {
    // Mostra tutti i moduli
    primaryModules.forEach((module) => {
      module.classList.remove("module-hidden");
      module.style.display = "";
    });
    secondaryModules.forEach((module) => {
      module.classList.remove("module-hidden");
      module.style.display = "";
    });
    secondaryCategories.forEach((category) => {
      category.classList.remove("module-category-hidden");
      category.style.display = "";
    });
  } else {
    // Mostra solo moduli principali
    primaryModules.forEach((module) => {
      module.classList.remove("module-hidden");
      module.style.display = "";
    });
    secondaryModules.forEach((module) => {
      module.classList.add("module-hidden");
      module.style.display = "none";
    });
    // Nascondi categorie che contengono solo moduli secondary
    secondaryCategories.forEach((category) => {
      const hasVisiblePrimary = category.querySelector(
        '.module-card[data-priority="primary"]:not(.module-hidden)'
      );
      if (!hasVisiblePrimary) {
        category.classList.add("module-category-hidden");
        category.style.display = "none";
      } else {
        category.classList.remove("module-category-hidden");
        category.style.display = "";
      }
    });
  }
}

/**
 * Aggiorna stato pulsante toggle
 */
function updateToggleButton(showAll) {
  const toggleBtn = document.getElementById("toggle-all-modules");
  const toggleText = document.getElementById("toggle-all-modules-text");
  const toggleIcon = toggleBtn?.querySelector("svg");

  if (!toggleBtn || !toggleText) {
    return;
  }

  if (showAll) {
    toggleText.textContent = "Mostra solo principali";
    toggleBtn.setAttribute("aria-label", "Mostra solo moduli principali");
    toggleBtn.title = "Mostra solo moduli principali (nascondi secondari)";
    if (toggleIcon) {
      toggleIcon.style.transform = "rotate(180deg)";
    }
  } else {
    toggleText.textContent = "Mostra tutti i moduli";
    toggleBtn.setAttribute("aria-label", "Mostra tutti i moduli");
    toggleBtn.title = "Mostra tutti i moduli (default: solo principali)";
    if (toggleIcon) {
      toggleIcon.style.transform = "rotate(0deg)";
    }
  }
}

/**
 * Recupera preferenza utente
 */
function getShowAllPreference() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    return DEFAULT_SHOW_ALL;
  }
  return stored === "true";
}

/**
 * Salva preferenza utente
 */
function setShowAllPreference(showAll) {
  localStorage.setItem(STORAGE_KEY, showAll ? "true" : "false");
}

/**
 * Reset preferenza (utile per testing)
 */
export function resetModulesViewPreference() {
  localStorage.removeItem(STORAGE_KEY);
  const showAll = DEFAULT_SHOW_ALL;
  updateModulesVisibility(showAll);
  updateToggleButton(showAll);
}
