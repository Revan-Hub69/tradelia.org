/**
 * Defer Non-Critical JavaScript
 * Best Practice: Carica JavaScript non critico dopo che la pagina è interattiva
 * Migliora TBT (Total Blocking Time) e LCP (Largest Contentful Paint)
 */

/**
 * Defer function execution until page is interactive
 * Uses requestIdleCallback with fallback to setTimeout
 */
export function deferNonCritical(callback: () => void, delay: number = 0) {
  if (typeof window === 'undefined') {
    return;
  }

  // Use requestIdleCallback if available (better for performance)
  if ('requestIdleCallback' in window) {
    requestIdleCallback(
      () => {
        setTimeout(callback, delay);
      },
      { timeout: 2000 } // Max wait 2s
    );
  } else {
    // Fallback to setTimeout
    setTimeout(callback, delay);
  }
}

/**
 * Defer function execution until after page load
 */
export function deferAfterLoad(callback: () => void) {
  if (typeof window === 'undefined') {
    return;
  }

  if (document.readyState === 'complete') {
    deferNonCritical(callback, 100);
  } else {
    window.addEventListener('load', () => {
      deferNonCritical(callback, 100);
    }, { once: true });
  }
}

/**
 * Defer function execution until after first paint
 */
export function deferAfterPaint(callback: () => void) {
  if (typeof window === 'undefined') {
    return;
  }

  if ('requestAnimationFrame' in window) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        deferNonCritical(callback);
      });
    });
  } else {
    deferAfterLoad(callback);
  }
}
