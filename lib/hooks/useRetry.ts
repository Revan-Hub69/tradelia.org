/**
 * Custom hook for retry logic with exponential backoff
 * Based on exponential backoff algorithm
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryable?: (error: any) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryable: () => true,
};

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      if (!opts.retryable(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === opts.maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffFactor, attempt),
        opts.maxDelay
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Custom hook for retry logic in React components
 */
export function useRetry() {
  const retry = async <T,>(
    fn: () => Promise<T>,
    options?: RetryOptions
  ): Promise<T> => {
    return retryWithBackoff(fn, options);
  };

  return { retry };
}

/**
 * Check if error is network-related and retryable
 */
export function isRetryableError(error: any): boolean {
  // Network errors
  if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
    return true;
  }

  // HTTP 5xx errors (server errors)
  if (error?.status >= 500 && error?.status < 600) {
    return true;
  }

  // HTTP 429 (rate limit) - retryable
  if (error?.status === 429) {
    return true;
  }

  // HTTP 408 (timeout) - retryable
  if (error?.status === 408) {
    return true;
  }

  // Don't retry 4xx errors (client errors)
  if (error?.status >= 400 && error?.status < 500) {
    return false;
  }

  return false;
}

