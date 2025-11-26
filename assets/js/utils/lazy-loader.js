/**
 * Lazy Loader Utility
 * Best Practice 2025: Dynamic imports with error handling and retry
 */

import { safeLog } from '../dashboard/security-utils.js';

/**
 * Cache for loaded modules
 */
const moduleCache = new Map();

/**
 * Pending imports to prevent duplicate loads
 */
const pendingImports = new Map();

/**
 * Load module with caching and error handling
 * @param {string} modulePath - Path to module
 * @param {object} options - Options
 * @param {boolean} options.cache - Cache the module (default: true)
 * @param {number} options.retries - Number of retries on failure (default: 1)
 * @param {number} options.retryDelay - Delay between retries in ms (default: 1000)
 * @returns {Promise<*>} Module exports
 */
export async function lazyLoad(modulePath, options = {}) {
  const {
    cache = true,
    retries = 1,
    retryDelay = 1000,
  } = options;

  // Check cache
  if (cache && moduleCache.has(modulePath)) {
    safeLog('log', `[LazyLoader] Cache hit: ${modulePath}`);
    return moduleCache.get(modulePath);
  }

  // Check if already loading
  if (pendingImports.has(modulePath)) {
    safeLog('log', `[LazyLoader] Waiting for pending import: ${modulePath}`);
    return pendingImports.get(modulePath);
  }

  // Create import promise
  const importPromise = retryImport(modulePath, retries, retryDelay)
    .then((module) => {
      // Cache if enabled
      if (cache) {
        moduleCache.set(modulePath, module);
      }
      // Remove from pending
      pendingImports.delete(modulePath);
      return module;
    })
    .catch((error) => {
      // Remove from pending on error
      pendingImports.delete(modulePath);
      throw error;
    });

  // Add to pending
  pendingImports.set(modulePath, importPromise);

  return importPromise;
}

/**
 * Retry import on failure
 * @param {string} modulePath - Path to module
 * @param {number} retries - Number of retries
 * @param {number} delay - Delay between retries
 * @returns {Promise<*>}
 */
async function retryImport(modulePath, retries, delay) {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      const module = await import(modulePath);
      safeLog('log', `[LazyLoader] Loaded: ${modulePath}`);
      return module;
    } catch (error) {
      lastError = error;
      if (i < retries) {
        safeLog('warn', `[LazyLoader] Retry ${i + 1}/${retries} for ${modulePath}`);
        await sleep(delay * (i + 1)); // Exponential backoff
      }
    }
  }
  safeLog('error', `[LazyLoader] Failed to load ${modulePath} after ${retries + 1} attempts`);
  throw lastError;
}

/**
 * Sleep utility
 * @param {number} ms - Milliseconds
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Preload module (load in background without waiting)
 * @param {string} modulePath - Path to module
 * @returns {Promise<void>}
 */
export async function preloadModule(modulePath) {
  try {
    await lazyLoad(modulePath, { cache: true });
  } catch (error) {
    safeLog('warn', `[LazyLoader] Preload failed for ${modulePath}:`, error);
  }
}

/**
 * Preload multiple modules
 * @param {string[]} modulePaths - Array of module paths
 * @returns {Promise<void>}
 */
export async function preloadModules(modulePaths) {
  const promises = modulePaths.map(path => preloadModule(path));
  await Promise.allSettled(promises);
}

/**
 * Clear module cache
 * @param {string} modulePath - Optional: specific module path, or clear all
 */
export function clearCache(modulePath = null) {
  if (modulePath) {
    moduleCache.delete(modulePath);
    safeLog('log', `[LazyLoader] Cleared cache for: ${modulePath}`);
  } else {
    moduleCache.clear();
    safeLog('log', '[LazyLoader] Cleared all cache');
  }
}

/**
 * Get cache stats
 * @returns {object} Cache statistics
 */
export function getCacheStats() {
  return {
    cached: moduleCache.size,
    pending: pendingImports.size,
    modules: Array.from(moduleCache.keys()),
  };
}

