/**
 * Dashboard Main Module Loader
 * Carica moduli dashboard in base al panel attivo
 */

import { loadOverview } from './overview.js';
import { loadReports } from './reports.js';
import { loadFrameworks } from './frameworks.js';
import { loadRequestsHistory } from './requests-history.js';
import { loadNotifications } from './notifications.js';
import { loadSettings } from './settings.js';
import { loadResources } from './resources.js';

const MODULE_LOADERS = {
  overview: loadOverview,
  reports: loadReports,
  frameworks: loadFrameworks,
  'requests-history': loadRequestsHistory,
  notifications: loadNotifications,
  settings: loadSettings,
  resources: loadResources,
  // Sezioni vuote (in sviluppo)
  education: async () => {},
  access: async () => {},
  'on-demand': async () => {},
  community: async () => {},
};

export async function loadModule(moduleId) {
  const loader = MODULE_LOADERS[moduleId];
  if (loader) {
    try {
      await loader();
    } catch (error) {
      console.error(`[Dashboard] Errore caricamento modulo ${moduleId}:`, error);
    }
  } else {
    console.warn(`[Dashboard] Modulo ${moduleId} non trovato`);
  }
}
