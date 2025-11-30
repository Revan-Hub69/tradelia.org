/**
 * Centralized HTTP client with 401 interceptor
 * Handles authentication errors globally and redirects to login
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
  if (response.status === 401) {
    // Only redirect once to avoid multiple redirects
    if (!isRedirectingToLogin) {
      isRedirectingToLogin = true;

      // Get current path for redirect after login
      const currentPath = window.location.pathname;
      const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;

      // Dispatch event for components to handle
      window.dispatchEvent(
        new CustomEvent("auth:unauthorized", {
          detail: { redirectUrl, currentPath },
        })
      );

      // Redirect to login
      if (typeof window !== "undefined") {
        window.location.href = redirectUrl;
      }
    }

    // Throw error to stop request processing
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
