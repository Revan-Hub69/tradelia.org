/* eslint-env browser */
/**
 * Dashboard Main Module Loader
 * Carica moduli dashboard in base al panel attivo
 */

import { loadOverview } from "./overview.js";
import { safeLog } from "./security-utils.js";
import { loadReports } from "./reports.js";
import { loadFrameworks } from "./frameworks.js";
import { loadRequestsHistory } from "./requests-history.js";
import { loadNotifications } from "./notifications.js";
import { loadSettings } from "./settings.js";
import { loadResources } from "./resources.js";
import { loadAccess } from "./access.js";
import { loadOnDemand } from "./on-demand.js";
import { loadCommunity } from "./community.js";
import { loadEducation } from "./education.js";
import { loadAdmin } from "./admin.js";
import { loadBrokers } from "./brokers.js";

const MODULE_LOADERS = {
  overview: loadOverview,
  reports: loadReports,
  frameworks: loadFrameworks,
  "requests-history": loadRequestsHistory,
  notifications: loadNotifications,
  settings: loadSettings,
  resources: loadResources,
  access: loadAccess,
  "on-demand": loadOnDemand,
  community: loadCommunity,
  education: loadEducation,
  admin: loadAdmin,
  brokers: loadBrokers,
};

export async function loadModule(moduleId) {
  const loader = MODULE_LOADERS[moduleId];
  if (loader) {
    try {
      await loader();
    } catch (error) {
      safeLog("error", `[Dashboard] Errore caricamento modulo ${moduleId}:`, error);
    }
  } else {
    safeLog("warn", `[Dashboard] Modulo ${moduleId} non trovato`);
  }
}
