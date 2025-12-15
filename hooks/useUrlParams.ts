/**
 * useUrlParams Hook - Best Practice 2026
 * 
 * Sincronizza stato con URL params per:
 * - Condivisione link
 * - Browser back/forward
 * - SEO-friendly URLs
 */

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export function useUrlParams<T extends Record<string, string | undefined>>(
  defaultParams: T
): [T, (params: Partial<T>) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo(() => {
    const result = { ...defaultParams };
    searchParams.forEach((value, key) => {
      if (key in defaultParams) {
        (result as any)[key] = value;
      }
    });
    return result as T;
  }, [searchParams, defaultParams]);

  const setParams = useCallback(
    (newParams: Partial<T>) => {
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
    },
    [router, pathname, searchParams]
  );

  return [params, setParams];
}
