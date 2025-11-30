/**
 * Custom hook for API calls with retry, caching, and error handling
 * Based on React Query patterns
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { retryWithBackoff, isRetryableError } from './useRetry';

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
}

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  retry: () => Promise<void>;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number; cacheTime: number }>();

function getCacheKey(url: string, options?: RequestInit): string {
  return `${url}:${JSON.stringify(options)}`;
}

function getCachedData<T>(key: string, cacheTime: number): T | null {
  const cached = cache.get(key);
  if (!cached) return null;

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
    ...fetchOptions
  } = options || {};

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!url || !enabled) return;

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
        const response = await fetch(url, {
          ...fetchOptions,
          signal: abortControllerRef.current?.signal,
        });

        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
          (error as any).status = response.status;
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
    } catch (err: any) {
      // Ignore abort errors
      if (err.name === 'AbortError') {
        return;
      }

      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);

      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [url, enabled, shouldRetry, cacheTime, JSON.stringify(fetchOptions), onSuccess, onError]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const refetch = useCallback(async () => {
    // Clear cache
    if (url) {
      const cacheKey = getCacheKey(url, fetchOptions);
      cache.delete(cacheKey);
    }
    await fetchData();
  }, [url, fetchData, JSON.stringify(fetchOptions)]);

  const retry = useCallback(async () => {
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

