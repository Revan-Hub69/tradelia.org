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

const DEFAULT_IDLE_TIMEOUT = 1600;

function schedulePhase(task, label, timeout = DEFAULT_IDLE_TIMEOUT) {
  const runner = () => {
    if (typeof performance !== "undefined" && performance.mark) {
      performance.mark(`${label}-start`);
    }
    Promise.resolve()
      .then(task)
      .catch((error) => {
        console.error(`[Dashboard] Phase ${label} error`, error);
      })
      .finally(() => {
        if (typeof performance !== "undefined" && performance.mark) {
          performance.mark(`${label}-end`);
        }
      });
  };

  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(runner, { timeout });
  } else {
    setTimeout(runner, timeout);
  }
}

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
    // eslint-disable-next-line no-console
    console.log("[Dashboard] Accesso guest - token non presente o non valido");
  }

  // NON fare redirect automatico - accesso libero sempre consentito
  // Se c'è un redirectTo, viene IGNORATO per permettere accesso guest
  // L'utente può accedere alla pagina di accesso tramite il pulsante "Accedi" nel banner

  await runCorePhase();

  schedulePhase(runExperiencePhase, "dashboard-phase-experience");
  schedulePhase(() => runInsightPhase(), "dashboard-phase-insights", 2000);
  schedulePhase(() => runProgressiveEnhancements(), "dashboard-phase-progressive", 2600);
}

// Bottom navigation rimosso - non più utilizzato

async function runCorePhase() {
  await initAccountBanner();
  await initFooter();
  startSessionCheck();

  await toggleAdminModule();
  initModuleManager();
  initCategoryAccordion();
  window.addEventListener("resize", reinitCategoryAccordion);

  enforceDarkTheme();
  await initializeI18nAndFeedback();

  initHistoryState();
  bindModuleCardInteractions();
  bindPanelBackButtons();

  keyboardNav.init();
  document.addEventListener("keydown", handleEscapeKey);
}

async function runExperiencePhase() {
  const { initModuleFavorites, createFavoritesSection } = await import("./module-favorites.js");
  initModuleFavorites();
  setTimeout(() => {
    createFavoritesSection();
    window.addEventListener("storage", (e) => {
      if (e.key === "dashboard-module-favorites") {
        createFavoritesSection();
      }
    });
  }, 120);

  const { initAccessibility, announceToScreenReader } = await import("./accessibility.js");
  initAccessibility();
  window.announceToScreenReader = announceToScreenReader;

  const { initSecurityIndicators } = await import("./security-indicators.js");
  initSecurityIndicators();

  initGlobalSearch();
  initWatchlist();
  initKeyboardShortcuts();
}

function runInsightPhase() {
  initAdvancedFilters();
  initRecentActivity();
  initDashboardWidgets();
  initPerformanceMonitoring();
  initCharts();
  initRUMDashboard();
}

async function runProgressiveEnhancements() {
  initCommunicationPreferences();

  const { initAuthModal } = await import("./auth-modal.js");
  initAuthModal();

  const { initSimpleNotifications } = await import("./simple-notifications.js");
  await initSimpleNotifications();

  const { initNetworkState } = await import("./network-state.js");
  initNetworkState();

  const { initPullToRefresh } = await import("./pull-to-refresh.js");
  initPullToRefresh();

  const { initBatteryOptimization } = await import("./battery-optimization.js");
  initBatteryOptimization();

  const { setupHapticFeedback } = await import("./haptic-feedback.js");
  setupHapticFeedback();
}

async function initializeI18nAndFeedback() {
  const { initI18n } = await import("./i18n.js");
  initI18n();

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
}

function enforceDarkTheme() {
  document.documentElement.setAttribute("data-theme", "dark");
  document.documentElement.setAttribute("data-theme-manual", "true");
}

function initHistoryState() {
  const initialHash = window.location.hash.slice(1);
  const initialModule = initialHash || null;

  if (!history.state) {
    const url = initialHash ? `${window.location.pathname}#${initialHash}` : window.location.pathname;
    history.replaceState({ module: initialModule, isInitial: true }, "", url);
  }

  const isMobile = window.innerWidth <= 768;

  if (initialHash) {
    showModule(initialHash, false);
  } else if (!isMobile) {
    showModulesGrid();
  } else {
    showModulesGrid();
  }

  window.addEventListener("hashchange", handleHashChange);
  window.addEventListener("popstate", handlePopState);
}

function showModulesGrid() {
  const modulesView = document.getElementById("modules-view");
  if (modulesView) {
    modulesView.classList.add("active");
  }
  document.querySelectorAll(".panel-view").forEach((panel) => {
    panel.classList.remove("active");
  });
  STATE.currentModule = null;
}

function handleHashChange() {
  const newHash = window.location.hash.slice(1);
  if (newHash) {
    showModule(newHash);
  } else {
    closeModule();
  }
}

function handlePopState(e) {
  if (e.state && e.state.isInitial) {
    return;
  }

  if (e.state && e.state.module) {
    showModule(e.state.module, false);
  } else {
    const hash = window.location.hash.slice(1);
    if (hash) {
      showModule(hash, false);
    } else if (STATE.currentModule) {
      closeModule(false);
    } else {
      showModulesGrid();
    }
  }
}

function bindModuleCardInteractions() {
  document.querySelectorAll(".module-card").forEach((card) => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoved = false;

    card.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchMoved = false;
    });

    card.addEventListener("touchmove", (e) => {
      if (!touchMoved) {
        const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
        const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
        touchMoved = deltaX > 10 || deltaY > 10;
      }
    });

    card.addEventListener("click", (e) => {
      const target = e.target;
      const isFavoriteBtn = target.closest(".module-favorite-btn");
      const isInteractiveElement = target.closest("button, a, input, select, textarea");

      if (isFavoriteBtn || isInteractiveElement) {
        e.stopPropagation();
        return;
      }

      if (touchMoved) {
        return;
      }

      const moduleId = card.dataset.module;
      if (moduleId) {
        e.preventDefault();
        e.stopPropagation();
        window.location.hash = moduleId;
      }
    });
  });
}

function bindPanelBackButtons() {
  document.querySelectorAll(".panel-back").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (history.length > 1) {
        history.back();
      } else {
        window.location.hash = "";
      }
    });
  });
}

function handleEscapeKey(e) {
  if (e.key === "Escape" && STATE.currentModule) {
    closeModule();
  }
}

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
