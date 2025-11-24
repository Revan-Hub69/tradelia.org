/**
 * Dashboard Module: Settings
 * Impostazioni utente, preferenze, export dati
 */

import {
  toggleModuleVisibility,
  resetModuleOrder,
  getModuleVisibility,
  getModuleOrder,
} from "./module-manager.js";

export async function loadSettings() {
  // Carica preferenze salvate
  loadSavedPreferences();

  // Setup event listeners
  setupSettingsListeners();

  // Setup module visibility toggles
  setupModuleVisibilityToggles();
}

function loadSavedPreferences() {
  // Carica da localStorage
  const density = localStorage.getItem("dashboard-density") || "comfortable";
  const emailNotifications = localStorage.getItem("dashboard-email-notifications") === "true";
  const systemNotifications = localStorage.getItem("dashboard-system-notifications") === "true";

  const densitySelect = document.getElementById("setting-density");
  if (densitySelect) {
    densitySelect.value = density;
  }

  const emailToggle = document.getElementById("setting-email-notifications");
  if (emailToggle) {
    emailToggle.checked = emailNotifications;
  }

  const systemToggle = document.getElementById("setting-system-notifications");
  if (systemToggle) {
    systemToggle.checked = systemNotifications;
  }
}

function setupSettingsListeners() {
  // Densità contenuti
  const densitySelect = document.getElementById("setting-density");
  if (densitySelect) {
    densitySelect.addEventListener("change", (e) => {
      localStorage.setItem("dashboard-density", e.target.value);
      applyDensity(e.target.value);
    });
  }

  // Notifiche email
  const emailToggle = document.getElementById("setting-email-notifications");
  if (emailToggle) {
    emailToggle.addEventListener("change", (e) => {
      localStorage.setItem("dashboard-email-notifications", e.target.checked);
    });
  }

  // Notifiche sistema
  const systemToggle = document.getElementById("setting-system-notifications");
  if (systemToggle) {
    systemToggle.addEventListener("change", (e) => {
      localStorage.setItem("dashboard-system-notifications", e.target.checked);
    });
  }

  // Export dati
  const exportBtn = document.getElementById("btn-export-data");
  if (exportBtn) {
    exportBtn.addEventListener("click", handleExportData);
  }

  // Reset module order
  const resetOrderBtn = document.getElementById("btn-reset-module-order");
  if (resetOrderBtn) {
    resetOrderBtn.addEventListener("click", () => {
      if (confirm("Vuoi ripristinare l'ordine e la visibilità predefinita dei moduli?")) {
        resetModuleOrder();
      }
    });
  }
}

/**
 * Setup module visibility toggles
 */
function setupModuleVisibilityToggles() {
  const visibilityContainer = document.getElementById("module-visibility-container");
  if (!visibilityContainer) {
    // Create container if it doesn't exist
    const settingsContainer = document.querySelector(".panel-content");
    if (settingsContainer) {
      const moduleSection = document.createElement("div");
      moduleSection.className = "settings-section";
      moduleSection.innerHTML = `
        <h3 class="settings-section-title">Gestione Moduli</h3>
        <div id="module-visibility-container" class="module-visibility-container"></div>
        <div class="settings-actions">
          <button id="btn-reset-module-order" class="btn btn-secondary">
            Ripristina ordine predefinito
          </button>
        </div>
      `;
      settingsContainer.appendChild(moduleSection);

      // Setup reset button
      const resetBtn = document.getElementById("btn-reset-module-order");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          if (confirm("Vuoi ripristinare l'ordine e la visibilità predefinita dei moduli?")) {
            resetModuleOrder();
          }
        });
      }
    }
  }

  // Render module visibility toggles
  renderModuleVisibilityToggles();
}

/**
 * Render module visibility toggles
 */
function renderModuleVisibilityToggles() {
  const container = document.getElementById("module-visibility-container");
  if (!container) {
    return;
  }

  const moduleNames = {
    overview: "Panoramica",
    reports: "Report Ufficiali",
    settings: "Impostazioni",
    brokers: "Broker Regolamentati",
    admin: "Amministrazione",
  };

  const currentVisibility = getModuleVisibility();
  const order = getModuleOrder();

  container.innerHTML = `
    <div class="module-visibility-list">
      ${order
        .map((moduleId) => {
          const isVisible = currentVisibility[moduleId] !== false; // Default visible
          return `
          <div class="module-visibility-item">
            <label class="toggle-label">
              <input 
                type="checkbox" 
                class="module-visibility-toggle" 
                data-module="${moduleId}"
                ${isVisible ? "checked" : ""}
              />
              <span class="toggle-text">${moduleNames[moduleId] || moduleId}</span>
            </label>
          </div>
        `;
        })
        .join("")}
    </div>
    <p class="settings-help-text">
      Deseleziona i moduli che vuoi nascondere dalla griglia principale.
      Puoi riordinare i moduli trascinandoli nella griglia.
    </p>
  `;

  // Setup toggle listeners
  container.querySelectorAll(".module-visibility-toggle").forEach((toggle) => {
    toggle.addEventListener("change", (e) => {
      const moduleId = e.target.dataset.module;
      const isVisible = e.target.checked;
      toggleModuleVisibility(moduleId, isVisible);
    });
  });
}

function applyDensity(density) {
  document.body.setAttribute("data-density", density);
  // TODO: Applicare stili CSS per densità
}

async function handleExportData() {
  try {
    // Raccogli dati utente
    const exportData = {
      timestamp: new Date().toISOString(),
      preferences: {
        density: localStorage.getItem("dashboard-density") || "comfortable",
        emailNotifications: localStorage.getItem("dashboard-email-notifications") === "true",
        systemNotifications: localStorage.getItem("dashboard-system-notifications") === "true",
      },
      recentReports: JSON.parse(localStorage.getItem("tradelia-recent-reports") || "[]"),
      accessToken: localStorage.getItem("tradelia-access-token-v1") ? "***" : null,
    };

    // Crea file JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tradelia-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Toast success
    if (window.showToast) {
      window.showToast("Dati esportati con successo", "success");
    }
  } catch (err) {
    console.error("[Settings] Errore export:", err);
    if (window.showToast) {
      window.showToast("Errore durante l'export dei dati", "error");
    }
  }
}
