/**
 * Centralized Storage Utility
 * Best Practice 2025: Use IndexedDB for persistent storage
 * Fallback to localStorage for compatibility
 */

import { safeLog } from '../dashboard/security-utils.js';

const DB_NAME = 'tradelia_storage';
const DB_VERSION = 1;
const STORE_NAME = 'data';

let db = null;
let dbPromise = null;

/**
 * Initialize IndexedDB
 * @returns {Promise<IDBDatabase>}
 */
function initDB() {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      safeLog('warn', '[Storage] IndexedDB not supported, using localStorage');
      resolve(null);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      safeLog('error', '[Storage] IndexedDB open error', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      safeLog('log', '[Storage] IndexedDB opened successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
  });

  return dbPromise;
}

/**
 * Get value from IndexedDB
 * @param {string} key - Storage key
 * @returns {Promise<*>}
 */
async function getIndexedDB(key) {
  try {
    const database = await initDB();
    if (!database) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    safeLog('error', '[Storage] IndexedDB get error', error);
    return null;
  }
}

/**
 * Set value in IndexedDB
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {Promise<void>}
 */
async function setIndexedDB(key, value) {
  try {
    const database = await initDB();
    if (!database) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    safeLog('error', '[Storage] IndexedDB set error', error);
  }
}

/**
 * Remove value from IndexedDB
 * @param {string} key - Storage key
 * @returns {Promise<void>}
 */
async function removeIndexedDB(key) {
  try {
    const database = await initDB();
    if (!database) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    safeLog('error', '[Storage] IndexedDB remove error', error);
  }
}

/**
 * Get value from localStorage (fallback)
 * @param {string} key - Storage key
 * @returns {*}
 */
function getLocalStorage(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    safeLog('error', '[Storage] localStorage get error', error);
    return null;
  }
}

/**
 * Set value in localStorage (fallback)
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    safeLog('error', '[Storage] localStorage set error', error);
  }
}

/**
 * Remove value from localStorage (fallback)
 * @param {string} key - Storage key
 */
function removeLocalStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    safeLog('error', '[Storage] localStorage remove error', error);
  }
}

/**
 * Storage API - Unified interface
 */
export const storage = {
  /**
   * Get value from storage (IndexedDB with localStorage fallback)
   * @param {string} key - Storage key
   * @returns {Promise<*>}
   */
  async get(key) {
    // Try IndexedDB first
    if ('indexedDB' in window) {
      const value = await getIndexedDB(key);
      if (value !== null) {
        return value;
      }
    }

    // Fallback to localStorage
    return getLocalStorage(key);
  },

  /**
   * Set value in storage (IndexedDB with localStorage fallback)
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {Promise<void>}
   */
  async set(key, value) {
    // Try IndexedDB first
    if ('indexedDB' in window) {
      await setIndexedDB(key, value);
    }

    // Also store in localStorage as backup
    setLocalStorage(key, value);
  },

  /**
   * Remove value from storage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  async remove(key) {
    // Remove from both
    if ('indexedDB' in window) {
      await removeIndexedDB(key);
    }
    removeLocalStorage(key);
  },

  /**
   * Clear all storage
   * @returns {Promise<void>}
   */
  async clear() {
    if ('indexedDB' in window) {
      try {
        const database = await initDB();
        if (database) {
          const transaction = database.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          await store.clear();
        }
      } catch (error) {
        safeLog('error', '[Storage] IndexedDB clear error', error);
      }
    }
    localStorage.clear();
  },
};

/**
 * Migrate data from localStorage to IndexedDB
 * @param {string[]} keys - Keys to migrate
 * @returns {Promise<void>}
 */
export async function migrateToIndexedDB(keys = []) {
  if (!('indexedDB' in window)) {
    return;
  }

  for (const key of keys) {
    try {
      const value = getLocalStorage(key);
      if (value !== null) {
        await setIndexedDB(key, value);
        safeLog('log', `[Storage] Migrated ${key} to IndexedDB`);
      }
    } catch (error) {
      safeLog('error', `[Storage] Migration error for ${key}`, error);
    }
  }
}

