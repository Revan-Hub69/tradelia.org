/**
 * Centralized HTTP client with 401 interceptor
 * Handles authentication errors globally WITHOUT redirecting to login
 * Allows guest access - components handle what to show based on session
 */

let isRedirectingToLogin = false;
let pendingRequests: Array<() => void> = [];

/**
 * Reset redirect flag (useful after successful login)
 */
export async function resetAuthState() {
  isRedirectingToLogin = false;
  // Retry all pending requests sequentially to avoid race conditions
  const requests = [...pendingRequests];
  pendingRequests = [];

  // Execute retries with small delay between them
  for (let i = 0; i < requests.length; i++) {
    try {
      await new Promise((resolve) => setTimeout(resolve, i * 50)); // 50ms delay between retries
      requests[i]();
    } catch (error) {
      // Ignore errors in retry callbacks
      console.warn("Error in auth retry callback:", error);
    }
  }
}

/**
 * Reset redirect flag when on login page (prevents loops)
 */
export function resetRedirectFlag() {
  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;
    const isOnLoginPage =
      currentPath === "/login" ||
      currentPath.startsWith("/login/") ||
      currentPath.startsWith("/en/login");
    if (isOnLoginPage) {
      isRedirectingToLogin = false;
    }
  }
}

/**
 * Authenticated fetch wrapper with 401 handling
 *
 * @param url - Request URL
 * @param options - Fetch options
 * @returns Promise<Response>
 * @throws Error if request fails with 401
 */
export async function authenticatedFetch(url: string, options?: RequestInit): Promise<Response> {
  const response = await fetch(url, options);

  // Handle 401 Unauthorized globally
  // NON fare redirect al login - permettere accesso guest
  // I componenti gestiranno cosa mostrare in base alla sessione
  if (response.status === 401) {
    // Log l'errore ma NON fare redirect
    if (typeof window !== "undefined") {
      const { logError } = require('@/lib/monitoring/error-logger');
      logError('401 Unauthorized - No redirect to login', undefined, {
        path: window.location.pathname,
        metadata: {
          url: response.url,
          status: response.status,
        },
      });
    }
    
    // Dispatch event per i componenti (senza redirect)
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("auth:unauthorized", {
          detail: { 
            currentPath: window.location.pathname,
            // NON includere redirectUrl per evitare redirect
          },
        })
      );
    }
    
    // NON fare redirect, solo lancia errore
    // I componenti gestiranno l'errore mostrando contenuto guest
    const error = new Error("Unauthorized");
    (error as Error & { status?: number }).status = 401;
    throw error;
  }

  return response;
}

/**
 * Register a callback to retry after authentication
 * Used by useApi to retry failed requests after login
 */
export function registerAuthRetry(callback: () => void) {
  if (isRedirectingToLogin) {
    pendingRequests.push(callback);
  }
}

/**
 * Check if we're currently redirecting to login
 */
export function isRedirecting(): boolean {
  return isRedirectingToLogin;
}
