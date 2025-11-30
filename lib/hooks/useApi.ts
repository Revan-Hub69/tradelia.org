/**
 * Custom hook for API calls with retry, caching, and error handling
 * Based on React Query patterns
 *
 * Features:
 * - Centralized 401 handling with automatic redirect to login
 * - Automatic retry after authentication
 * - Integration with global auth state
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { retryWithBackoff, isRetryableError } from "./useRetry";
import { authenticatedFetch, registerAuthRetry } from "@/lib/api/fetch-client";
import { useAuthState } from "./useAuthState";

export interface UseApiOptions<T> {
  enabled?: boolean;
  retry?: boolean;
  retryOptions?: {
    maxRetries?: number;
    initialDelay?: number;
  };
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  cacheTime?: number; // milliseconds
  requireAuth?: boolean; // If false, allows requests even when not authenticated (default: true)
}

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  retry: () => Promise<void>;
}

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number; cacheTime: number }>();

function getCacheKey(url: string, options?: RequestInit): string {
  return `${url}:${JSON.stringify(options)}`;
}

function getCachedData<T>(key: string, cacheTime: number): T | null {
  const cached = cache.get(key);
  if (!cached) {
    return null;
  }

  const age = Date.now() - cached.timestamp;
  if (age > cacheTime) {
    cache.delete(key);
    return null;
  }

  return cached.data as T;
}

function setCachedData<T>(key: string, data: T, cacheTime: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    cacheTime,
  });
}

export function useApi<T>(
  url: string | null,
  options?: RequestInit & UseApiOptions<T>
): UseApiResult<T> {
  const {
    enabled = true,
    retry: shouldRetry = true,
    retryOptions,
    onSuccess,
    onError,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    requireAuth = true, // Default: require authentication
    ...fetchOptions
  } = options || {};

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUrlRef = useRef<string | null>(null); // Track URL changes
  const hasFailedRef = useRef<boolean>(false); // Track if request failed due to 401

  // Get global auth state (only if requireAuth is true)
  const authState = requireAuth ? useAuthState() : { isAuthenticated: true, isLoading: false };
  const { isAuthenticated, isLoading: authLoading } = authState;

  // Use refs to avoid dependency issues
  const isAuthenticatedRef = useRef(isAuthenticated);
  const authLoadingRef = useRef(authLoading);

  // Update refs when state changes
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
    authLoadingRef.current = authLoading;
  }, [isAuthenticated, authLoading]);

  // Reset failed flag when URL changes
  useEffect(() => {
    if (url !== lastUrlRef.current) {
      hasFailedRef.current = false;
      lastUrlRef.current = url;
    }
  }, [url]);

  // Automatic retry after authentication
  useEffect(() => {
    // If user just authenticated and we had a failed request, retry
    if (requireAuth && isAuthenticated && !authLoading && hasFailedRef.current && url) {
      hasFailedRef.current = false;
      // Small delay to ensure auth state is fully propagated
      const timer = setTimeout(() => {
        // Use ref to get latest fetchData
        if (isAuthenticatedRef.current && !authLoadingRef.current) {
          fetchData();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authLoading, url, requireAuth]);

  const fetchData = useCallback(async () => {
    // Don't make requests if disabled or no URL
    if (!url || !enabled) {
      return;
    }

    // Don't block requests based on auth state
    // Let authenticatedFetch handle 401 errors and redirect
    // This allows retry mechanism to work properly
    // If requireAuth is false, we make the request anyway
    // If requireAuth is true, authenticatedFetch will handle 401

    // Check cache
    const cacheKey = getCacheKey(url, fetchOptions);
    const cached = getCachedData<T>(cacheKey, cacheTime);
    if (cached) {
      setData(cached);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const fetchFn = async () => {
        // Use authenticated fetch only if auth is required
        // For public APIs, use regular fetch
        const fetchFunction = requireAuth ? authenticatedFetch : fetch;

        const response = await fetchFunction(url, {
          ...fetchOptions,
          signal: abortControllerRef.current?.signal,
        });

        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
          (error as Error & { status?: number }).status = response.status;
          throw error;
        }

        const json = await response.json();
        return json.data || json;
      };

      const result = shouldRetry
        ? await retryWithBackoff(fetchFn, {
            ...retryOptions,
            retryable: isRetryableError,
          })
        : await fetchFn();

      setData(result);
      setCachedData(cacheKey, result, cacheTime);

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: unknown) {
      // Ignore abort errors
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      const error = err instanceof Error ? err : new Error(String(err));

      // Track 401 errors for automatic retry after login
      // Only if auth is required (public APIs don't need retry)
      const errorWithStatus = err as Error & { status?: number };
      if (errorWithStatus?.status === 401 && requireAuth) {
        hasFailedRef.current = true;
        // Register retry callback for automatic retry after authentication
        registerAuthRetry(() => {
          hasFailedRef.current = false;
          fetchData();
        });
      }

      setError(error);

      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [
    url,
    enabled,
    shouldRetry,
    cacheTime,
    requireAuth,
    JSON.stringify(fetchOptions),
    onSuccess,
    onError,
  ]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const refetch = useCallback(async () => {
    // Reset failed flag on manual refetch
    hasFailedRef.current = false;
    // Clear cache
    if (url) {
      const cacheKey = getCacheKey(url, fetchOptions);
      cache.delete(cacheKey);
    }
    await fetchData();
  }, [url, fetchData, JSON.stringify(fetchOptions)]);

  const retry = useCallback(async () => {
    // Reset failed flag on manual retry
    hasFailedRef.current = false;
    setError(null);
    await fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    retry,
  };
}
