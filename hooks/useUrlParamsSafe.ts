/**
 * useUrlParamsSafe - Best Practice 2026 (Fixed)
 * 
 * Versione corretta che gestisce correttamente:
 * - SSR/CSR differences
 * - Suspense boundaries
 * - Error handling
 * - Type safety
 */

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo, useEffect, useState } from 'react';

export function useUrlParamsSafe<T extends Record<string, string | undefined>>(
  defaultParams: T
): [T, (params: Partial<T>) => void, boolean] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isReady, setIsReady] = useState(false);

  // Wait for client-side hydration
  useEffect(() => {
    setIsReady(true);
  }, []);

  const params = useMemo(() => {
    if (!isReady) return defaultParams;
    
    const result = { ...defaultParams };
    try {
      searchParams.forEach((value, key) => {
        if (key in defaultParams) {
          (result as any)[key] = value;
        }
      });
    } catch (error) {
      console.error('Error parsing URL params:', error);
    }
    return result as T;
  }, [searchParams, defaultParams, isReady]);

  const setParams = useCallback(
    (newParams: Partial<T>) => {
      if (!isReady) return;
      
      try {
        const current = new URLSearchParams(searchParams.toString());
        
        Object.entries(newParams).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '') {
            current.delete(key);
          } else {
            current.set(key, String(value));
          }
        });

        const queryString = current.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
        
        router.replace(newUrl, { scroll: false });
      } catch (error) {
        console.error('Error updating URL params:', error);
      }
    },
    [router, pathname, searchParams, isReady]
  );

  return [params, setParams, isReady];
}
