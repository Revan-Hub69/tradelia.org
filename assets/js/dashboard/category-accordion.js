/* eslint-env browser */
/**
 * Category Accordion - DISABILITATO
 * BEST PRACTICE: Navigazione semplificata - tutte le categorie sempre visibili
 * Rimosso accordion per semplificare navigazione e migliorare UX
 */

/**
 * Initialize category accordion - DISABILITATO
 * Tutte le categorie sono sempre visibili per navigazione più semplice
 */
export function initCategoryAccordion() {
  // BEST PRACTICE: Rimuovi tutti gli attributi accordion per garantire che tutto sia sempre visibile
  const categories = document.querySelectorAll(".module-category");
  
  categories.forEach((category) => {
    // Rimuovi attributi accordion
    category.removeAttribute("data-expanded");
    const title = category.querySelector(".category-title");
    if (title) {
      // Rimuovi attributi ARIA e interattività
      title.removeAttribute("tabindex");
      title.removeAttribute("role");
      title.removeAttribute("aria-expanded");
      title.removeAttribute("aria-controls");
      // Rimuovi cursor pointer per indicare che non è cliccabile
      title.style.cursor = "default";
    }
  });
}

/**
 * Re-initialize accordion when window is resized - DISABILITATO
 */
export function reinitCategoryAccordion() {
  // Sempre rimuovi accordion - navigazione semplificata sempre attiva
  const categories = document.querySelectorAll(".module-category");
  categories.forEach((category) => {
    category.removeAttribute("data-expanded");
    const title = category.querySelector(".category-title");
    if (title) {
      title.removeAttribute("tabindex");
      title.removeAttribute("role");
      title.removeAttribute("aria-expanded");
      title.removeAttribute("aria-controls");
      title.style.cursor = "default";
    }
  });
}
