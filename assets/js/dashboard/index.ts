/**
 * Dashboard Module Loader
 * FASE 2: TypeScript Migration - Gradual
 */

import type { ModuleId, DashboardState } from "../types/dashboard.d.ts";

// Module registry
const modules: Record<string, () => Promise<void> | void> = {};

/**
 * Register a dashboard module
 */
export function registerModule(
  moduleId: ModuleId,
  loader: () => Promise<void> | void
): void {
  modules[moduleId] = loader;
}

/**
 * Load a dashboard module
 */
export async function loadModule(moduleId: ModuleId): Promise<void> {
  const loader = modules[moduleId];
  if (loader) {
    await loader();
  return;
  }

  // Dynamic import fallback
  try {
    const module = await import(`./${moduleId}.js`);
    if (module.default && typeof module.default === "function") {
      await module.default();
    }
  } catch (error) {
    console.error(`[Dashboard] Errore caricamento modulo ${moduleId}:`, error);
  }
}

// Register all modules
registerModule("overview", async () => {
  const { loadOverview } = await import("./overview.js");
  loadOverview();
});

registerModule("reports", async () => {
  const { loadReports } = await import("./reports.js");
  loadReports();
});

registerModule("frameworks", async () => {
  const { loadFrameworks } = await import("./frameworks.js");
  loadFrameworks();
});

registerModule("requests-history", async () => {
  const { loadRequestsHistory } = await import("./requests-history.js");
  loadRequestsHistory();
});

registerModule("notifications", async () => {
  const { loadNotifications } = await import("./notifications.js");
  loadNotifications();
});

registerModule("settings", async () => {
  const { loadSettings } = await import("./settings.js");
  loadSettings();
});

registerModule("resources", async () => {
  const { loadResources } = await import("./resources.js");
  loadResources();
});
