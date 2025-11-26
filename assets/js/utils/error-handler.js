/**
 * Centralized Error Handler
 * Best Practice 2025: Consistent error handling across all modules
 */

import { safeLog } from '../dashboard/security-utils.js';

/**
 * Error types for categorization
 */
export const ErrorType = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTH: 'auth',
  PERMISSION: 'permission',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  UNKNOWN: 'unknown',
};

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * Determine error type from error object
 * @param {Error|*} error - Error object
 * @returns {string} Error type
 */
function getErrorType(error) {
  if (!error) return ErrorType.UNKNOWN;

  const message = String(error.message || error).toLowerCase();
  const status = error.status || error.statusCode;

  // Network errors
  if (
    error instanceof TypeError && message.includes('fetch') ||
    message.includes('network') ||
    message.includes('failed to fetch') ||
    status === 0
  ) {
    return ErrorType.NETWORK;
  }

  // HTTP status codes
  if (status === 401 || status === 403) return ErrorType.AUTH;
  if (status === 403) return ErrorType.PERMISSION;
  if (status === 404) return ErrorType.NOT_FOUND;
  if (status >= 500) return ErrorType.SERVER;
  if (status >= 400) return ErrorType.VALIDATION;

  return ErrorType.UNKNOWN;
}

/**
 * Determine error severity
 * @param {string} errorType - Error type
 * @param {Error|*} error - Error object
 * @returns {string} Error severity
 */
function getErrorSeverity(errorType, error) {
  if (errorType === ErrorType.NETWORK || errorType === ErrorType.SERVER) {
    return ErrorSeverity.HIGH;
  }
  if (errorType === ErrorType.AUTH || errorType === ErrorType.PERMISSION) {
    return ErrorSeverity.MEDIUM;
  }
  if (errorType === ErrorType.NOT_FOUND) {
    return ErrorSeverity.LOW;
  }
  return ErrorSeverity.MEDIUM;
}

/**
 * Get user-friendly error message
 * @param {Error} _error - Error object (unused, for future use)
 * @param {string} errorType - Error type
 * @param {Error|*} error - Error object
 * @returns {string} User-friendly message
 */
function getUserMessage(errorType, error) {
  const defaultMessages = {
    [ErrorType.NETWORK]: 'Errore di connessione. Verifica la tua connessione internet e riprova.',
    [ErrorType.AUTH]: 'Sessione scaduta. Effettua nuovamente il login.',
    [ErrorType.PERMISSION]: 'Non hai i permessi per eseguire questa operazione.',
    [ErrorType.NOT_FOUND]: 'Risorsa non trovata.',
    [ErrorType.VALIDATION]: 'Dati non validi. Verifica i campi inseriti.',
    [ErrorType.SERVER]: 'Errore del server. Riprova più tardi.',
    [ErrorType.UNKNOWN]: 'Si è verificato un errore. Riprova più tardi.',
  };

  // Try to extract user-friendly message from error
  if (error?.userMessage) {
    return error.userMessage;
  }

  if (error?.message && !error.message.includes('Error:') && !error.message.includes('TypeError')) {
    return error.message;
  }

  return defaultMessages[errorType] || defaultMessages[ErrorType.UNKNOWN];
}

/**
 * Centralized error handler
 * @param {Error|*} error - Error to handle
 * @param {string} context - Context where error occurred (module name)
 * @param {object} options - Options
 * @param {boolean} options.showToUser - Show error to user (default: true)
 * @param {boolean} options.logError - Log error (default: true)
 * @param {Function} options.onError - Custom error handler
 * @returns {object} Error info object
 */
export function handleError(error, context = 'Unknown', options = {}) {
  const {
    showToUser = true,
    logError = true,
    onError = null,
  } = options;

  const errorType = getErrorType(error);
  const severity = getErrorSeverity(errorType, error);
  const userMessage = getUserMessage(errorType, error);

  const errorInfo = {
    type: errorType,
    severity,
    message: userMessage,
    originalError: error,
    context,
    timestamp: new Date().toISOString(),
  };

  // Log error
  if (logError) {
    safeLog('error', `[${context}]`, errorInfo);
  }

  // Custom handler
  if (onError && typeof onError === 'function') {
    onError(errorInfo);
    return errorInfo;
  }

  // Show to user (if toast available)
  if (showToUser && typeof window !== 'undefined' && window.showToast) {
    window.showToast(userMessage, 'error');
  } else if (showToUser && typeof window !== 'undefined' && window.console) {
    // Fallback to console in development
    if (!window.location?.hostname?.includes('tradelia.org')) {
      console.error(`[${context}]`, userMessage, error);
    }
  }

  return errorInfo;
}

/**
 * Async error wrapper - automatically handles errors in async functions
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Context name
 * @param {object} options - Options
 * @returns {Function} Wrapped function
 */
export function withErrorHandling(fn, context = 'Unknown', options = {}) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context, options);
      throw error; // Re-throw for caller to handle if needed
    }
  };
}

/**
 * Create error handler for specific context
 * @param {string} context - Context name
 * @param {object} defaultOptions - Default options
 * @returns {Function} Error handler function
 */
export function createErrorHandler(context, defaultOptions = {}) {
  return (error, options = {}) => {
    return handleError(error, context, { ...defaultOptions, ...options });
  };
}

