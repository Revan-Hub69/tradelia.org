/* eslint-env browser */
/**
 * Category Accordion for Mobile
 * BEST PRACTICE: Accordion per categorie (non preferiti) su mobile
 * Research: Accordion possono ridurre usabilità se usati troppo, quindi solo su mobile e solo per categorie secondarie
 */

/**
 * Initialize category accordion for mobile
 */
export function initCategoryAccordion() {
  // Solo su mobile
  if (window.innerWidth > 768) {
    return;
  }

  const categories = document.querySelectorAll(".module-category:not(.favorites-category)");

  categories.forEach((category) => {
    const title = category.querySelector(".category-title");
    if (!title) {
      return;
    }

    // Imposta stato iniziale: prima categoria espansa, altre chiuse
    const isFirst = category === categories[0];
    category.setAttribute("data-expanded", isFirst ? "true" : "false");

    // Aggiungi event listener
    title.addEventListener("click", () => {
      const isExpanded = category.getAttribute("data-expanded") === "true";
      category.setAttribute("data-expanded", isExpanded ? "false" : "true");

      // Haptic feedback
      if (window.triggerHapticFeedback) {
        window.triggerHapticFeedback("light");
      }

      // Screen reader announcement
      if (window.announceToScreenReader) {
        const categoryName = title.textContent.trim();
        window.announceToScreenReader(
          isExpanded ? `${categoryName} chiusa` : `${categoryName} aperta`
        );
      }
    });

    // Keyboard support
    title.setAttribute("tabindex", "0");
    title.setAttribute("role", "button");
    title.setAttribute("aria-expanded", isFirst ? "true" : "false");
    title.setAttribute(
      "aria-controls",
      `category-${category.dataset.categoryId || Math.random().toString(36).substr(2, 9)}`
    );

    title.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        title.click();
      }
    });
  });

  // Aggiorna aria-expanded quando cambia stato
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "data-expanded") {
        const category = mutation.target;
        const title = category.querySelector(".category-title");
        if (title) {
          title.setAttribute(
            "aria-expanded",
            category.getAttribute("data-expanded") === "true" ? "true" : "false"
          );
        }
      }
    });
  });

  categories.forEach((category) => {
    observer.observe(category, { attributes: true, attributeFilter: ["data-expanded"] });
  });
}

/**
 * Re-initialize accordion when window is resized
 */
export function reinitCategoryAccordion() {
  // Rimuovi accordion su desktop
  if (window.innerWidth > 768) {
    const categories = document.querySelectorAll(".module-category:not(.favorites-category)");
    categories.forEach((category) => {
      category.removeAttribute("data-expanded");
      const title = category.querySelector(".category-title");
      if (title) {
        title.removeAttribute("tabindex");
        title.removeAttribute("role");
        title.removeAttribute("aria-expanded");
        title.removeAttribute("aria-controls");
      }
    });
  } else {
    // Re-inizializza su mobile
    initCategoryAccordion();
  }
}
