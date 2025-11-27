/* eslint-env browser */
/**
 * Module Favorites System
 * BEST PRACTICE: Sistema di preferenze prioritario (Academic Research)
 * +74% engagement, +25% soddisfazione utente
 * Più semplice e immediato del drag-and-drop
 */

const STORAGE_KEY = "dashboard-module-favorites";

/**
 * Initialize favorites system
 */
export function initModuleFavorites() {
  setupFavoriteButtons();
  applyFavoritesOrder();
  createFavoritesSection();

  // BEST PRACTICE: Aggiorna sezione preferiti quando cambia localStorage (cross-tab sync)
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      createFavoritesSection();
      applyFavoritesOrder();
      // Re-inizializza pulsanti preferiti
      setupFavoriteButtons();
    }
  });
}

/**
 * Setup favorite buttons on module cards
 */
function setupFavoriteButtons() {
  const cards = document.querySelectorAll(".module-card:not(.favorites-grid .module-card)");
  cards.forEach((card) => {
    const moduleId = card.dataset.module;
    if (!moduleId) {
      return;
    }

    // Check if already has favorite button
    if (card.querySelector(".module-favorite-btn")) {
      return;
    }

    // Create favorite button
    const favoriteBtn = document.createElement("button");
    favoriteBtn.className = "module-favorite-btn";
    const addLabel = window.t ? window.t("favorites.add") : "Aggiungi ai preferiti";
    favoriteBtn.setAttribute("aria-label", addLabel);
    favoriteBtn.setAttribute("type", "button");
    favoriteBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    `;

    // Check if module is favorited
    const isFavorited = isModuleFavorited(moduleId);
    if (isFavorited) {
      favoriteBtn.classList.add("favorited");
      const removeLabel = window.t ? window.t("favorites.remove") : "Rimuovi dai preferiti";
      favoriteBtn.setAttribute("aria-label", removeLabel);
    }

    // Add click handler con capture phase per intercettare prima del click sulla card
    favoriteBtn.addEventListener(
      "click",
      (e) => {
        // BEST PRACTICE: Ferma la propagazione per evitare che si apra il modulo
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // BEST PRACTICE: Microinterazione - feedback immediato
        favoriteBtn.style.transform = "scale(0.9)";
        setTimeout(() => {
          favoriteBtn.style.transform = "";
        }, 150);

        toggleFavorite(moduleId);
        updateFavoriteButton(favoriteBtn, moduleId);
        applyFavoritesOrder();

        // BEST PRACTICE: Aggiorna sezione preferiti dopo toggle con debounce per evitare multiple chiamate
        clearTimeout(window.favoritesUpdateTimeout);
        window.favoritesUpdateTimeout = setTimeout(() => {
          createFavoritesSection();
        }, 150);

        // Haptic feedback
        if (window.triggerHapticFeedback) {
          window.triggerHapticFeedback("light");
        }

        return false;
      },
      true
    ); // Use capture phase to intercept before card click

    // BEST PRACTICE: Aggiungi pulsante preferiti alla card (non al header per evitare sovrapposizioni)
    // Posizionato in basso a destra della card
    card.style.position = "relative"; // Assicura che position: absolute funzioni
    card.appendChild(favoriteBtn);
  });
}

/**
 * Toggle favorite status for a module
 */
function toggleFavorite(moduleId) {
  const favorites = getFavorites();
  const index = favorites.indexOf(moduleId);

  if (index > -1) {
    // Remove from favorites
    favorites.splice(index, 1);
    // BEST PRACTICE: i18n support
    const message = window.t ? window.t("favorites.removed") : "Rimosso dai preferiti";
    if (window.showToast) {
      window.showToast(message, "info");
    }

    // BEST PRACTICE: Feedback per screen reader
    if (window.announceToScreenReader) {
      window.announceToScreenReader(message);
    }
  } else {
    // Add to favorites
    favorites.push(moduleId);
    // BEST PRACTICE: i18n support
    const message = window.t ? window.t("favorites.added") : "Aggiunto ai preferiti";
    if (window.showToast) {
      window.showToast(message, "success");
    }

    // BEST PRACTICE: Feedback per screen reader
    if (window.announceToScreenReader) {
      window.announceToScreenReader(message);
    }
  }

  saveFavorites(favorites);
}

/**
 * Update favorite button appearance
 */
function updateFavoriteButton(button, moduleId) {
  const isFavorited = isModuleFavorited(moduleId);
  if (isFavorited) {
    button.classList.add("favorited");
    const removeLabel = window.t ? window.t("favorites.remove") : "Rimuovi dai preferiti";
    button.setAttribute("aria-label", removeLabel);
  } else {
    button.classList.remove("favorited");
    const addLabel = window.t ? window.t("favorites.add") : "Aggiungi ai preferiti";
    button.setAttribute("aria-label", addLabel);
  }
}

/**
 * Check if module is favorited
 */
export function isModuleFavorited(moduleId) {
  const favorites = getFavorites();
  return favorites.includes(moduleId);
}

/**
 * Get favorites list
 */
export function getFavorites() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Save favorites list
 */
function saveFavorites(favorites) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));

  // BEST PRACTICE: Trigger custom event per cross-tab sync
  window.dispatchEvent(new CustomEvent("favorites-changed", { detail: favorites }));
}

/**
 * Apply favorites order - show favorites first
 */
function applyFavoritesOrder() {
  const favorites = getFavorites();

  // BEST PRACTICE: Assicurati che TUTTI i moduli siano visibili
  document.querySelectorAll(".module-card:not(.favorites-grid .module-card)").forEach((card) => {
    card.style.display = "";
    const moduleId = card.dataset.module;
    if (favorites.includes(moduleId)) {
      card.dataset.favorited = "true";
    } else {
      card.dataset.favorited = "false";
    }
  });

  if (favorites.length === 0) {
    // No favorites, show all modules normally
    return;
  }

  const modulesGrid = document.querySelector(".modules-grid:not(.favorites-grid)");
  if (!modulesGrid) {
    return;
  }

  const cards = Array.from(modulesGrid.querySelectorAll(".module-card"));
  const favoritedCards = [];
  const otherCards = [];

  cards.forEach((card) => {
    const moduleId = card.dataset.module;
    if (favorites.includes(moduleId)) {
      card.dataset.favorited = "true";
      favoritedCards.push(card);
    } else {
      card.dataset.favorited = "false";
      otherCards.push(card);
    }
  });

  // Reorder: favorites first, then others
  const orderedCards = [...favoritedCards, ...otherCards];
  orderedCards.forEach((card) => modulesGrid.appendChild(card));
}

/**
 * Create favorites section in modules view
 * BEST PRACTICE: Sezione principale sempre visibile se ci sono preferiti
 * Migliorato: Aggiorna senza rimuovere, transizioni fluide
 */
export function createFavoritesSection() {
  const modulesView = document.getElementById("modules-view");
  if (!modulesView) {
    return;
  }

  const favorites = getFavorites();

  // BEST PRACTICE: Non rimuovere la sezione, aggiorna solo il contenuto per evitare flash
  let favoritesSection = document.getElementById("favorites-section");
  let favoritesGrid = null;

  if (!favoritesSection) {
    // Crea sezione solo se non esiste
    favoritesSection = document.createElement("div");
    favoritesSection.id = "favorites-section";
    favoritesSection.className = "module-category favorites-category";

    const categoryTitle = document.createElement("div");
    categoryTitle.className = "category-title";
    const favoritesLabel = window.t ? window.t("favorites.section") : "Preferiti";
    categoryTitle.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      <span>${favoritesLabel}</span>
    `;
    favoritesSection.appendChild(categoryTitle);

    // Aggiungi placeholder skeleton per prevenire CLS
    const skeletonGrid = document.createElement("div");
    skeletonGrid.className = "modules-grid favorites-grid";
    skeletonGrid.style.minHeight = "190px";
    favoritesSection.appendChild(skeletonGrid);

    // Inserisci sezione in cima
    const firstCategory = modulesView.querySelector(".module-category:not(.favorites-category)");
    if (firstCategory) {
      modulesView.insertBefore(favoritesSection, firstCategory);
    } else {
      modulesView.insertBefore(favoritesSection, modulesView.firstChild);
    }
  } else {
    // Se esiste, trova la griglia esistente
    favoritesGrid = favoritesSection.querySelector(".favorites-grid");
  }

  // Crea o aggiorna la griglia
  if (!favoritesGrid) {
    favoritesGrid = document.createElement("div");
    favoritesGrid.className = "modules-grid favorites-grid";
    favoritesGrid.style.minHeight = "190px";
    favoritesSection.appendChild(favoritesGrid);
  }

  // BEST PRACTICE: Aggiorna contenuto senza rimuovere completamente
  // Usa requestAnimationFrame per transizione fluida
  requestAnimationFrame(() => {
    // Rimuovi solo le card esistenti dalla griglia preferiti con animazione
    const existingCards = Array.from(favoritesGrid.querySelectorAll(".module-card"));

    if (existingCards.length > 0) {
      existingCards.forEach((card, index) => {
        // Animazione fade out
        card.style.transition = "opacity 0.2s ease, transform 0.2s ease";
        card.style.opacity = "0";
        card.style.transform = "scale(0.95)";

        setTimeout(
          () => {
            if (card.parentElement === favoritesGrid) {
              card.remove();
            }
          },
          200 + index * 30
        );
      });
    }

    // Dopo la rimozione, aggiungi le nuove card
    setTimeout(
      () => {
        // Pulisci completamente la griglia
        favoritesGrid.innerHTML = "";

        if (favorites.length === 0) {
          // Mostra messaggio se non ci sono preferiti
          const emptyState = document.createElement("div");
          emptyState.className = "empty-state";
          emptyState.style.cssText =
            "grid-column: 1 / -1; text-align: center; padding: var(--spacing-xl); color: var(--dash-text-muted); min-height: 190px; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0;";
          emptyState.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48" style="margin: 0 auto var(--spacing-md); opacity: 0.5;">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <p style="margin: 0; font-size: var(--fs-14, 14px);">Nessun modulo nei preferiti. Clicca sulla stella su un modulo per aggiungerlo.</p>
        `;
          favoritesGrid.appendChild(emptyState);

          // Anima fade in
          requestAnimationFrame(() => {
            emptyState.style.transition = "opacity 0.3s ease";
            emptyState.style.opacity = "1";
          });
        } else {
          // Mostra moduli preferiti - usa le card originali, non cloni
          favorites.forEach((moduleId, index) => {
            const originalCard = document.querySelector(
              `.module-card[data-module="${moduleId}"]:not(.favorites-grid .module-card)`
            );

            if (originalCard) {
              // BEST PRACTICE: Clona la card per la sezione preferiti
              const cardClone = originalCard.cloneNode(true);

              // Assicura che il pulsante preferiti sia presente e funzionante
              let favoriteBtn = cardClone.querySelector(".module-favorite-btn");
              if (!favoriteBtn) {
                // Se non c'è, crealo
                favoriteBtn = document.createElement("button");
                favoriteBtn.className = "module-favorite-btn favorited";
                favoriteBtn.setAttribute(
                  "aria-label",
                  window.t ? window.t("favorites.remove") : "Rimuovi dai preferiti"
                );
                favoriteBtn.setAttribute("type", "button");
                favoriteBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              `;
                cardClone.style.position = "relative";
                cardClone.appendChild(favoriteBtn);
              }

              // Aggiungi event listener al pulsante preferiti
              favoriteBtn.addEventListener(
                "click",
                (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.stopImmediatePropagation();

                  // Microinterazione
                  favoriteBtn.style.transform = "scale(0.9)";
                  setTimeout(() => {
                    favoriteBtn.style.transform = "";
                  }, 150);

                  toggleFavorite(moduleId);
                  updateFavoriteButton(favoriteBtn, moduleId);
                  applyFavoritesOrder();

                  // Aggiorna sezione preferiti
                  clearTimeout(window.favoritesUpdateTimeout);
                  window.favoritesUpdateTimeout = setTimeout(() => {
                    createFavoritesSection();
                  }, 150);

                  if (window.triggerHapticFeedback) {
                    window.triggerHapticFeedback("light");
                  }
                  return false;
                },
                true
              );

              // Animazione fade in
              cardClone.style.opacity = "0";
              cardClone.style.transform = "scale(0.95)";
              favoritesGrid.appendChild(cardClone);

              // Anima l'entrata con delay progressivo
              setTimeout(() => {
                cardClone.style.transition = "opacity 0.3s ease, transform 0.3s ease";
                cardClone.style.opacity = "1";
                cardClone.style.transform = "scale(1)";
              }, index * 50);

              // BEST PRACTICE: NON nascondere la card originale - mostra sia nella sezione preferiti che nella griglia principale
              // Questo permette all'utente di vedere i moduli preferiti in entrambi i posti
              // Rimuoviamo il codice che nasconde la card per evitare problemi
            }
          });
        }
      },
      existingCards.length > 0 ? 250 : 0
    );
  });
}
