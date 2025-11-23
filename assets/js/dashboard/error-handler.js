/**
 * Error Handler & Retry Utility
 * Best Practice: Error boundaries e retry mechanism con exponential backoff
 * Paper Accademico: "Error Handling Patterns" (2024)
 */

import { showToast } from "./toast.js";

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Promise that resolves when function succeeds or max retries reached
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry = null,
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, error, delay);
      }

      // Wait before retry with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Increase delay for next retry (exponential backoff)
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  // All retries failed, throw last error
  throw lastError;
}

/**
 * Error boundary class for module isolation
 */
export class ErrorBoundary {
  constructor(moduleName, containerSelector) {
    this.moduleName = moduleName;
    this.containerSelector = containerSelector;
    this.onError = null;
  }

  /**
   * Wrap async function with error boundary
   * @param {Function} fn - Function to wrap
   * @param {Object} options - Options
   */
  async wrap(fn, options = {}) {
    const {
      showError = true,
      fallbackMessage = "Errore nel caricamento del modulo",
      retry = false,
      retryOptions = {},
    } = options;

    try {
      return await fn();
    } catch (error) {
      console.error(`[${this.moduleName}] Errore:`, error);

      // Call custom error handler if provided
      if (this.onError) {
        this.onError(error);
      }

      // Show error message if enabled
      if (showError) {
        const message = error.message || fallbackMessage;
        showToast(`${this.moduleName}: ${message}`, "error");
      }

      // Render error state in container
      this.renderErrorState(error, options);

      // Retry if enabled
      if (retry) {
        try {
          return await retryWithBackoff(fn, {
            ...retryOptions,
            onRetry: (attempt, err, delay) => {
              console.log(`[${this.moduleName}] Retry ${attempt} dopo ${delay}ms`);
              if (options.onRetry) {
                options.onRetry(attempt, err, delay);
              }
            },
          });
        } catch (retryError) {
          console.error(`[${this.moduleName}] Tutti i retry falliti:`, retryError);
          throw retryError;
        }
      }

      throw error;
    }
  }

  /**
   * Render error state in container
   * @param {Error} error - Error object
   * @param {Object} options - Options
   */
  renderErrorState(error, options = {}) {
    const container = typeof this.containerSelector === "string"
      ? document.querySelector(this.containerSelector)
      : this.containerSelector;

    if (!container) return;

    const { retryable = false, onRetry = null } = options;

    container.innerHTML = `
      <div class="error-state" role="alert" aria-live="assertive">
        <div class="error-state-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="error-state-title">Errore nel caricamento</div>
        <div class="error-state-message">${error.message || "Si è verificato un errore imprevisto"}</div>
        ${retryable && onRetry
      ? `<button class="btn btn-primary" onclick="(() => { ${onRetry.toString()}() })()">Riprova</button>`
      : ""
    }
      </div>
    `;
  }

  /**
   * Set custom error handler
   * @param {Function} handler - Error handler function
   */
  setErrorHandler(handler) {
    this.onError = handler;
  }
}

/**
 * Create error boundary for a module
 * @param {string} moduleName - Module name
 * @param {string|HTMLElement} containerSelector - Container selector or element
 * @returns {ErrorBoundary} Error boundary instance
 */
export function createErrorBoundary(moduleName, containerSelector) {
  return new ErrorBoundary(moduleName, containerSelector);
}

/**
 * Check if device is offline
 * @returns {boolean} True if offline
 */
export function isOffline() {
  return !navigator.onLine;
}

/**
 * Handle offline state
 */
export function handleOffline() {
  if (isOffline()) {
    showToast("Connessione internet assente. Alcune funzionalità potrebbero non essere disponibili.", "warning", 6000);
  }
}

// Listen for online/offline events
if (typeof window !== "undefined") {
  window.addEventListener("offline", handleOffline);
  window.addEventListener("online", () => {
    showToast("Connessione internet ripristinata.", "success");
  });
}

