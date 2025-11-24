/* eslint-env browser */
/**
 * Dashboard Application Entry Point
 * FASE 2: TypeScript Migration - Gradual
 * Best Practice: Separazione concerns - logica navigazione separata da HTML
 * Version: 2.0.0
 */

import { loadModule } from "./index.js";
import { initAccountBanner } from "./account-banner.js";
import { initFooter } from "./footer.js";
import { isAdmin } from "./permissions.js";
import { getUserRole } from "./auth.js";
import { startSessionCheck } from "./session.js";
import { keyboardNav } from "./keyboard-nav.js";
import { initModuleManager } from "./module-manager.js";
import { initCategoryAccordion, reinitCategoryAccordion } from "./category-accordion.js";

// Export per module-favorites.js
window.reinitCategoryAccordion = reinitCategoryAccordion;
import { initGlobalSearch } from "./global-search.js";
import { initWatchlist } from "./watchlist.js";
import { initKeyboardShortcuts } from "./keyboard-shortcuts.js";
import { initAdvancedFilters } from "./advanced-filters.js";
import { initRecentActivity } from "./recent-activity.js";
import { initDashboardWidgets } from "./dashboard-widgets.js";
import { initPerformanceMonitoring } from "./performance-monitor.js";
import { initCharts } from "./charts.js";
import { initRUMDashboard } from "./rum-dashboard.js";
import { initCommunicationPreferences } from "./communication-preferences.js";
// Notifiche push - DISABILITATE
// import { initPWANotifications } from "./pwa-notifications.js";

// Global state
export const STATE = {
  currentModule: null,
  reports: [],
  filteredReports: [],
};

/**
 * Initialize dashboard application
 */
export async function initDashboard() {
  // BEST PRACTICE: Accesso libero alla dashboard (guest mode)
  // La verifica autenticazione è opzionale e non blocca l'accesso
  // L'utente può accedere alla pagina di accesso tramite il pulsante dedicato

  // CRITICAL: NON fare MAI redirect automatico a accesso.html
  // La dashboard deve essere sempre accessibile in guest mode
  // Il redirect deve avvenire SOLO quando l'utente clicca esplicitamente su "Accedi"

  const authCheck = await checkAuthentication();

  // Log per debug (non blocca l'accesso)
  if (!authCheck.authenticated) {
    // Import dinamico per evitare circolarità
    import("./security-utils.js").then(({ safeLog }) => {
      safeLog("log", "[Dashboard] Accesso guest - token non presente o non valido");
    });
  }

  // NON fare redirect automatico - accesso libero sempre consentito
  // Se c'è un redirectTo, viene IGNORATO per permettere accesso guest
  // L'utente può accedere alla pagina di accesso tramite il pulsante "Accedi" nel banner

  // Initialize account banner (shows user status, plan, usage)
  await initAccountBanner();

  // Initialize footer
  await initFooter();

  // BEST PRACTICE: Avvia session management (periodic token check, auto-logout)
  startSessionCheck();

  // Show/hide admin module based on permissions
  await toggleAdminModule();

  // Initialize module manager (visibility, hierarchy)
  initModuleManager();

  // BEST PRACTICE: Accordion per categorie su mobile
  initCategoryAccordion();

  // Re-inizializza accordion quando cambia dimensione finestra
  window.addEventListener("resize", reinitCategoryAccordion);

  // BEST PRACTICE: Initialize module favorites system (prioritario rispetto a drag-and-drop)
  const { initModuleFavorites, createFavoritesSection } = await import("./module-favorites.js");
  initModuleFavorites();

  // BEST PRACTICE: Crea sezione preferiti sempre (anche se vuota)
  setTimeout(() => {
    createFavoritesSection();
    // Aggiorna quando i preferiti cambiano
    window.addEventListener("storage", (e) => {
      if (e.key === "dashboard-module-favorites") {
        createFavoritesSection();
      }
    });
  }, 100);

  // BEST PRACTICE: Initialize accessibility enhancements (WCAG 2.2 Compliance)
  const { initAccessibility } = await import("./accessibility.js");
  initAccessibility();

  // BEST PRACTICE: Initialize security indicators (Financial Services UX)
  const { initSecurityIndicators } = await import("./security-indicators.js");
  initSecurityIndicators();

  // BEST PRACTICE: Initialize desktop sidebar (Coerenza Desktop vs Mobile)
  // Desktop sidebar rimosso - non più utilizzato

  // BEST PRACTICE 2025: Solo tema dark - nessun toggle
  // Forza sempre tema dark per coerenza istituzionale
  document.documentElement.setAttribute("data-theme", "dark");
  document.documentElement.setAttribute("data-theme-manual", "true");

  // BEST PRACTICE: Initialize i18n system (Global UX)
  const { initI18n } = await import("./i18n.js");
  initI18n();

  // Export feedback functions globally for use in other modules
  const {
    showLoadingState,
    hideLoadingState,
    showSuccessFeedback,
    showErrorFeedback,
    showSaveState,
  } = await import("./feedback-system.js");
  window.showLoadingState = showLoadingState;
  window.hideLoadingState = hideLoadingState;
  window.showSuccessFeedback = showSuccessFeedback;
  window.showErrorFeedback = showErrorFeedback;
  window.showSaveState = showSaveState;

  // Export accessibility functions globally
  const { announceToScreenReader } = await import("./accessibility.js");
  window.announceToScreenReader = announceToScreenReader;

  // Initialize global search (Ctrl+K shortcut)
  initGlobalSearch();

  // Initialize watchlist/favorites
  initWatchlist();

  // Initialize keyboard shortcuts
  initKeyboardShortcuts();

  // Initialize advanced filters
  initAdvancedFilters();

  // Initialize recent activity/history tracking
  initRecentActivity();

  // Initialize dashboard widgets
  initDashboardWidgets();

  // Initialize performance monitoring
  initPerformanceMonitoring();

  // Initialize charts library
  initCharts();

  // Initialize RUM dashboard
  initRUMDashboard();

  // Initialize communication preferences modal (newsletter, SMS, WhatsApp)
  initCommunicationPreferences();

  // Initialize auth modal (login/accesso direttamente nella dashboard)
  const { initAuthModal } = await import("./auth-modal.js");
  initAuthModal();

  // Initialize simple notifications (polling-based, no push)
  const { initSimpleNotifications } = await import("./simple-notifications.js");
  await initSimpleNotifications();

  // BEST PRACTICE: Initialize network state handling (offline/slow connection)
  const { initNetworkState } = await import("./network-state.js");
  initNetworkState();

  // BEST PRACTICE: Initialize pull-to-refresh (Mobile UX Patterns)
  const { initPullToRefresh } = await import("./pull-to-refresh.js");
  initPullToRefresh();

  // BEST PRACTICE: Initialize battery optimization (Energy-Efficient Web Design)
  const { initBatteryOptimization } = await import("./battery-optimization.js");
  initBatteryOptimization();

  // BEST PRACTICE: Initialize haptic feedback (Mobile UX Patterns)
  const { setupHapticFeedback } = await import("./haptic-feedback.js");
  setupHapticFeedback();

  // BEST PRACTICE: Inizializza history state per supporto back button mobile
  // Crea uno stato iniziale nella history per evitare che il back button chiuda la pagina
  const initialHash = window.location.hash.slice(1);
  const initialModule = initialHash || null;

  if (!history.state) {
    // Crea stato iniziale nella history (usa replaceState per non aggiungere entry)
    const url = initialHash
      ? `${window.location.pathname}#${initialHash}`
      : window.location.pathname;
    history.replaceState({ module: initialModule, isInitial: true }, "", url);
  }

  // BEST PRACTICE: Su mobile, pannelli chiusi di default
  const isMobile = window.innerWidth <= 768;

  if (initialHash && !isMobile) {
    // Desktop: apri se c'è hash (ma non fare pushState, è già stato fatto sopra)
    showModule(initialHash, false);
  } else if (initialHash && isMobile) {
    // Mobile: se c'è hash, apri comunque (utente potrebbe aver salvato un link)
    showModule(initialHash, false);
  } else {
    // Nessun hash: mostra solo moduli view
    const modulesView = document.getElementById("modules-view");
    if (modulesView) {
      modulesView.classList.add("active");
    }
    document.querySelectorAll(".panel-view").forEach((panel) => {
      panel.classList.remove("active");
    });
    STATE.currentModule = null;
  }

  // Handle hash changes
  window.addEventListener("hashchange", () => {
    const newHash = window.location.hash.slice(1);
    if (newHash) {
      showModule(newHash);
    } else {
      closeModule();
    }
  });

  // BEST PRACTICE: Handle browser back button with History API (Mobile UX Patterns)
  // CRITICAL: Previene chiusura pagina su mobile quando si preme indietro
  window.addEventListener("popstate", (e) => {
    // Se è lo stato iniziale, non fare nulla (evita chiusura pagina)
    if (e.state && e.state.isInitial) {
      // Mantieni la vista corrente senza cambiare nulla
      return;
    }

    if (e.state && e.state.module) {
      showModule(e.state.module, false); // false = non fare pushState (siamo già in popstate)
    } else {
      const hash = window.location.hash.slice(1);
      if (hash) {
        showModule(hash, false);
      } else {
        // Chiudi modulo se presente, ma non chiudere la pagina
        if (STATE.currentModule) {
          closeModule(false); // false = non fare pushState
        } else {
          // Se siamo già nella home, non fare nulla (evita chiusura)
          const modulesView = document.getElementById("modules-view");
          if (modulesView && modulesView.classList.contains("active")) {
            // Già nella home, non fare nulla
            return;
          }
        }
      }
    }
  });

  // Bottom navigation rimosso - non più utilizzato

  // Handle module card clicks (con supporto mobile per distinguere tap da scroll)
  document.querySelectorAll(".module-card").forEach((card) => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoved = false;

    // Rileva movimento durante touch (scroll)
    card.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchMoved = false;
    });

    card.addEventListener("touchmove", (e) => {
      if (!touchMoved) {
        const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
        const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
        // Se movimento > 10px, è uno scroll, non un tap
        touchMoved = deltaX > 10 || deltaY > 10;
      }
    });

    // Gestisci click/tap
    card.addEventListener("click", (e) => {
      // BEST PRACTICE: Ignora click se è sul pulsante preferiti o altri elementi interattivi
      const target = e.target;
      const isFavoriteBtn = target.closest(".module-favorite-btn");
      const isInteractiveElement = target.closest("button, a, input, select, textarea");

      if (isFavoriteBtn || isInteractiveElement) {
        // Il click è su un elemento interattivo, non aprire il modulo
        e.stopPropagation();
        return;
      }

      // BEST PRACTICE: Verifica se il click è partito dal pulsante preferiti (anche se propagato)
      if (e.target.closest(".module-favorite-btn")) {
        e.stopPropagation();
        return;
      }

      // Su mobile, se c'è stato movimento durante il touch, non aprire il modulo
      if (touchMoved) {
        return;
      }

      // BEST PRACTICE: Su mobile, tap singolo apre direttamente il modulo (più semplice)
      // Rimossa logica doppio tap che confondeva gli utenti
      const moduleId = card.dataset.module;
      if (moduleId) {
        e.preventDefault();
        e.stopPropagation();
        window.location.hash = moduleId;
      }
    });
  });

  // Handle back buttons
  document.querySelectorAll(".panel-back").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      // Usa history.back() invece di hash vuoto per supporto mobile migliore
      if (history.length > 1) {
        history.back();
      } else {
        // Se non c'è history, chiudi il modulo normalmente
        window.location.hash = "";
      }
    });
  });

  // Initialize keyboard navigation (focus trap, arrow keys)
  keyboardNav.init();

  // Keyboard navigation - ESC to close panel
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && STATE.currentModule) {
      closeModule();
    }
  });

  // Bottom navigation rimosso - non più utilizzato
}

// Bottom navigation rimosso - non più utilizzato

/**
 * Close current module and return to modules view
 * BEST PRACTICE: Support back button with History API
 * @param {boolean} pushState - Se true, fa pushState (default: true). Se false, non modifica history (utile in popstate)
 */
function closeModule(pushState = true) {
  // BEST PRACTICE: Push state per tornare alla home (solo se non siamo in popstate)
  if (pushState) {
    history.pushState({ module: null }, "", window.location.pathname);
  }

  window.location.hash = "";
  STATE.currentModule = null;
  keyboardNav.deactivateFocusTrap();

  // Show modules view
  const modulesView = document.getElementById("modules-view");
  if (modulesView) {
    modulesView.classList.add("active");
  }

  // Hide all panels
  document.querySelectorAll(".panel-view").forEach((panel) => {
    panel.classList.remove("active");
  });

  // BEST PRACTICE: Account banner solo nella home, non nelle schede
  const accountBannerSlot = document.getElementById("account-banner-slot");
  if (accountBannerSlot) {
    // Mostra solo se siamo nella home (overview o nessun modulo)
    if (!STATE.currentModule || STATE.currentModule === "overview") {
      accountBannerSlot.style.display = "";
    } else {
      accountBannerSlot.style.display = "none";
    }
  }
}

/**
 * Show/hide admin module card and category based on user permissions
 */
async function toggleAdminModule() {
  const adminCard = document.querySelector(".module-card-admin");
  const adminCategory = document.querySelector(".module-category-admin");

  try {
    const role = await getUserRole();
    if (isAdmin(role)) {
      if (adminCard) {
        adminCard.style.display = "";
      }
      if (adminCategory) {
        adminCategory.style.display = "";
      }
    } else {
      if (adminCard) {
        adminCard.style.display = "none";
      }
      if (adminCategory) {
        adminCategory.style.display = "none";
      }
    }
  } catch (error) {
    console.error("[Dashboard] Errore verifica permessi admin:", error);
    if (adminCard) {
      adminCard.style.display = "none";
    }
    if (adminCategory) {
      adminCategory.style.display = "none";
    }
  }
}

/**
 * Show module panel
 * BEST PRACTICE: Usa History API per supporto back button mobile
 * @param {string|null} moduleId - ID del modulo da mostrare
 * @param {boolean} pushState - Se true, fa pushState (default: true). Se false, non modifica history (utile in popstate)
 */
function showModule(moduleId, pushState = true) {
  // BEST PRACTICE: Push state invece di solo hash per back button support (solo se non siamo in popstate)
  if (pushState) {
    if (moduleId) {
      history.pushState({ module: moduleId }, "", `#${moduleId}`);
    } else {
      history.pushState({ module: null }, "", window.location.pathname);
    }
  }

  // Hide all views
  const modulesView = document.getElementById("modules-view");
  if (modulesView) {
    modulesView.classList.remove("active");
  }

  document.querySelectorAll(".panel-view").forEach((panel) => {
    panel.classList.remove("active");
  });

  // Mostra/nascondi account banner (solo sulla home/overview)
  const accountBannerSlot = document.getElementById("account-banner-slot");
  if (accountBannerSlot) {
    if (!moduleId || moduleId === "overview") {
      // Mostra banner solo sulla home o su overview
      accountBannerSlot.style.display = "";
    } else {
      // Nascondi banner su altre pagine
      accountBannerSlot.style.display = "none";
    }
  }

  if (!moduleId) {
    // Show modules grid
    if (modulesView) {
      modulesView.classList.add("active");
    }
    STATE.currentModule = null;

    // BEST PRACTICE: Deactivate focus trap when returning to modules view
    keyboardNav.deactivateFocusTrap();
    keyboardNav.updateModuleCards(); // Update module cards list

    return;
  }

  // Show panel
  const panel = document.getElementById(`panel-${moduleId}`);
  if (panel) {
    panel.classList.add("active");
    STATE.currentModule = moduleId;

    // BEST PRACTICE: Activate focus trap for panel (WCAG 2.2 SC 2.1.1)
    keyboardNav.activateFocusTrap(panel);

    loadModule(moduleId);
  }
}

/**
 * Verifica autenticazione utente
 * Best Practice: Separazione autenticazione da dashboard
 * @returns {Promise<{authenticated: boolean, reason?: string}>}
 */
async function checkAuthentication() {
  const token = localStorage.getItem("tradelia-access-token-v1");

  if (!token) {
    return { authenticated: false, reason: "missing_token" };
  }

  try {
    // Verifica token con API
    const response = await fetch("/api/auth?action=validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      // Token non valido o scaduto
      localStorage.removeItem("tradelia-access-token-v1");
      return { authenticated: false, reason: "invalid_token" };
    }

    const data = await response.json();

    if (!data.ok) {
      // Token scaduto o revocato
      localStorage.removeItem("tradelia-access-token-v1");
      return { authenticated: false, reason: data.reason || "invalid_token" };
    }

    // Verifica scadenza
    if (data.validUntil) {
      const expiryDate = new Date(data.validUntil);
      if (expiryDate < new Date()) {
        localStorage.removeItem("tradelia-access-token-v1");
        return { authenticated: false, reason: "expired_token" };
      }
    }

    // BEST PRACTICE: NON reindirizzare automaticamente
    // Se c'è un problema di pagamento, viene mostrato un warning nel banner
    // L'utente può cliccare su "Gestisci Pagamento" per andare a accesso.html
    // MA non facciamo redirect automatico - accesso guest sempre consentito
    if (data.status === "pending_payment" || data.status === "pending_manual") {
      // Pagamento in attesa: mostra warning ma NON reindirizza
      // L'utente può cliccare su "Gestisci Pagamento" nel banner se vuole
      return {
        authenticated: true, // Permetti accesso anche con pagamento in attesa
        reason: "payment_required",
        // redirectTo rimosso - non fare redirect automatico
      };
    }

    // Scadenza imminente (entro 7 giorni): suggerisci modale
    if (data.daysLeft !== undefined && data.daysLeft <= 7 && data.daysLeft > 0) {
      // Non blocca accesso, ma potrebbe mostrare warning
      // Per ora permette accesso, ma potrebbe essere migliorato
    }

    // Token valido
    return { authenticated: true };
  } catch (error) {
    console.error("[Dashboard] Errore verifica autenticazione:", error);
    // In caso di errore, permettere accesso guest (fallback)
    // Ma loggare per debug
    return { authenticated: false, reason: "auth_error" };
  }
}

// Make STATE available globally for modules that need it
window.DASHBOARD_STATE = STATE;
