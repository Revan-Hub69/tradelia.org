/**
 * IndexedDB Storage Utility
 * 
 * Best Practice 2025: Use IndexedDB instead of localStorage for:
 * - Better performance with large data
 * - Larger storage capacity (~50% of disk space)
 * - Asynchronous operations (non-blocking)
 * - Better error handling
 * - Structured data queries
 */

const DB_NAME = 'tradelia-storage';
const DB_VERSION = 1;
const STORE_NAME = 'data';

interface StorageItem {
  key: string;
  value: any;
  timestamp: number;
}

let db: IDBDatabase | null = null;
let initPromise: Promise<IDBDatabase> | null = null;

/**
 * Initialize IndexedDB database
 */
function initDB(): Promise<IDBDatabase> {
  if (initPromise) {
    return initPromise;
  }

  if (typeof window === 'undefined') {
    throw new Error('IndexedDB is only available in browser');
  }

  initPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'key' });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });

  return initPromise;
}

/**
 * Get value from IndexedDB
 */
export async function getItem<T = any>(key: string): Promise<T | null> {
  try {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve(result.value);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(new Error(`Failed to get item: ${key}`));
      };
    });
  } catch (error) {
    console.warn('IndexedDB getItem error:', error);
    return null;
  }
}

/**
 * Set value in IndexedDB
 */
export async function setItem<T = any>(key: string, value: T): Promise<void> {
  try {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const item: StorageItem = {
        key,
        value,
        timestamp: Date.now(),
      };

      const request = store.put(item);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to set item: ${key}`));
      };
    });
  } catch (error) {
    console.warn('IndexedDB setItem error:', error);
    throw error;
  }
}

/**
 * Remove item from IndexedDB
 */
export async function removeItem(key: string): Promise<void> {
  try {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to remove item: ${key}`));
      };
    });
  } catch (error) {
    console.warn('IndexedDB removeItem error:', error);
    throw error;
  }
}

/**
 * Clear all items from IndexedDB
 */
export async function clear(): Promise<void> {
  try {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to clear IndexedDB'));
      };
    });
  } catch (error) {
    console.warn('IndexedDB clear error:', error);
    throw error;
  }
}

/**
 * Get all keys from IndexedDB
 */
export async function getAllKeys(): Promise<string[]> {
  try {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        resolve(request.result as string[]);
      };

      request.onerror = () => {
        reject(new Error('Failed to get all keys'));
      };
    });
  } catch (error) {
    console.warn('IndexedDB getAllKeys error:', error);
    return [];
  }
}

/**
 * Check if IndexedDB is available
 */
export function isAvailable(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

/**
 * Get storage size estimate (approximate)
 */
export async function getStorageSize(): Promise<number> {
  if (!isAvailable()) return 0;

  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const items = request.result;
        const size = JSON.stringify(items).length;
        resolve(size);
      };

      request.onerror = () => {
        resolve(0);
      };
    });
  } catch (error) {
    return 0;
  }
}
