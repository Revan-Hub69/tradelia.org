/**
 * Unified Storage System
 * 
 * Best Practice 2025: Centralized storage management
 * - IndexedDB for large data (chat, favorites, etc.)
 * - localStorage for small data (preferences, consents, etc.)
 * - Automatic fallback and error handling
 * - Unified API
 */

import { getItem as getIndexedDBItem, setItem as setIndexedDBItem, removeItem as removeIndexedDBItem, isAvailable as isIndexedDBAvailable } from './indexedDB';

// Keys that should use IndexedDB (large data)
const INDEXEDDB_KEYS = [
  'tradelia-ai-chat-messages',
  'tradelia_favorites',
  'tradelia-watchlist',
  'tradelia-portfolio',
  'tradelia-trading-journal',
];

// Keys that should use localStorage (small data, preferences, UI state)
const LOCALSTORAGE_KEYS = [
  'analytics_consent',
  'oslo_locale',
  'tradelia-currency',
  'tradelia_exchange_rate', // Cache API
  'gamification-daily-check',
  'account-banner-dismissed',
  'pwa-install-dismissed',
  'welcome-tour-completed',
  'tradelia-legal-consent',
];

// Keys that need Supabase sync (user data that should be on server)
const SUPABASE_SYNC_KEYS = [
  'tradelia_favorites', // OBBLIGATORIO - dati utente
  'tradelia-legal-consent', // OBBLIGATORIO - audit trail legale
  'oslo_locale', // OPZIONALE - user preferences
  'tradelia-currency', // OPZIONALE - user preferences
  'tradelia-ai-chat-messages', // OPZIONALE - backup per utenti loggati
  'gamification-daily-check', // OPZIONALE - per gamification stats
];

/**
 * Determine which storage to use based on key
 */
function shouldUseIndexedDB(key: string): boolean {
  // Explicit IndexedDB keys
  if (INDEXEDDB_KEYS.some(k => key.startsWith(k))) {
    return true;
  }
  
  // Explicit localStorage keys
  if (LOCALSTORAGE_KEYS.some(k => key.startsWith(k))) {
    return false;
  }
  
  // Default: use IndexedDB for keys that look like they contain large data
  // (contains 'messages', 'history', 'data', 'cache' with size > 1KB estimate)
  const largeDataPatterns = ['messages', 'history', 'cache', 'data', 'favorites', 'portfolio'];
  return largeDataPatterns.some(pattern => key.toLowerCase().includes(pattern));
}

/**
 * Get item from appropriate storage
 */
export async function getItem<T = any>(key: string): Promise<T | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const useIndexedDB = shouldUseIndexedDB(key);

  if (useIndexedDB && isIndexedDBAvailable()) {
    try {
      return await getIndexedDBItem<T>(key);
    } catch (error) {
      console.warn(`IndexedDB getItem failed for ${key}, falling back to localStorage:`, error);
      // Fallback to localStorage
    }
  }

  // Use localStorage (either by choice or as fallback)
  try {
    const item = localStorage.getItem(key);
    if (item === null) return null;
    return JSON.parse(item);
  } catch (error) {
    console.warn(`localStorage getItem failed for ${key}:`, error);
    return null;
  }
}

/**
 * Set item in appropriate storage
 * Automatically syncs to Supabase if needed
 */
export async function setItem<T = any>(key: string, value: T, options?: { skipSync?: boolean }): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const useIndexedDB = shouldUseIndexedDB(key);

  if (useIndexedDB && isIndexedDBAvailable()) {
    try {
      await setIndexedDBItem(key, value);
    } catch (error) {
      console.warn(`IndexedDB setItem failed for ${key}, falling back to localStorage:`, error);
      // Fallback to localStorage
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          console.warn(`localStorage quota exceeded for ${key}`);
          throw new Error('Storage quota exceeded');
        }
        throw e;
      }
    }
  } else {
    // Use localStorage (either by choice or as fallback)
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn(`localStorage quota exceeded for ${key}`);
        throw new Error('Storage quota exceeded');
      }
      console.warn(`localStorage setItem failed for ${key}:`, error);
      throw error;
    }
  }

  // Auto-sync to Supabase if needed (async, non-blocking)
  if (!options?.skipSync) {
    // Import dynamically to avoid circular dependencies
    import('./sync').then(({ autoSync }) => {
      autoSync(key, value).catch(err => {
        console.warn(`Background sync failed for ${key}:`, err);
      });
    });
  }
}

/**
 * Remove item from appropriate storage
 */
export async function removeItem(key: string): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const useIndexedDB = shouldUseIndexedDB(key);

  // Try both storages to ensure cleanup
  if (useIndexedDB && isIndexedDBAvailable()) {
    try {
      await removeIndexedDBItem(key);
    } catch (error) {
      console.warn(`IndexedDB removeItem failed for ${key}:`, error);
    }
  }

  // Also try localStorage (might have been migrated)
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`localStorage removeItem failed for ${key}:`, error);
  }
}

/**
 * Synchronous get (localStorage only, for SSR compatibility)
 */
export function getItemSync<T = any>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // Only use localStorage for sync operations
  if (LOCALSTORAGE_KEYS.some(k => key.startsWith(k))) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return null;
      return JSON.parse(item);
    } catch (error) {
      console.warn(`localStorage getItemSync failed for ${key}:`, error);
      return null;
    }
  }

  // For IndexedDB keys, return null (must use async getItem)
  return null;
}

/**
 * Synchronous set (localStorage only, for SSR compatibility)
 */
export function setItemSync<T = any>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Only use localStorage for sync operations
  if (LOCALSTORAGE_KEYS.some(k => key.startsWith(k))) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn(`localStorage quota exceeded for ${key}`);
        throw new Error('Storage quota exceeded');
      }
      console.warn(`localStorage setItemSync failed for ${key}:`, error);
      throw error;
    }
  } else {
    console.warn(`setItemSync called for IndexedDB key ${key}, use async setItem instead`);
  }
}

/**
 * Check if storage is available
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return 'localStorage' in window || isIndexedDBAvailable();
}
