/**
 * Development Debugging Tools
 * Utilities per debugging in development
 * 
 * Riferimento: Developer Experience Best Practices
 */

/**
 * Debug flag - solo in development
 */
export const isDebugMode = process.env.NODE_ENV === 'development';

/**
 * Debug log (solo in development)
 */
export function debugLog(message: string, ...args: unknown[]): void {
  if (isDebugMode) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
}

/**
 * Debug component render
 */
export function debugRender(componentName: string, props?: Record<string, unknown>): void {
  if (isDebugMode) {
    console.log(`[RENDER] ${componentName}`, props || {});
  }
}

/**
 * Debug API call
 */
export function debugApiCall(endpoint: string, method: string, data?: unknown): void {
  if (isDebugMode) {
    console.log(`[API] ${method} ${endpoint}`, data || {});
  }
}

/**
 * Debug state change
 */
export function debugState(componentName: string, stateName: string, value: unknown): void {
  if (isDebugMode) {
    console.log(`[STATE] ${componentName}.${stateName}`, value);
  }
}

/**
 * Performance measurement
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> | T {
  if (!isDebugMode) {
    return fn();
  }

  const start = performance.now();
  const result = fn();

  if (result instanceof Promise) {
    return result.then((value) => {
      const duration = performance.now() - start;
      console.log(`[PERF] ${name}: ${duration.toFixed(2)}ms`);
      return value;
    });
  }

  const duration = performance.now() - start;
  console.log(`[PERF] ${name}: ${duration.toFixed(2)}ms`);
  return result;
}

/**
 * Debug hook for React components
 */
export function useDebug(componentName: string, props?: Record<string, unknown>): void {
  if (isDebugMode && typeof window !== 'undefined') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { useEffect } = require('react');
    useEffect(() => {
      debugRender(componentName, props);
    }, [componentName, props]);
  }
}

