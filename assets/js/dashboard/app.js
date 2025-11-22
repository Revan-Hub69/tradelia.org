/* eslint-env browser */
/**
 * Dashboard Application Entry Point
 * FASE 2: TypeScript Migration - Gradual
 * Best Practice: Separazione concerns - logica navigazione separata da HTML
 */

import { loadModule } from "./index.js";
import { initAccountBanner } from "./account-banner.js";
import { initFooter } from "./footer.js";
import { isAdmin } from "./permissions.js";
import { getUserRole } from "./auth.js";
import { startSessionCheck } from "./session.js";
import { keyboardNav } from "./keyboard-nav.js";
import { initModuleManager } from "./module-manager.js";
import { initGlobalSearch } from "./global-search.js";
import { initWatchlist } from "./watchlist.js";
import { initKeyboardShortcuts } from "./keyboard-shortcuts.js";
import { initAdvancedFilters } from "./advanced-filters.js";
import { initRecentActivity } from "./recent-activity.js";
import { initDashboardWidgets } from "./dashboard-widgets.js";
import { initPerformanceMonitoring } from "./performance-monitor.js";
import { initCharts } from "./charts.js";
import { initRUMDashboard } from "./rum-dashboard.js";
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
  const authCheck = await checkAuthentication();

  // Log per debug (non blocca l'accesso)
  if (!authCheck.authenticated) {
    console.log("[Dashboard] Accesso guest - token non presente o non valido");
  }

  // Initialize account banner (shows user status, plan, usage)
  await initAccountBanner();

  // Initialize footer
  await initFooter();

  // BEST PRACTICE: Avvia session management (periodic token check, auto-logout)
  startSessionCheck();

  // Show/hide admin module based on permissions
  await toggleAdminModule();

  // Initialize module manager (drag & drop, visibility, hierarchy)
  initModuleManager();

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

  // Initialize simple notifications (polling-based, no push)
  const { initSimpleNotifications } = await import("./simple-notifications.js");
  await initSimpleNotifications();

  // Handle hash navigation
  const hash = window.location.hash.slice(1);
  if (hash) {
    showModule(hash);
  }

  // Handle hash changes
  window.addEventListener("hashchange", () => {
    const newHash = window.location.hash.slice(1);
    showModule(newHash || null);
  });

  // Handle module card clicks
  document.querySelectorAll(".module-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      const moduleId = card.dataset.module;
      if (moduleId) {
        window.location.hash = moduleId;
      }
    });
  });

  // Handle back buttons
  document.querySelectorAll(".panel-back").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.hash = "";
    });
  });

  // Initialize keyboard navigation (focus trap, arrow keys)
  keyboardNav.init();

  // Keyboard navigation - ESC to close panel
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && STATE.currentModule) {
      window.location.hash = "";
      keyboardNav.deactivateFocusTrap();
    }
  });
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
 */
function showModule(moduleId) {
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

    // BEST PRACTICE: Reindirizza a accesso.html se serve gestione pagamento/account
    // Verifica se ci sono problemi che richiedono modale account
    if (data.status === "pending_payment" || data.status === "pending_manual") {
      // Pagamento in attesa: reindirizza a accesso.html con modale
      return {
        authenticated: false,
        reason: "payment_required",
        redirectTo: `/accesso.html?reason=payment_required&modal=payment&token=${encodeURIComponent(token)}`,
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
