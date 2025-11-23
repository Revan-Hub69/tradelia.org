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

  categories.forEach((category, index) => {
    const title = category.querySelector(".category-title");
    if (!title) {
      return;
    }

    // BEST PRACTICE: Prima categoria (Principale) sempre visibile - NON applicare accordion
    const isFirstCategory = index === 0;

    if (isFirstCategory) {
      // Prima categoria: non applicare accordion, sempre visibile
      category.removeAttribute("data-expanded");
      // Rimuovi eventuali listener precedenti
      const newTitle = title.cloneNode(true);
      title.parentNode.replaceChild(newTitle, title);
      return; // Skip accordion per prima categoria
    }

    // Altre categorie: accordion normale
    // BEST PRACTICE: Solo prima categoria (Principale) sempre aperta, altre chiuse di default
    // Ridotto da 3 a 1 per evitare troppe categorie aperte su mobile
    const shouldExpand = false; // Tutte le categorie (tranne la prima) chiuse di default
    category.setAttribute("data-expanded", shouldExpand ? "true" : "false");

    // Rimuovi listener precedenti per evitare duplicati
    const newTitle = title.cloneNode(true);
    title.parentNode.replaceChild(newTitle, title);
    const freshTitle = category.querySelector(".category-title");

    // Aggiungi event listener al nuovo elemento
    freshTitle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isExpanded = category.getAttribute("data-expanded") === "true";
      category.setAttribute("data-expanded", isExpanded ? "false" : "true");

      // Haptic feedback
      if (window.triggerHapticFeedback) {
        window.triggerHapticFeedback("light");
      }

      // Screen reader announcement
      if (window.announceToScreenReader) {
        const categoryName = freshTitle.textContent.trim();
        window.announceToScreenReader(
          isExpanded ? `${categoryName} chiusa` : `${categoryName} aperta`
        );
      }
    });

    // Keyboard support
    freshTitle.setAttribute("tabindex", "0");
    freshTitle.setAttribute("role", "button");
    freshTitle.setAttribute("aria-expanded", shouldExpand ? "true" : "false");
    freshTitle.setAttribute(
      "aria-controls",
      `category-${category.dataset.categoryId || Math.random().toString(36).substr(2, 9)}`
    );

    freshTitle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        freshTitle.click();
      }
    });
  });

  // Aggiorna aria-expanded quando cambia stato
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "data-expanded") {
        const category = mutation.target;
        const title = category.querySelector(".category-title");
        if (title && title.hasAttribute("role")) {
          // Solo aggiorna se ha role="button" (non la prima categoria)
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
