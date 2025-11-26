/**
 * Centralized API Client
 * Best Practice 2025: Single source of truth for API calls
 * Features: Retry, deduplication, interceptors, error handling
 */

import { handleError } from './error-handler.js';
import { safeLog } from '../dashboard/security-utils.js';

/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
  timeout: 30000, // 30 seconds
  retries: 2,
  retryDelay: 1000, // 1 second
  deduplicationWindow: 5000, // 5 seconds
};

/**
 * Pending requests cache for deduplication
 */
const pendingRequests = new Map();

/**
 * Request interceptor
 * @type {Function[]}
 */
const requestInterceptors = [];

/**
 * Response interceptor
 * @type {Function[]}
 */
const responseInterceptors = [];

/**
 * Add request interceptor
 * @param {Function} interceptor - Interceptor function
 */
export function addRequestInterceptor(interceptor) {
  requestInterceptors.push(interceptor);
}

/**
 * Add response interceptor
 * @param {Function} interceptor - Interceptor function
 */
export function addResponseInterceptor(interceptor) {
  responseInterceptors.push(interceptor);
}

/**
 * Create request key for deduplication
 * @param {string} url - Request URL
 * @param {object} options - Request options
 * @returns {string} Request key
 */
function createRequestKey(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.stringify(options.body) : '';
  return `${method}:${url}:${body}`;
}

/**
 * Sleep utility for retry delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute request with timeout
 * @param {string} url - Request URL
 * @param {object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>}
 */
function fetchWithTimeout(url, options = {}, timeout = DEFAULT_CONFIG.timeout) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    ),
  ]);
}

/**
 * Retry request on failure
 * @param {Function} fn - Function to retry
 * @param {number} retries - Number of retries
 * @param {number} delay - Delay between retries
 * @returns {Promise}
 */
async function retry(fn, retries = DEFAULT_CONFIG.retries, delay = DEFAULT_CONFIG.retryDelay) {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < retries) {
        safeLog('warn', `[API Client] Retry ${i + 1}/${retries}`, error);
        await sleep(delay * (i + 1)); // Exponential backoff
      }
    }
  }
  throw lastError;
}

/**
 * Main API request function
 * @param {string} url - Request URL
 * @param {object} options - Fetch options
 * @param {object} config - Request configuration
 * @returns {Promise<Response>}
 */
export async function apiRequest(url, options = {}, config = {}) {
  const {
    timeout = DEFAULT_CONFIG.timeout,
    retries = DEFAULT_CONFIG.retries,
    deduplicate = true,
    skipInterceptors = false,
  } = { ...DEFAULT_CONFIG, ...config };

  // Apply request interceptors
  let finalUrl = url;
  let finalOptions = { ...options };
  if (!skipInterceptors) {
    for (const interceptor of requestInterceptors) {
      const result = await interceptor(finalUrl, finalOptions);
      if (result) {
        finalUrl = result.url || finalUrl;
        finalOptions = { ...finalOptions, ...result.options };
      }
    }
  }

  // Deduplication
  if (deduplicate && (finalOptions.method || 'GET').toUpperCase() === 'GET') {
    const requestKey = createRequestKey(finalUrl, finalOptions);
    if (pendingRequests.has(requestKey)) {
      safeLog('log', `[API Client] Deduplicating request: ${requestKey}`);
      return pendingRequests.get(requestKey);
    }
  }

  // Create request promise
  const requestPromise = retry(
    () => fetchWithTimeout(finalUrl, finalOptions, timeout),
    retries
  ).then(async (response) => {
    // Apply response interceptors
    if (!skipInterceptors) {
      for (const interceptor of responseInterceptors) {
        await interceptor(response);
      }
    }

    // Remove from pending requests
    if (deduplicate) {
      const requestKey = createRequestKey(finalUrl, finalOptions);
      pendingRequests.delete(requestKey);
    }

    return response;
  }).catch((error) => {
    // Remove from pending requests on error
    if (deduplicate) {
      const requestKey = createRequestKey(finalUrl, finalOptions);
      pendingRequests.delete(requestKey);
    }
    throw error;
  });

  // Add to pending requests
  if (deduplicate && (finalOptions.method || 'GET').toUpperCase() === 'GET') {
    const requestKey = createRequestKey(finalUrl, finalOptions);
    pendingRequests.set(requestKey, requestPromise);
  }

  return requestPromise;
}

/**
 * GET request helper
 * @param {string} url - Request URL
 * @param {object} config - Request configuration
 * @returns {Promise<Response>}
 */
export function get(url, config = {}) {
  return apiRequest(url, { method: 'GET' }, config);
}

/**
 * POST request helper
 * @param {string} url - Request URL
 * @param {object} body - Request body
 * @param {object} config - Request configuration
 * @returns {Promise<Response>}
 */
export function post(url, body, config = {}) {
  return apiRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    body: JSON.stringify(body),
  }, config);
}

/**
 * PUT request helper
 * @param {string} url - Request URL
 * @param {object} body - Request body
 * @param {object} config - Request configuration
 * @returns {Promise<Response>}
 */
export function put(url, body, config = {}) {
  return apiRequest(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    body: JSON.stringify(body),
  }, config);
}

/**
 * DELETE request helper
 * @param {string} url - Request URL
 * @param {object} config - Request configuration
 * @returns {Promise<Response>}
 */
export function del(url, config = {}) {
  return apiRequest(url, { method: 'DELETE' }, config);
}

/**
 * Parse JSON response with error handling
 * @param {Response} response - Fetch response
 * @returns {Promise<*>}
 */
export async function parseJSON(response) {
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    error.status = response.status;
    error.response = response;
    throw error;
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Response is not JSON');
  }

  return response.json();
}

/**
 * API request with automatic JSON parsing and error handling
 * @param {string} url - Request URL
 * @param {object} options - Fetch options
 * @param {object} config - Request configuration
 * @returns {Promise<*>}
 */
export async function apiRequestJSON(url, options = {}, config = {}) {
  try {
    const response = await apiRequest(url, options, config);
    return await parseJSON(response);
  } catch (error) {
    handleError(error, 'API Client', { showToUser: false });
    throw error;
  }
}

