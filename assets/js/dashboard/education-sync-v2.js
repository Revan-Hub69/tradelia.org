/* eslint-env browser */
/**
 * Education Sync V2 - Sync Intelligente Guest ↔ Autenticato
 * Best Practice 2025: Offline-First con Sync Automatico
 */

import { safeLog } from "./security-utils.js";
import {
  saveProgress,
  loadProgress,
  addToSyncQueue,
  processSyncQueue,
  migrateFromLocalStorage,
} from "./education-storage-v2.js";

const API_BASE = "/api/education";
let syncInProgress = false;
let syncInterval = null;

/**
 * Inizializza sync system
 */
export async function initSyncSystem() {
  // Migra dati da localStorage se presenti
  await migrateFromLocalStorage();

  // Setup online/offline listeners
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Auto-sync ogni 5 minuti se online
  if (navigator.onLine) {
    startAutoSync();
  }

  // Sync immediato se online
  if (navigator.onLine) {
    await syncProgress();
  }
}

/**
 * Sync progress guest ↔ autenticato
 */
export async function syncProgress(userId = null, token = null) {
  if (syncInProgress) {
    safeLog("warn", "[EducationSync] Sync già in corso");
    return { success: false, reason: "sync_in_progress" };
  }

  if (!navigator.onLine) {
    safeLog("warn", "[EducationSync] Offline, sync rimandato");
    return { success: false, reason: "offline" };
  }

  syncInProgress = true;

  try {
    // 1. Carica progress locale
    const localProgress = await loadProgress(userId);

    if (!localProgress) {
      syncInProgress = false;
      return { success: false, reason: "no_local_progress" };
    }

    if (!token || !userId) {
      // Guest mode: salva solo localmente
      syncInProgress = false;
      return { success: true, mode: "guest" };
    }

    // 2. Carica progress server
    let serverProgress = null;
    try {
      const response = await fetch(`${API_BASE}?action=user-progress`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        serverProgress = data.progress || data;
      }
    } catch (error) {
      safeLog("warn", "[EducationSync] Errore caricamento server progress:", error);
    }

    // 3. Merge intelligente
    const merged = mergeProgress(localProgress, serverProgress);

    // 4. Salva su server
    try {
      const saveResponse = await fetch(`${API_BASE}?action=update-progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ progress: merged }),
      });

      if (!saveResponse.ok) {
        throw new Error("Save failed");
      }
    } catch (error) {
      safeLog("error", "[EducationSync] Errore salvataggio server:", error);
      // Aggiungi a sync queue per retry
      await addToSyncQueue({
        type: "progress",
        data: merged,
      });
    }

    // 5. Aggiorna locale con merged
    await saveProgress(merged, userId);

    syncInProgress = false;
    safeLog("log", "[EducationSync] Sync completato");
    return { success: true, merged };
  } catch (error) {
    safeLog("error", "[EducationSync] Errore sync:", error);
    syncInProgress = false;
    return { success: false, error };
  }
}

/**
 * Merge progress locale e server (ultimo timestamp vince)
 */
function mergeProgress(local, server) {
  if (!server) {
    return local;
  }

  if (!local) {
    return server;
  }

  // Confronta timestamp
  const localTimestamp = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
  const serverTimestamp = server.updatedAt ? new Date(server.updatedAt).getTime() : 0;

  // Preferisci sempre il più recente
  const base = localTimestamp > serverTimestamp ? local : server;
  const other = localTimestamp > serverTimestamp ? server : local;

  // Merge moduli (preferisci sempre il più recente per modulo)
  const mergedModules = [];
  const moduleMap = new Map();

  // Aggiungi tutti i moduli da base
  if (base.modules && Array.isArray(base.modules)) {
    base.modules.forEach((module) => {
      moduleMap.set(module.id, { ...module, source: "base" });
    });
  }

  // Merge con altri moduli (solo se più recenti)
  if (other.modules && Array.isArray(other.modules)) {
    other.modules.forEach((module) => {
      const existing = moduleMap.get(module.id);
      if (!existing) {
        moduleMap.set(module.id, { ...module, source: "other" });
      } else {
        // Confronta timestamp modulo
        const existingTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
        const moduleTime = module.updatedAt ? new Date(module.updatedAt).getTime() : 0;
        if (moduleTime > existingTime) {
          moduleMap.set(module.id, { ...module, source: "other" });
        }
      }
    });
  }

  mergedModules.push(...Array.from(moduleMap.values()));

  // Merge stats (sempre il massimo)
  const mergedStats = {
    current_level: base.stats?.current_level || other.stats?.current_level || "Foundation",
    total_points: Math.max(base.stats?.total_points || 0, other.stats?.total_points || 0),
    modules_completed: Math.max(
      base.stats?.modules_completed || 0,
      other.stats?.modules_completed || 0
    ),
    current_streak_days: Math.max(
      base.stats?.current_streak_days || 0,
      other.stats?.current_streak_days || 0
    ),
  };

  // Merge badges (unione unica)
  const badgeMap = new Map();
  if (base.badges && Array.isArray(base.badges)) {
    base.badges.forEach((badge) => {
      badgeMap.set(badge.id || badge.name, badge);
    });
  }
  if (other.badges && Array.isArray(other.badges)) {
    other.badges.forEach((badge) => {
      if (!badgeMap.has(badge.id || badge.name)) {
        badgeMap.set(badge.id || badge.name, badge);
      }
    });
  }

  return {
    ...base,
    modules: mergedModules,
    stats: mergedStats,
    badges: Array.from(badgeMap.values()),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Handle online event
 */
async function handleOnline() {
  safeLog("log", "[EducationSync] Online, avvio sync");
  await syncProgress();
  await processSyncQueue(executeSyncOperation);
  startAutoSync();
}

/**
 * Handle offline event
 */
function handleOffline() {
  safeLog("log", "[EducationSync] Offline, sync sospeso");
  stopAutoSync();
}

/**
 * Start auto-sync interval
 */
function startAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
  }

  // Sync ogni 5 minuti
  syncInterval = setInterval(
    async () => {
      if (navigator.onLine) {
        await syncProgress();
      }
    },
    5 * 60 * 1000
  );
}

/**
 * Stop auto-sync interval
 */
function stopAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

/**
 * Execute sync operation from queue
 */
async function executeSyncOperation(type, data) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("No token");
  }

  switch (type) {
    case "progress": {
      const response = await fetch(`${API_BASE}?action=update-progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ progress: data }),
      });

      if (!response.ok) {
        throw new Error("Sync failed");
      }
      break;
    }

    default:
      safeLog("warn", "[EducationSync] Tipo operazione sconosciuto:", type);
  }
}

/**
 * Get auth token (helper)
 */
async function getAuthToken() {
  try {
    const { getToken } = await import("./token-storage.js");
    return await getToken();
  } catch {
    return null;
  }
}

/**
 * Switch da guest a autenticato
 */
export async function switchToAuthenticated(userId, token) {
  safeLog("log", "[EducationSync] Switch a autenticato:", userId);

  // 1. Carica progress guest
  const guestProgress = await loadProgress(null);

  // 2. Migra a userId
  if (guestProgress) {
    await saveProgress(guestProgress, userId);
  }

  // 3. Sync con server
  await syncProgress(userId, token);
}

/**
 * Switch da autenticato a guest
 */
export async function switchToGuest() {
  safeLog("log", "[EducationSync] Switch a guest");

  // Salva progress locale come guest
  // (mantieni ultimo stato)
  stopAutoSync();
}
