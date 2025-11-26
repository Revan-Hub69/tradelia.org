/* eslint-env browser */
/**
 * Dashboard Main Module Loader
 * Carica moduli dashboard in base al panel attivo
 * Best Practice 2025: Dynamic imports per code splitting
 */

import { safeLog } from "./security-utils.js";

/**
 * Module loader map with dynamic imports
 * Moduli caricati solo quando necessari (lazy loading)
 */
const MODULE_LOADERS = {
  overview: async () => {
    const { loadOverview } = await import("./overview.js");
    return loadOverview();
  },
  reports: async () => {
    const { loadReports } = await import("./reports.js");
    return loadReports();
  },
  frameworks: async () => {
    const { loadFrameworks } = await import("./frameworks.js");
    return loadFrameworks();
  },
  "requests-history": async () => {
    const { loadRequestsHistory } = await import("./requests-history.js");
    return loadRequestsHistory();
  },
  notifications: async () => {
    const { loadNotifications } = await import("./notifications.js");
    return loadNotifications();
  },
  settings: async () => {
    const { loadSettings } = await import("./settings.js");
    return loadSettings();
  },
  resources: async () => {
    const { loadResources } = await import("./resources.js");
    return loadResources();
  },
  access: async () => {
    const { loadAccess } = await import("./access.js");
    return loadAccess();
  },
  "on-demand": async () => {
    const { loadOnDemand } = await import("./on-demand.js");
    return loadOnDemand();
  },
  community: async () => {
    const { loadCommunity } = await import("./community.js");
    return loadCommunity();
  },
  education: async () => {
    const { loadEducation } = await import("./education.js");
    return loadEducation();
  },
  admin: async () => {
    const { loadAdmin } = await import("./admin.js");
    return loadAdmin();
  },
  brokers: async () => {
    const { loadBrokers } = await import("./brokers.js");
    return loadBrokers();
  },
};

/**
 * Load module dynamically (code splitting)
 * @param {string} moduleId - Module identifier
 * @returns {Promise<void>}
 */
export async function loadModule(moduleId) {
  const loader = MODULE_LOADERS[moduleId];
  if (loader) {
    try {
      await loader();
      safeLog("log", `[Dashboard] Modulo ${moduleId} caricato`);
    } catch (error) {
      safeLog("error", `[Dashboard] Errore caricamento modulo ${moduleId}:`, error);
      throw error;
    }
  } else {
    safeLog("warn", `[Dashboard] Modulo ${moduleId} non trovato`);
  }
}

/**
 * Preload module (load in background)
 * @param {string} moduleId - Module identifier
 * @returns {Promise<void>}
 */
export async function preloadModule(moduleId) {
  const loader = MODULE_LOADERS[moduleId];
  if (loader) {
    try {
      // Load but don't initialize
      await loader();
      safeLog("log", `[Dashboard] Modulo ${moduleId} preloadato`);
    } catch (error) {
      safeLog("warn", `[Dashboard] Errore preload modulo ${moduleId}:`, error);
    }
  }
}

/**
 * Preload multiple modules
 * @param {string[]} moduleIds - Array of module IDs
 * @returns {Promise<void>}
 */
export async function preloadModules(moduleIds) {
  const promises = moduleIds.map(id => preloadModule(id));
  await Promise.allSettled(promises);
}
