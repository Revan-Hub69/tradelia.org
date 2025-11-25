/* eslint-env browser */
/**
 * Education Storage V2 - IndexedDB + Sync Intelligente
 * Sostituisce localStorage con IndexedDB per storage robusto
 * Best Practice 2025: Offline-First Architecture
 */

import { safeLog } from "./security-utils.js";

const DB_NAME = "tradelia-education";
const DB_VERSION = 1;

let dbInstance = null;

/**
 * Inizializza IndexedDB
 */
export async function initEducationDB() {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      safeLog("error", "[EducationStorage] Errore apertura IndexedDB:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      safeLog("log", "[EducationStorage] IndexedDB inizializzato");
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Store per progress utente
      if (!db.objectStoreNames.contains("progress")) {
        const progressStore = db.createObjectStore("progress", { keyPath: "id" });
        progressStore.createIndex("userId", "userId", { unique: false });
        progressStore.createIndex("updatedAt", "updatedAt", { unique: false });
      }

      // Store per cache moduli
      if (!db.objectStoreNames.contains("modules")) {
        const modulesStore = db.createObjectStore("modules", { keyPath: "id" });
        modulesStore.createIndex("slug", "slug", { unique: true });
        modulesStore.createIndex("updatedAt", "updatedAt", { unique: false });
      }

      // Store per analytics
      if (!db.objectStoreNames.contains("analytics")) {
        const analyticsStore = db.createObjectStore("analytics", { keyPath: "timestamp" });
        analyticsStore.createIndex("type", "type", { unique: false });
        analyticsStore.createIndex("userId", "userId", { unique: false });
      }

      // Store per sync queue (operazioni da sincronizzare)
      if (!db.objectStoreNames.contains("syncQueue")) {
        const syncStore = db.createObjectStore("syncQueue", { keyPath: "id", autoIncrement: true });
        syncStore.createIndex("type", "type", { unique: false });
        syncStore.createIndex("timestamp", "timestamp", { unique: false });
      }

      safeLog("log", "[EducationStorage] IndexedDB schema creato");
    };
  });
}

/**
 * Salva progress utente
 */
export async function saveProgress(progress, userId = null) {
  try {
    const db = await initEducationDB();
    const transaction = db.transaction(["progress"], "readwrite");
    const store = transaction.objectStore("progress");

    const progressData = {
      id: userId ? `user-${userId}` : "guest",
      userId: userId,
      ...progress,
      updatedAt: new Date().toISOString(),
    };

    await store.put(progressData);
    safeLog("log", "[EducationStorage] Progress salvato:", progressData.id);
    return true;
  } catch (error) {
    safeLog("error", "[EducationStorage] Errore salvataggio progress:", error);
    // Fallback a localStorage
    return saveProgressFallback(progress);
  }
}

/**
 * Carica progress utente
 */
export async function loadProgress(userId = null) {
  try {
    const db = await initEducationDB();
    const transaction = db.transaction(["progress"], "readonly");
    const store = transaction.objectStore("progress");

    const id = userId ? `user-${userId}` : "guest";
    const request = store.get(id);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          safeLog("log", "[EducationStorage] Progress caricato:", id);
          // Rimuovi id e userId dal risultato
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id: _id, userId: _userId, updatedAt: _updatedAt, ...progress } = result;
          resolve(progress);
        } else {
          // Fallback a localStorage
          const fallback = loadProgressFallback();
          resolve(fallback);
        }
      };

      request.onerror = () => {
        safeLog("error", "[EducationStorage] Errore caricamento progress:", request.error);
        // Fallback a localStorage
        const fallback = loadProgressFallback();
        resolve(fallback);
      };
    });
  } catch (error) {
    safeLog("error", "[EducationStorage] Errore caricamento progress:", error);
    // Fallback a localStorage
    return loadProgressFallback();
  }
}

/**
 * Salva modulo in cache
 */
export async function cacheModule(module) {
  try {
    const db = await initEducationDB();
    const transaction = db.transaction(["modules"], "readwrite");
    const store = transaction.objectStore("modules");

    const moduleData = {
      ...module,
      updatedAt: new Date().toISOString(),
    };

    await store.put(moduleData);
    safeLog("log", "[EducationStorage] Modulo cachato:", module.id);
    return true;
  } catch (error) {
    safeLog("error", "[EducationStorage] Errore cache modulo:", error);
    return false;
  }
}

/**
 * Carica modulo da cache
 */
export async function getCachedModule(moduleId) {
  try {
    const db = await initEducationDB();
    const transaction = db.transaction(["modules"], "readonly");
    const store = transaction.objectStore("modules");

    const request = store.get(moduleId);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Verifica se cache è ancora valida (24h)
          const cacheAge = Date.now() - new Date(result.updatedAt).getTime();
          const maxAge = 24 * 60 * 60 * 1000; // 24h

          if (cacheAge < maxAge) {
            safeLog("log", "[EducationStorage] Modulo caricato da cache:", moduleId);
            resolve(result);
          } else {
            safeLog("log", "[EducationStorage] Cache modulo scaduta:", moduleId);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        safeLog("error", "[EducationStorage] Errore caricamento cache modulo:", request.error);
        resolve(null);
      };
    });
  } catch (error) {
    safeLog("error", "[EducationStorage] Errore caricamento cache modulo:", error);
    return null;
  }
}

/**
 * Aggiungi operazione a sync queue
 */
export async function addToSyncQueue(operation) {
  try {
    const db = await initEducationDB();
    const transaction = db.transaction(["syncQueue"], "readwrite");
    const store = transaction.objectStore("syncQueue");

    const queueItem = {
      type: operation.type, // 'progress', 'lesson_complete', etc.
      data: operation.data,
      timestamp: new Date().toISOString(),
      retries: 0,
    };

    await store.add(queueItem);
    safeLog("log", "[EducationStorage] Operazione aggiunta a sync queue:", operation.type);
    return true;
  } catch (error) {
    safeLog("error", "[EducationStorage] Errore aggiunta a sync queue:", error);
    return false;
  }
}

/**
 * Processa sync queue
 */
export async function processSyncQueue(apiCall) {
  try {
    const db = await initEducationDB();
    const transaction = db.transaction(["syncQueue"], "readwrite");
    const store = transaction.objectStore("syncQueue");
    const index = store.index("timestamp");

    const request = index.getAll();

    return new Promise((resolve) => {
      request.onsuccess = async () => {
        const queue = request.result;
        if (queue.length === 0) {
          resolve({ success: true, processed: 0 });
          return;
        }

        let processed = 0;
        const failed = [];

        for (const item of queue) {
          try {
            // Esegui API call
            await apiCall(item.type, item.data);

            // Rimuovi da queue se successo
            await store.delete(item.id);
            processed++;
          } catch (error) {
            safeLog("error", "[EducationStorage] Errore sync operazione:", error);
            // Incrementa retries
            item.retries++;
            if (item.retries < 3) {
              // Re-queue se retries < 3
              await store.put(item);
            } else {
              // Rimuovi se troppi retries
              await store.delete(item.id);
              failed.push(item);
            }
          }
        }

        safeLog("log", "[EducationStorage] Sync queue processata:", {
          processed,
          failed: failed.length,
        });
        resolve({ success: true, processed, failed: failed.length });
      };

      request.onerror = () => {
        safeLog("error", "[EducationStorage] Errore processamento sync queue:", request.error);
        resolve({ success: false, error: request.error });
      };
    });
  } catch (error) {
    safeLog("error", "[EducationStorage] Errore processamento sync queue:", error);
    return { success: false, error };
  }
}

/**
 * Salva analytics event
 */
export async function saveAnalytics(event) {
  try {
    const db = await initEducationDB();
    const transaction = db.transaction(["analytics"], "readwrite");
    const store = transaction.objectStore("analytics");

    const analyticsData = {
      timestamp: new Date().toISOString(),
      type: event.type,
      userId: event.userId || null,
      data: event.data,
    };

    await store.add(analyticsData);
    safeLog("log", "[EducationStorage] Analytics salvato:", event.type);
    return true;
  } catch (error) {
    safeLog("error", "[EducationStorage] Errore salvataggio analytics:", error);
    return false;
  }
}

/**
 * Fallback: localStorage (per compatibilità)
 */
function saveProgressFallback(progress) {
  try {
    localStorage.setItem("tradelia_education_progress", JSON.stringify(progress));
    return true;
  } catch (error) {
    safeLog("error", "[EducationStorage] Errore fallback localStorage:", error);
    return false;
  }
}

function loadProgressFallback() {
  try {
    const stored = localStorage.getItem("tradelia_education_progress");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    safeLog("error", "[EducationStorage] Errore fallback localStorage:", error);
  }
  return null;
}

/**
 * Migra dati da localStorage a IndexedDB
 */
export async function migrateFromLocalStorage(userId = null) {
  try {
    const stored = localStorage.getItem("tradelia_education_progress");
    if (!stored) {
      return false;
    }

    const progress = JSON.parse(stored);
    await saveProgress(progress, userId);

    // Rimuovi da localStorage dopo migrazione
    localStorage.removeItem("tradelia_education_progress");
    safeLog("log", "[EducationStorage] Migrazione completata");
    return true;
  } catch (error) {
    safeLog("error", "[EducationStorage] Errore migrazione:", error);
    return false;
  }
}

/**
 * Pulisci cache vecchia (> 7 giorni)
 */
export async function cleanOldCache() {
  try {
    const db = await initEducationDB();
    const transaction = db.transaction(["modules", "analytics"], "readwrite");
    const modulesStore = transaction.objectStore("modules");
    const analyticsStore = transaction.objectStore("analytics");

    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 giorni
    const cutoff = new Date(Date.now() - maxAge).toISOString();

    // Pulisci moduli vecchi
    const modulesIndex = modulesStore.index("updatedAt");
    const modulesRequest = modulesIndex.openCursor(IDBKeyRange.upperBound(cutoff));

    modulesRequest.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    // Pulisci analytics vecchi
    const analyticsIndex = analyticsStore.index("timestamp");
    const analyticsRequest = analyticsIndex.openCursor(IDBKeyRange.upperBound(cutoff));

    analyticsRequest.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    await transaction.complete;
    safeLog("log", "[EducationStorage] Cache pulita");
    return true;
  } catch (error) {
    safeLog("error", "[EducationStorage] Errore pulizia cache:", error);
    return false;
  }
}
