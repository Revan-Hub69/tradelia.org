/**
 * Preload Strategy Utility
 * Best Practice 2025: Intelligent preloading based on user behavior
 */

import { safeLog } from '../dashboard/security-utils.js';

/**
 * Preload configuration
 */
const PRELOAD_CONFIG = {
  // Moduli da preloadare sempre (critici)
  critical: [
    '/assets/js/dashboard/security-utils.js',
    '/assets/js/dashboard/app.js',
  ],
  
  // Moduli da preloadare in base alla route
  routeBased: {
    dashboard: [
      '/assets/js/dashboard/overview.js',
      '/assets/js/dashboard/reports.js',
    ],
    education: [
      '/assets/js/dashboard/education.js',
      '/assets/js/dashboard/education-onboarding.js',
      '/assets/js/dashboard/education-toolbar.js',
    ],
    reports: [
      '/assets/js/dashboard/reports.js',
      '/assets/js/dashboard/frameworks.js',
    ],
  },
  
  // Moduli da preloadare dopo idle (non critici)
  idle: [
    '/assets/js/dashboard/education-gamification.js',
    '/assets/js/dashboard/education-analytics.js',
  ],
};

/**
 * Get current route from URL
 * @returns {string} Current route
 */
function getCurrentRoute() {
  const path = window.location.pathname;
  if (path.includes('dashboard')) return 'dashboard';
  if (path.includes('education') || path.includes('formazione')) return 'education';
  if (path.includes('report')) return 'reports';
  return 'home';
}

/**
 * Preload module using link rel="modulepreload"
 * @param {string} modulePath - Path to module
 */
function preloadModuleLink(modulePath) {
  if (document.querySelector(`link[rel="modulepreload"][href="${modulePath}"]`)) {
    return; // Already preloaded
  }

  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = modulePath;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
  
  safeLog('log', `[PreloadStrategy] Preloaded: ${modulePath}`);
}

/**
 * Preload critical modules
 */
export function preloadCritical() {
  PRELOAD_CONFIG.critical.forEach(module => {
    preloadModuleLink(module);
  });
}

/**
 * Preload modules based on current route
 */
export function preloadRouteBased() {
  const route = getCurrentRoute();
  const modules = PRELOAD_CONFIG.routeBased[route] || [];
  
  modules.forEach(module => {
    preloadModuleLink(module);
  });
  
  safeLog('log', `[PreloadStrategy] Preloaded ${modules.length} modules for route: ${route}`);
}

/**
 * Preload modules after idle time
 * @param {number} idleTime - Idle time in ms before preload (default: 2000)
 */
export function preloadOnIdle(idleTime = 2000) {
  if (!('requestIdleCallback' in window)) {
    // Fallback per browser senza requestIdleCallback
    setTimeout(() => {
      PRELOAD_CONFIG.idle.forEach(module => {
        preloadModuleLink(module);
      });
    }, idleTime);
    return;
  }

  requestIdleCallback(() => {
    PRELOAD_CONFIG.idle.forEach(module => {
      preloadModuleLink(module);
    });
    safeLog('log', `[PreloadStrategy] Preloaded ${PRELOAD_CONFIG.idle.length} idle modules`);
  }, { timeout: idleTime });
}

/**
 * Preload module on hover (predictive preloading)
 * @param {HTMLElement} element - Element to watch
 * @param {string} modulePath - Module to preload
 */
export function preloadOnHover(element, modulePath) {
  if (!element) return;

  let timeout;
  element.addEventListener('mouseenter', () => {
    timeout = setTimeout(() => {
      preloadModuleLink(modulePath);
    }, 100); // Preload dopo 100ms di hover
  });

  element.addEventListener('mouseleave', () => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });
}

/**
 * Initialize preload strategy
 */
export function initPreloadStrategy() {
  // Preload critical modules immediately
  preloadCritical();

  // Preload route-based modules after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadRouteBased);
  } else {
    preloadRouteBased();
  }

  // Preload idle modules after page load
  if (document.readyState === 'complete') {
    preloadOnIdle();
  } else {
    window.addEventListener('load', () => {
      preloadOnIdle();
    });
  }

  safeLog('log', '[PreloadStrategy] Initialized');
}

/**
 * Add module to preload list
 * @param {string} modulePath - Module path
 * @param {string} category - Category (critical, routeBased, idle)
 * @param {string} route - Route name (for routeBased)
 */
export function addToPreloadList(modulePath, category = 'idle', route = null) {
  if (category === 'critical') {
    PRELOAD_CONFIG.critical.push(modulePath);
  } else if (category === 'routeBased' && route) {
    if (!PRELOAD_CONFIG.routeBased[route]) {
      PRELOAD_CONFIG.routeBased[route] = [];
    }
    PRELOAD_CONFIG.routeBased[route].push(modulePath);
  } else {
    PRELOAD_CONFIG.idle.push(modulePath);
  }
}

