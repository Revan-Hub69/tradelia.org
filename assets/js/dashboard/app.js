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
  // Initialize account banner (shows user status, plan, usage)
  await initAccountBanner();

  // Initialize footer
  await initFooter();

  // Show/hide admin module based on permissions
  await toggleAdminModule();

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

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && STATE.currentModule) {
      window.location.hash = "";
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

  if (!moduleId) {
    // Show modules grid
    if (modulesView) {
      modulesView.classList.add("active");
    }
    STATE.currentModule = null;
    return;
  }

  // Show panel
  const panel = document.getElementById(`panel-${moduleId}`);
  if (panel) {
    panel.classList.add("active");
    STATE.currentModule = moduleId;
    loadModule(moduleId);
  }
}

// Make STATE available globally for modules that need it
window.DASHBOARD_STATE = STATE;
